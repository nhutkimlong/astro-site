// @ts-check

const errorBox = document.getElementById('error');
const successBox = document.getElementById('success');
const tbody = document.getElementById('tbody');

/** @type {(msg: string) => void} */
export const showError = (msg) => { if(!errorBox) return; errorBox.textContent = msg; errorBox.classList.remove('hidden'); setTimeout(()=>errorBox.classList.add('hidden'), 4000); };
/** @type {(msg: string) => void} */
export const showSuccess = (msg) => { if(!successBox) return; successBox.textContent = msg; successBox.classList.remove('hidden'); setTimeout(()=>successBox.classList.add('hidden'), 3000); };

export const getToken = () => localStorage.getItem('authToken') || '';

/** @typedef {{id:string, name?:string, email:string, role:'user'|'admin'}} User */

/** @type {() => Promise<void>} */
export const loadUsers = async () => {
  if (tbody) tbody.innerHTML = '<tr><td colspan="5" class="px-4 py-6 text-center text-slate-500">Đang tải...</td></tr>';
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
  if(!users.length){ tbody.innerHTML = '<tr><td colspan="5" class="px-4 py-6 text-center text-slate-500">Chưa có người dùng</td></tr>'; return; }
  tbody.innerHTML = users.map((u) => `
        <tr>
          <td class="px-4 py-3 text-slate-700">${u.id}</td>
          <td class="px-4 py-3"><input data-id="${u.id}" data-field="name" class="w-full px-2 py-1 border border-slate-300 rounded" value="${u.name || ''}" /></td>
          <td class="px-4 py-3 text-slate-700">${u.email}</td>
          <td class="px-4 py-3">
            <select data-id="${u.id}" data-field="role" class="px-2 py-1 border border-slate-300 rounded">
              <option value="user" ${u.role==='user'?'selected':''}>user</option>
              <option value="admin" ${u.role==='admin'?'selected':''}>admin</option>
            </select>
          </td>
          <td class="px-4 py-3 text-right">
            <button class="px-3 py-1 bg-indigo-600 text-white rounded mr-2" onclick="updateUser('${u.id}')"><i class="fas fa-save"></i></button>
            <button class="px-3 py-1 bg-red-600 text-white rounded" onclick="deleteUser('${u.id}')"><i class="fas fa-trash"></i></button>
          </td>
        </tr>
      `).join('');
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

document.getElementById('refreshBtn')?.addEventListener('click', () => { void loadUsers(); });
document.addEventListener('DOMContentLoaded', () => { void loadUsers(); });

Object.assign(window, { updateUser, deleteUser });


