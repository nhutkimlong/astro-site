// @ts-check

const errorBox = document.getElementById('error');
const successBox = document.getElementById('success');
const tbody = document.getElementById('tbody');

/** @type {(msg: string) => void} */
export const showError = (msg) => { if(!errorBox) return; errorBox.textContent = msg; errorBox.classList.remove('hidden'); setTimeout(()=>errorBox.classList.add('hidden'), 4000); };
/** @type {(msg: string) => void} */
export const showSuccess = (msg) => { if(!successBox) return; successBox.textContent = msg; successBox.classList.remove('hidden'); setTimeout(()=>successBox.classList.add('hidden'), 3000); };

export const getToken = () => localStorage.getItem('authToken') || '';

/** @typedef {{id:string, name?:string, email:string, role:'user'|'admin', phone?:string, dob?:string, idCard?:string, address?:string, successfulClimbCount?:number, lastClimbAt?:string, createdAt?:number}} User */

/** @type {() => Promise<void>} */
export const loadUsers = async () => {
  // Keep existing loading UI visible, just update data in background
  try{
    const res = await fetch('/.netlify/functions/auth', { method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization': 'Bearer ' + getToken() }, body: JSON.stringify({ action: 'list' }) });
    const json = await res.json();
    if(!res.ok || !json.success) throw new Error(json.error || 'Không tải được người dùng');
    renderUsers(json.users || []);
  }catch(err){ showError(err instanceof Error ? err.message : 'Lỗi'); }
};

/** @type {(users: User[]) => void} */
export const renderUsers = (users) => {
  if(!tbody) return;
  allUsers = users; // Store users globally for modal access
  
  if(!users.length){ tbody.innerHTML = '<tr><td colspan="7" class="px-4 py-6 text-center text-slate-500">Chưa có người dùng</td></tr>'; return; }
  
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Chưa có';
    const date = new Date(timestamp);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  tbody.innerHTML = users.map((u) => `
        <tr class="hover:bg-slate-50">
          <td class="px-4 py-3 font-medium text-slate-900">${u.name || 'Chưa có tên'}</td>
          <td class="px-4 py-3 text-slate-700">${u.email}</td>
          <td class="px-4 py-3">
            <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}">
              ${u.role === 'admin' ? 'Admin' : 'User'}
            </span>
          </td>
          <td class="px-4 py-3 text-slate-700">${u.phone || 'Chưa có'}</td>
          <td class="px-4 py-3 text-slate-700">${u.successfulClimbCount || 0}</td>
          <td class="px-4 py-3 text-slate-700">${formatDate(u.lastClimbAt)}</td>
          <td class="px-4 py-3 text-right">
            <button class="px-3 py-1 bg-green-600 text-white rounded mr-2 hover:bg-green-700" onclick="editUser('${u.id}')">
              <i class="fas fa-edit"></i>
            </button>
            <button class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700" onclick="deleteUser('${u.id}')">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `).join('');
};

// Global variables for modal
let currentEditingUser = null;
let allUsers = [];

/** @type {(id: string) => Promise<void>} */
export const editUser = async (id) => {
  currentEditingUser = id;
  const user = allUsers.find(u => u.id === id);
  if (!user) {
    showError('Không tìm thấy thông tin người dùng');
    return;
  }

  // Fill modal with user data
  document.getElementById('editName').value = user.name || '';
  document.getElementById('editEmail').value = user.email || '';
  document.getElementById('editRole').value = user.role || 'user';
  document.getElementById('editPhone').value = user.phone || '';
  document.getElementById('editDob').value = user.dob || '';
  document.getElementById('editIdCard').value = user.idCard || '';
  document.getElementById('editAddress').value = user.address || '';
  document.getElementById('editClimbCount').value = user.successfulClimbCount || 0;

  // Show modal
  document.getElementById('editUserModal').classList.remove('hidden');
};

/** @type {(id: string) => Promise<void>} */
export const updateUser = async (id) => {
  try{
    const nameInput = /** @type {HTMLInputElement|null} */ (document.querySelector(`input[data-id="${id}"][data-field="name"]`));
    const roleSelect = /** @type {HTMLSelectElement|null} */ (document.querySelector(`select[data-id="${id}"][data-field="role"]`));
    const name = nameInput ? nameInput.value : '';
    const role = roleSelect ? roleSelect.value : 'user';
    const res = await fetch('/.netlify/functions/auth', { method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization': 'Bearer ' + getToken() }, body: JSON.stringify({ action:'update', id, name, role }) });
    const json = await res.json();
    if(!res.ok || !json.success) throw new Error(json.error || 'Cập nhật thất bại');
    showSuccess('Đã cập nhật người dùng');
  }catch(err){ showError(err instanceof Error ? err.message : 'Lỗi'); }
};

/** @type {(id: string) => Promise<void>} */
export const deleteUser = async (id) => {
  if(!confirm('Xóa người dùng này?')) return;
  try{
    const res = await fetch('/.netlify/functions/auth', { method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization': 'Bearer ' + getToken() }, body: JSON.stringify({ action:'delete', id }) });
    const json = await res.json();
    if(!res.ok || !json.success) throw new Error(json.error || 'Xóa thất bại');
    showSuccess('Đã xóa người dùng');
    loadUsers();
  }catch(err){ showError(err instanceof Error ? err.message : 'Lỗi'); }
};

// Modal event handlers
document.addEventListener('DOMContentLoaded', () => {
  void loadUsers();
  
  // Modal close handlers
  document.getElementById('closeEditModal')?.addEventListener('click', () => {
    document.getElementById('editUserModal').classList.add('hidden');
  });
  
  document.getElementById('cancelEdit')?.addEventListener('click', () => {
    document.getElementById('editUserModal').classList.add('hidden');
  });
  
  // Close modal on background click
  document.getElementById('editUserModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'editUserModal') {
      document.getElementById('editUserModal').classList.add('hidden');
    }
  });
  
  // Form submit handler
  document.getElementById('editUserForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentEditingUser) return;
    
    const formData = new FormData(e.target);
    const updateData = {
      name: document.getElementById('editName').value,
      role: document.getElementById('editRole').value,
      phone: document.getElementById('editPhone').value,
      dob: document.getElementById('editDob').value,
      idCard: document.getElementById('editIdCard').value,
      address: document.getElementById('editAddress').value
    };
    
    try {
      const res = await fetch('/.netlify/functions/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + getToken()
        },
        body: JSON.stringify({
          action: 'update',
          id: currentEditingUser,
          ...updateData
        })
      });
      
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Cập nhật thất bại');
      }
      
      showSuccess('Đã cập nhật thông tin người dùng');
      document.getElementById('editUserModal').classList.add('hidden');
      await loadUsers(); // Reload users list
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Lỗi');
    }
  });
});

document.getElementById('refreshBtn')?.addEventListener('click', () => { void loadUsers(); });

Object.assign(window, { updateUser, deleteUser, editUser });


