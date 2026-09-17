# Daskool Portfolio + Sanity CMS

Website: https://daskool.site · CMS: https://daskool.site/admin

## Quản lý nội dung

1. Mở `/admin` và đăng nhập bằng tài khoản có quyền trong Sanity project `rk9s9iog`.
2. Chọn Project để sửa hoặc tạo dự án. Điền tiêu đề, slug, danh mục, ảnh đại diện và nội dung.
3. Sắp xếp các khối ảnh, video, chữ bằng kéo thả trong Content / Gallery.
4. Đặt Publishing status = Published, sau đó bấm Publish. Website cập nhật sau khoảng 60 giây, không cần deploy lại.
5. Để ẩn dự án, đặt Publishing status = Draft và Publish, hoặc dùng Unpublish.

Đã nhập 5 dự án gốc vào dataset `production`. Dữ liệu dự phòng trong `project-data.js` chỉ dùng khi API không truy cập được; kết quả rỗng hoặc 404 từ CMS không khôi phục nội dung đã ẩn.

## Build và deploy

Node.js 22 trở lên và npm. Chạy `npm run build`; kết quả ở `dist`, Studio ở `dist/admin`. Vercel tự deploy khi đẩy mã lên nhánh main. API serverless nằm trong `api/`. Cấu hình build và routing nằm trong `vercel.json`.

Project ID mặc định là `rk9s9iog`, dataset `production`; có thể đổi bằng SANITY_PROJECT_ID, SANITY_DATASET, SANITY_STUDIO_PROJECT_ID và SANITY_STUDIO_DATASET. Đây là thông tin công khai. Website public không cần token.

Sanity CORS cần cho phép origin `https://daskool.site` với Allow credentials để Studio đăng nhập.

## Phát triển và kiểm thử

`npm test` kiểm tra API và bảo vệ bản nháp. `npm run cms:dev` chạy Studio local sau khi cài dependency trong studio. Dùng Vercel dev để chạy cả website và API local; server static đơn thuần chỉ hiển thị dữ liệu dự phòng.

## Chuyển dữ liệu

`scripts/migrate-projects.mjs` cần SANITY_WRITE_TOKEN trong môi trường local. Script tạo tài liệu bằng createIfNotExists, giữ nguyên nội dung đã tồn tại. Không commit token hoặc file .env. Thu hồi token sau khi chuyển dữ liệu.

Preview API chỉ bật khi cả SANITY_API_READ_TOKEN và SANITY_PREVIEW_SECRET được cấu hình phía server. Request preview cần Authorization Bearer với secret; response không được cache. Giao diện preview trực quan chưa được tích hợp.
