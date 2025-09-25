# Responsive Optimization cho Admin Pages

## Tổng quan

File `responsive-optimization.css` được tạo để tối ưu hóa responsive design cho tất cả các trang admin, đảm bảo trải nghiệm tốt nhất trên cả desktop và mobile.

## Các tối ưu hóa đã thực hiện

### 1. **Mobile-First Font Scaling**
- **Mobile (≤640px)**: Font size giảm 10-20% để phù hợp với màn hình nhỏ
- **Tablet (641-1024px)**: Font size trung bình
- **Desktop (≥1025px)**: Font size đầy đủ

### 2. **Responsive Typography**
```css
/* Mobile */
.text-xl → font-size: 18px (từ 20px)
.text-2xl → font-size: 20px (từ 24px)
.text-3xl → font-size: 24px (từ 30px)

/* Tablet & Desktop */
.text-xl → font-size: 20px
.text-2xl → font-size: 24px  
.text-3xl → font-size: 30px
```

### 3. **Layout Optimizations**

#### Grid System
- **Mobile**: Tất cả grid chuyển thành 1 cột
- **Tablet**: 2 cột cho grid 2-4 items
- **Desktop**: 3-4 cột tùy theo design

#### Spacing Adjustments
- **Mobile**: Padding/margin giảm 25-50%
- **Desktop**: Spacing đầy đủ

### 4. **Component-Specific Optimizations**

#### Admin Dashboard
- Module cards stack vertically trên mobile
- Quick actions buttons full-width trên mobile
- Stats cards single column layout

#### Climb Admin
- Stats grid → single column trên mobile
- Search form → vertical layout
- GPS settings → single column

#### Guide Admin  
- Tab navigation → vertical stack
- Table → horizontal scroll với touch support
- Add button → full-width trên mobile

#### POI Admin
- Form layout → single column
- Operating hours → simplified mobile layout
- Map modal → optimized cho mobile

#### Users Admin
- User table → horizontal scroll
- Edit modal → single column layout
- Form buttons → full-width trên mobile

### 5. **Utility Classes**

#### Mobile Stack
```css
.mobile-stack {
  flex-direction: column !important;
  gap: 12px !important;
}
@media (min-width: 641px) {
  .mobile-stack {
    flex-direction: row !important;
  }
}
```

#### Mobile Full Width
```css
.mobile-full-width {
  width: 100% !important;
}
@media (min-width: 641px) {
  .mobile-full-width {
    width: auto !important;
  }
}
```

#### Mobile Text Center
```css
.mobile-text-center {
  text-align: center;
}
@media (min-width: 641px) {
  .mobile-text-center {
    text-align: left;
  }
}
```

### 6. **Accessibility Improvements**
- **Touch targets**: Minimum 44px (iOS guideline)
- **Focus indicators**: Enhanced visibility
- **Color contrast**: Maintained across all breakpoints

### 7. **Performance Optimizations**
- **Mobile**: Reduced animations (0.2s thay vì 0.3s)
- **Shadows**: Simplified cho mobile
- **Images**: Responsive với max-width: 100%

### 8. **Dark Mode Support**
- Responsive dark mode adjustments
- Proper color contrast trên mobile

## Cách sử dụng

### Import CSS
```astro
import "../../styles/admin/responsive-optimization.css";
```

### Sử dụng Utility Classes
```html
<!-- Stack vertically trên mobile, horizontal trên desktop -->
<div class="flex mobile-stack">
  <button class="mobile-full-width">Button 1</button>
  <button class="mobile-full-width">Button 2</button>
</div>

<!-- Center text trên mobile, left align trên desktop -->
<h1 class="mobile-text-center">Title</h1>
```

## Breakpoints

- **Mobile**: ≤640px
- **Tablet**: 641px - 1024px  
- **Desktop**: ≥1025px

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Testing Checklist

### Mobile (≤640px)
- [ ] Font size readable
- [ ] Touch targets ≥44px
- [ ] Horizontal scroll cho tables
- [ ] Buttons full-width
- [ ] Forms single column

### Tablet (641-1024px)
- [ ] 2-column layouts
- [ ] Balanced font sizes
- [ ] Proper spacing

### Desktop (≥1025px)
- [ ] Full grid layouts
- [ ] Optimal font sizes
- [ ] Hover effects working
- [ ] Side-by-side forms

## Notes

- CSS sử dụng `!important` để override Tailwind classes
- Mobile-first approach
- Performance optimized cho mobile devices
- Accessibility compliant
- Print-friendly styles included
