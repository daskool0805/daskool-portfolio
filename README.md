# Daskool Portfolio

Đây là bản source độc lập của website portfolio Daskool, đã bao gồm toàn bộ HTML, CSS, JavaScript, hình ảnh, font local, animation và interaction hiện tại.

## Cấu trúc

- `index.html` — landing page
- `about.html` — trang About
- `work.html` — trang Work
- `work/` — các trang danh mục và Project Detail
- `assets/` — hình ảnh và font Gontserrat
- `styles.css` — toàn bộ style và responsive behavior
- `script.js` — animation và interaction dùng chung
- `project-data.js` — dữ liệu các Project Detail
- `project-detail.js` — renderer modular content blocks
- `vercel.json` — cấu hình deploy Vercel

Project không cần build và không có dependency bắt buộc.

## Chạy local

Không mở trực tiếp file bằng `file://`, vì website sử dụng đường dẫn tuyệt đối bắt đầu bằng `/`.

Tại thư mục project, chạy một local server, ví dụ:

```bash
python3 -m http.server 8080
```

Sau đó mở `http://localhost:8080`.

## Upload lên GitHub

1. Tạo repository mới trên GitHub.
2. Giải nén project và mở Terminal tại thư mục `daskool-portfolio`.
3. Chạy:

```bash
git init
git add .
git commit -m "Initial portfolio"
git branch -M main
git remote add origin URL_REPOSITORY_CUA_BAN
git push -u origin main
```

## Deploy bằng Vercel

1. Đăng nhập Vercel và chọn **Add New → Project**.
2. Import repository GitHub vừa tạo.
3. Framework Preset chọn **Other**.
4. Không cần Build Command.
5. Output Directory để trống hoặc dùng `.`.
6. Chọn **Deploy**.

## Kết nối domain riêng

Sau khi deploy, mở project trong Vercel → **Settings → Domains** → nhập domain. Vercel sẽ cung cấp bản ghi DNS cần thêm tại nơi bạn đã mua domain.

## Cập nhật nội dung thủ công

- Thay ảnh trong `assets/` và giữ nguyên tên file để cập nhật nhanh mà không sửa code.
- Nội dung Project Detail nằm trong `project-data.js`.
- Mỗi project có thể chứa các block: `fullImage`, `twoImages`, `video`, `text`, `imageText`, `spacer`.
- Sau khi chỉnh sửa, commit và push lên GitHub; Vercel sẽ tự deploy lại.
