# Checklist Deploy lên Netlify

## ✅ Trước khi Deploy

### 1. Chuẩn bị Repository
- [x] Cập nhật `.gitignore` với các file cần thiết
- [x] Kiểm tra build thành công với `npm run build`
- [x] Xác nhận tất cả dependencies trong `package.json`
- [x] Cấu hình Astro với Netlify adapter

### 2. Cấu hình Netlify
- [x] File `netlify.toml` đã được cấu hình đúng
- [x] Functions được đặt trong `netlify/functions/`
- [x] Build command: `npm run build`
- [x] Publish directory: `dist`
- [x] Node.js version: 18

### 3. Environment Variables (QUAN TRỌNG)
Cần thiết lập các biến môi trường sau trên Netlify Dashboard:

```
JWT_SECRET=your-super-secret-jwt-key-here
ALLOWED_ORIGIN=https://your-domain.netlify.app
NODE_ENV=production
```

## 🚀 Quá trình Deploy

### Bước 1: Tạo Repository trên GitHub
```bash
git init
git add .
git commit -m "Initial commit: Astro site ready for Netlify deploy"
git branch -M main
git remote add origin https://github.com/yourusername/your-repo-name.git
git push -u origin main
```

### Bước 2: Kết nối với Netlify
1. Đăng nhập vào [Netlify Dashboard](https://app.netlify.com)
2. Click "New site from Git"
3. Chọn GitHub và repository vừa tạo
4. Cấu hình:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: 18

### Bước 3: Thiết lập Environment Variables
1. Vào Site settings > Environment variables
2. Thêm các biến:
   - `JWT_SECRET`: Tạo một chuỗi bí mật mạnh
   - `ALLOWED_ORIGIN`: URL của site sau khi deploy
   - `NODE_ENV`: `production`

### Bước 4: Deploy
1. Click "Deploy site"
2. Chờ build hoàn thành
3. Kiểm tra Functions tab để đảm bảo functions hoạt động

## 🔧 Kiểm tra sau Deploy

### 1. Test Functions
- [ ] `/api/auth` - Authentication
- [ ] `/api/combined-data` - Data management
- [ ] `/api/dashboard-stats` - Dashboard statistics
- [ ] `/api/data-blobs` - Blob storage
- [ ] `/api/test` - Test function

### 2. Test Pages
- [ ] Trang chủ (`/`)
- [ ] Đăng nhập (`/login`)
- [ ] Đăng ký (`/register`)
- [ ] Map (`/map`)
- [ ] Guide (`/guide`)
- [ ] Climb (`/climb`)
- [ ] Admin pages (`/admin/*`)

### 3. Test Features
- [ ] User registration/login
- [ ] Authentication flow
- [ ] Admin panel access
- [ ] Data CRUD operations
- [ ] GPS functionality
- [ ] File uploads

## 📋 Các File Quan Trọng

### Core Files
- `package.json` - Dependencies và scripts
- `astro.config.mjs` - Astro configuration
- `netlify.toml` - Netlify configuration
- `.gitignore` - Git ignore rules

### Functions
- `netlify/functions/auth.mjs` - Authentication
- `netlify/functions/combined-data.mjs` - Data operations
- `netlify/functions/dashboard-stats.mjs` - Statistics
- `netlify/functions/data-blobs.mjs` - Blob storage
- `netlify/functions/test.mjs` - Testing

### Assets
- `public/assets/images/` - Static images
- `src/styles/` - CSS files
- `src/scripts/` - JavaScript files

## 🚨 Lưu Ý Quan Trọng

1. **JWT_SECRET**: Phải là chuỗi bí mật mạnh, không được để mặc định
2. **Netlify Blobs**: Tự động được cấu hình khi deploy
3. **CORS**: Đã được cấu hình trong functions
4. **Build**: Sử dụng hybrid mode cho compatibility tốt nhất
5. **Cache**: Headers cache đã được tối ưu

## 🔍 Troubleshooting

### Build Failed
- Kiểm tra Node.js version (phải là 18)
- Kiểm tra dependencies trong package.json
- Xem build logs trên Netlify

### Functions Not Working
- Kiểm tra environment variables
- Kiểm tra CORS settings
- Test functions qua Netlify dashboard

### Authentication Issues
- Kiểm tra JWT_SECRET
- Kiểm tra token expiration
- Kiểm tra CORS headers

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. Netlify build logs
2. Function logs
3. Browser console
4. Network requests
