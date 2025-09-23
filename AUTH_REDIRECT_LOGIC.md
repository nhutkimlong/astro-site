# Logic Authentication & Redirect

## ✅ Đã sửa xong logic kiểm tra đăng nhập

### 🔧 **Vấn đề trước đây:**
- Người dùng đã đăng nhập vẫn có thể truy cập `/login` và `/register`
- Không có logic redirect cho user đã authenticated
- UX không tốt khi user đã login lại vào trang login

### 🚀 **Giải pháp đã áp dụng:**

#### **1. Trang Login (`/login`)**
```javascript
// Check if user is already logged in
document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('authToken');
  if (!token) return; // User not logged in, show login form
  
  try {
    // Verify token is still valid
    const res = await fetch('/.netlify/functions/auth', {
      method: 'POST',
      headers: { 
        'Authorization': 'Bearer ' + token, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ action: 'verify' })
    });
    const json = await res.json();
    
    if (res.ok && json.success) {
      // User is already logged in, redirect based on role
      if (json.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/account';
      }
      return;
    }
  } catch (error) {
    // Token invalid, clear it and show login form
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  }
});
```

#### **2. Trang Register (`/register`)**
```javascript
// Tương tự như login, kiểm tra và redirect nếu đã đăng nhập
```

#### **3. Logic Redirect sau Login/Register**
```javascript
// Redirect based on role after successful login/register
if (json.user.role === 'admin') {
  window.location.href = '/admin';
} else {
  window.location.href = '/account';
}
```

## 📋 **Flow Authentication hoàn chỉnh:**

### **1. User chưa đăng nhập:**
- ✅ Truy cập `/login` → Hiển thị form đăng nhập
- ✅ Truy cập `/register` → Hiển thị form đăng ký
- ✅ Truy cập `/admin` → Redirect đến `/login`
- ✅ Truy cập `/account` → Redirect đến `/login`

### **2. User đã đăng nhập (Role: user):**
- ✅ Truy cập `/login` → Redirect đến `/account`
- ✅ Truy cập `/register` → Redirect đến `/account`
- ✅ Truy cập `/admin` → Redirect đến `/account`
- ✅ Truy cập `/account` → Hiển thị trang profile

### **3. User đã đăng nhập (Role: admin):**
- ✅ Truy cập `/login` → Redirect đến `/admin`
- ✅ Truy cập `/register` → Redirect đến `/admin`
- ✅ Truy cập `/admin` → Hiển thị admin dashboard
- ✅ Truy cập `/account` → Hiển thị trang profile

## 🔐 **Security Features:**

### **1. Token Verification**
- Kiểm tra token có hợp lệ không
- Tự động clear token nếu invalid
- Re-verify mỗi lần truy cập trang protected

### **2. Role-based Access**
- Admin → `/admin` dashboard
- User → `/account` profile
- Automatic redirect based on role

### **3. Token Management**
- Auto-clear invalid tokens
- Secure token storage in localStorage
- Proper error handling

## 🎯 **Test Cases:**

### **Test 1: User chưa đăng nhập**
1. Clear localStorage
2. Truy cập `/login` → ✅ Hiển thị form
3. Truy cập `/register` → ✅ Hiển thị form
4. Truy cập `/admin` → ✅ Redirect `/login`
5. Truy cập `/account` → ✅ Redirect `/login`

### **Test 2: User đã đăng nhập (role: user)**
1. Login với user thường
2. Truy cập `/login` → ✅ Redirect `/account`
3. Truy cập `/register` → ✅ Redirect `/account`
4. Truy cập `/admin` → ✅ Redirect `/account`
5. Truy cập `/account` → ✅ Hiển thị profile

### **Test 3: User đã đăng nhập (role: admin)**
1. Login với admin
2. Truy cập `/login` → ✅ Redirect `/admin`
3. Truy cập `/register` → ✅ Redirect `/admin`
4. Truy cập `/admin` → ✅ Hiển thị dashboard
5. Truy cập `/account` → ✅ Hiển thị profile

## 🚀 **Deploy:**

```bash
npm run build
git add .
git commit -m "Fix: Add auth redirect logic for login/register pages"
git push
```

## 📱 **UX Improvements:**

### **Before:**
- ❌ User đã login vẫn thấy trang login
- ❌ Không có logic redirect
- ❌ Confusing user experience

### **After:**
- ✅ **Smart redirect** based on auth status
- ✅ **Role-based routing** (admin vs user)
- ✅ **Seamless UX** - no unnecessary pages
- ✅ **Token validation** with auto-cleanup
- ✅ **Secure flow** with proper error handling

## 🔍 **Debug:**

### **Console Logs:**
- Check localStorage for `authToken` and `authUser`
- Verify API calls to `/.netlify/functions/auth`
- Monitor redirect behavior

### **Common Issues:**
1. **Token expired**: Auto-clear and show login form
2. **Invalid token**: Clear localStorage and redirect
3. **Network error**: Show error message, don't redirect
4. **Role mismatch**: Redirect to appropriate page

**Kết quả:** Logic authentication hoàn chỉnh với redirect thông minh! 🎉
