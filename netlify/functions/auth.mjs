// Simple auth function for development
import { getStore } from '@netlify/blobs';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

// Simple JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

// Simple token generation (for dev)
function generateToken(payload) {
  const header = Buffer.from(JSON.stringify({ typ: 'JWT', alg: 'HS256' })).toString('base64url');
  const payloadB64 = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 24*60*60*1000 })).toString('base64url');
  const signature = createHash('sha256').update(`${header}.${payloadB64}.${JWT_SECRET}`).digest('base64url');
  return `${header}.${payloadB64}.${signature}`;
}

// Simple token verification (for dev)
function verifyToken(token) {
  try {
    const [header, payload, signature] = token.split('.');
    const expectedSig = createHash('sha256').update(`${header}.${payload}.${JWT_SECRET}`).digest('base64url');
    if (signature !== expectedSig) return null;
    
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (decoded.exp && decoded.exp < Date.now()) return null;
    return decoded;
  } catch {
    return null;
  }
}

// Simple password hashing (for dev)
function hashPassword(password) {
  return createHash('sha256').update(password + 'salt').digest('hex');
}

// Simple password comparison (for dev)
function comparePassword(password, hash) {
  const hashedInput = createHash('sha256').update(password + 'salt').digest('hex');
  return hashedInput === hash;
}

export default async function handler(request, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (request.method === 'OPTIONS') {
    return new Response('', { status: 200, headers });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  }

  try {
    const body = await request.json();
    const { action, email, password, name, id, role } = body;

    // Local storage helpers
    const __FN_DIRNAME = dirname(fileURLToPath(import.meta.url));
    const LOCAL_DATA_DIR = join(__FN_DIRNAME, '_data');
    const LOCAL_USERS_FILE = join(LOCAL_DATA_DIR, 'users.json');

    async function readUsers() {
      // Prefer Netlify Blobs in production; fallback to local file in dev
      try {
        const store = getStore('auth');
        const json = await store.get('users.json', { type: 'json' });
        return json || { users: [] };
      } catch (e) {
        try {
          if (!existsSync(LOCAL_USERS_FILE)) {
            return { users: [] };
          }
          const content = readFileSync(LOCAL_USERS_FILE, 'utf-8');
          return JSON.parse(content || '{"users":[]}');
        } catch {
          return { users: [] };
        }
      }
    }

    async function writeUsers(data) {
      // Prefer Netlify Blobs in production; fallback to local file in dev
      try {
        const store = getStore('auth');
        await store.set('users.json', JSON.stringify(data));
        return true;
      } catch (e) {
        try {
          if (!existsSync(LOCAL_DATA_DIR)) {
            mkdirSync(LOCAL_DATA_DIR, { recursive: true });
          }
          writeFileSync(LOCAL_USERS_FILE, JSON.stringify(data, null, 2), 'utf-8');
          return true;
        } catch (err) {
          console.error('Failed writing users:', err);
          throw err;
        }
      }
    }

    // Register
    if (action === 'register') {
      if (!email || !password || !name) {
        return new Response(JSON.stringify({ error: 'Name, email, and password are required' }), { status: 400, headers });
      }

      const db = await readUsers();
      const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        return new Response(JSON.stringify({ success: false, error: 'Email already registered' }), { status: 409, headers });
      }

      const isFirstUser = db.users.length === 0;
      const role = isFirstUser ? 'admin' : 'user';
      const hash = hashPassword(password);
      const user = { 
        id: String(Date.now()), 
        name, 
        email, 
        passwordHash: hash, 
        role, 
        createdAt: Date.now(),
        phone: '',
        dob: '',
        idCard: '',
        address: '',
        successfulClimbCount: 0,
        lastClimbAt: null
      };
      
      db.users.push(user);
      await writeUsers(db);

      const token = generateToken({ userId: user.id, email: user.email, role: user.role });
      return new Response(JSON.stringify({ 
        success: true, 
        token, 
        user: { id: user.id, name: user.name, email: user.email, role: user.role } 
      }), { status: 200, headers });
    }

    // Login
    if (action === 'login' || !action) {
      if (!email || !password) {
        return new Response(JSON.stringify({ error: 'Email and password are required' }), { status: 400, headers });
      }

      const db = await readUsers();
      const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user || !comparePassword(password, user.passwordHash)) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid credentials' }), { status: 401, headers });
      }

      const token = generateToken({ userId: user.id, email: user.email, role: user.role });
      return new Response(JSON.stringify({ 
        success: true, 
        token, 
        user: { id: user.id, name: user.name, email: user.email, role: user.role } 
      }), { status: 200, headers });
    }

    // Current user info (requires token)
    if (action === 'me') {
      const authHeader = request.headers.get('authorization') || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '';
      const decoded = token ? verifyToken(token) : null;
      if (!decoded) {
        return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401, headers });
      }
      const db = await readUsers();
      const user = db.users.find(u => u.id === decoded.userId);
      if (!user) return new Response(JSON.stringify({ success:false, error:'User not found' }), { status: 404, headers });
      return new Response(JSON.stringify({ success:true, user: { id:user.id, name:user.name, email:user.email, role:user.role, phone:user.phone || '', dob:user.dob||'', idCard:user.idCard||'', address:user.address||'', successfulClimbCount:user.successfulClimbCount||0, lastClimbAt:user.lastClimbAt||null } }), { status:200, headers });
    }

    // Update current user self (name/phone/password)
    if (action === 'updateSelf') {
      const authHeader = request.headers.get('authorization') || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '';
      const decoded = token ? verifyToken(token) : null;
      if (!decoded) {
        return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401, headers });
      }
      const { name: newName, phone, dob, idCard, address, newPassword, currentPassword } = body;
      const db = await readUsers();
      const idx = db.users.findIndex(u => u.id === decoded.userId);
      if (idx === -1) return new Response(JSON.stringify({ success:false, error:'User not found' }), { status:404, headers });
      if (typeof newName === 'string' && newName.trim()) db.users[idx].name = newName.trim();
      if (typeof phone === 'string') db.users[idx].phone = phone.trim();
      if (typeof dob === 'string') db.users[idx].dob = dob.trim();
      if (typeof idCard === 'string') db.users[idx].idCard = idCard.trim();
      if (typeof address === 'string') db.users[idx].address = address.trim();
      if (typeof newPassword === 'string' && newPassword.length > 0) {
        // require current password to change
        const ok = typeof currentPassword === 'string' && comparePassword(currentPassword, db.users[idx].passwordHash);
        if (!ok) {
          return new Response(JSON.stringify({ success:false, error:'Mật khẩu hiện tại không đúng' }), { status:400, headers });
        }
        if (newPassword.length < 6) {
          return new Response(JSON.stringify({ success:false, error:'Mật khẩu mới tối thiểu 6 ký tự' }), { status:400, headers });
        }
        db.users[idx].passwordHash = hashPassword(newPassword);
      }
      await writeUsers(db);
      return new Response(JSON.stringify({ success:true }), { status:200, headers });
    }

    // List users (admin only)
    if (action === 'list') {
      const authHeader = request.headers.get('authorization') || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '';
      const decoded = token ? verifyToken(token) : null;
      if (!decoded || decoded.role !== 'admin') {
        return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401, headers });
      }
      const db = await readUsers();
      const users = db.users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt }));
      return new Response(JSON.stringify({ success: true, users }), { status: 200, headers });
    }

    // Update user (admin only)
    if (action === 'update') {
      const authHeader = request.headers.get('authorization') || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '';
      const decoded = token ? verifyToken(token) : null;
      if (!decoded || decoded.role !== 'admin') {
        return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401, headers });
      }
      if (!id) {
        return new Response(JSON.stringify({ success: false, error: 'Missing user id' }), { status: 400, headers });
      }
      const db = await readUsers();
      const idx = db.users.findIndex(u => u.id === String(id));
      if (idx === -1) {
        return new Response(JSON.stringify({ success: false, error: 'User not found' }), { status: 404, headers });
      }
      if (typeof name === 'string' && name.trim()) db.users[idx].name = name.trim();
      if (role === 'admin' || role === 'user') db.users[idx].role = role;
      await writeUsers(db);
      return new Response(JSON.stringify({ success: true }), { status: 200, headers });
    }

    // Delete user (admin only)
    if (action === 'delete') {
      const authHeader = request.headers.get('authorization') || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '';
      const decoded = token ? verifyToken(token) : null;
      if (!decoded || decoded.role !== 'admin') {
        return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401, headers });
      }
      if (!id) {
        return new Response(JSON.stringify({ success: false, error: 'Missing user id' }), { status: 400, headers });
      }
      const db = await readUsers();
      const before = db.users.length;
      db.users = db.users.filter(u => u.id !== String(id));
      if (db.users.length === before) {
        return new Response(JSON.stringify({ success: false, error: 'User not found' }), { status: 404, headers });
      }
      await writeUsers(db);
      return new Response(JSON.stringify({ success: true }), { status: 200, headers });
    }

    // Verify token
    if (action === 'verify') {
      const authHeader = request.headers.get('authorization') || '';
      if (!authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ success: false, error: 'No token provided' }), { status: 401, headers });
      }

      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      if (!decoded) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid token' }), { status: 401, headers });
      }

      return new Response(JSON.stringify({ 
        success: true, 
        valid: true, 
        role: decoded.role, 
        userId: decoded.userId, 
        email: decoded.email 
      }), { status: 200, headers });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers });

  } catch (error) {
    console.error('Auth function error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    }), { status: 500, headers });
  }
}