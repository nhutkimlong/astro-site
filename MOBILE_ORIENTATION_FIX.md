# Sửa lỗi mũi tên không xoay khi xoay điện thoại

## 🔧 Các thay đổi đã thực hiện:

### 1. Cải thiện Device Orientation Tracking
- **Thêm reference lưu trữ** cho arrow element để tránh mất reference khi xoay màn hình
- **Thêm transition smooth** cho việc xoay arrow
- **Cải thiện permission handling** cho iOS và Android

### 2. Các tính năng mới:
```javascript
// Lưu trữ reference arrow element
userMarker._arrowElement = userMarker.getElement().querySelector('.heading-arrow');

// Smooth transition cho arrow rotation
transition: transform 0.1s ease-out;

// Re-request permission khi xoay màn hình
window.addEventListener('orientationchange', () => {
    setTimeout(requestOrientationPermission, 500);
});
```

## 🚀 Hướng dẫn test:

### 1. Test trên điện thoại thật:
1. Mở trang đăng ký leo núi
2. Cho phép truy cập vị trí
3. Cho phép truy cập device orientation (sẽ hiện popup)
4. Xoay điện thoại và kiểm tra mũi tên xoay theo

### 2. Test trên desktop (Chrome DevTools):
1. Mở DevTools (F12)
2. Click vào icon điện thoại (Toggle device toolbar)
3. Chọn device mobile
4. Mở tab "Sensors" trong DevTools
5. Thay đổi "Orientation" để test

## 🔍 Troubleshooting:

### Mũi tên vẫn không xoay:
1. **Kiểm tra permission**: Đảm bảo đã cho phép device orientation
2. **Kiểm tra console**: Xem có lỗi JavaScript nào không
3. **Test trên device thật**: Một số tính năng chỉ hoạt động trên device thật

### Permission bị từ chối:
```javascript
// Console sẽ hiện message:
"Device orientation permission denied"
// → Cần refresh trang và cho phép lại
```

### Arrow element bị mất:
```javascript
// Code sẽ tự động tìm lại arrow element:
if (!userMarker._arrowElement) {
    const el = userMarker.getElement();
    if (el) {
        userMarker._arrowElement = el.querySelector('.heading-arrow');
    }
}
```

## 📱 Browser Support:

### ✅ Hỗ trợ tốt:
- **iOS Safari**: webkitCompassHeading
- **Android Chrome**: alpha rotation
- **Mobile Firefox**: alpha rotation

### ⚠️ Hạn chế:
- **Desktop browsers**: Chỉ test được qua DevTools
- **iOS**: Cần user gesture để request permission
- **HTTPS required**: Device orientation chỉ hoạt động trên HTTPS

## 🎯 Kết quả mong đợi:

1. **Mũi tên xoay mượt** khi xoay điện thoại
2. **Tự động re-request permission** khi xoay màn hình
3. **Không bị mất reference** khi DOM thay đổi
4. **Console logs** để debug dễ dàng

## 🔄 Deploy:

Sau khi sửa xong:
```bash
npm run build
git add .
git commit -m "Fix: Arrow rotation on mobile orientation change"
git push
```

Netlify sẽ tự động deploy và fix sẽ có hiệu lực!
