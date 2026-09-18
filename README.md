# Daskool Portfolio + Sanity CMS

Website: https://daskool.site · CMS: https://daskool.site/admin

## Quản lý nội dung

1. Mở `/admin` và đăng nhập bằng tài khoản có quyền trong Sanity project `rk9s9iog`.
2. **Project** quản lý các trang chi tiết dự án cũ. Sửa nội dung/ảnh và đặt Publishing status = Published trước khi Publish.
3. **Work Showcase** quản lý dự án trên trang Work và hai kiểu trình bày Branding/Gallery. Chọn danh mục, template tương ứng, thêm ảnh vào Branding Items hoặc Gallery Items, rồi Publish. Có thể tạo hai mục cùng tên cho các danh mục khác nhau; dùng slug riêng cho từng mục.
4. **Site Images** quản lý ảnh chuyển động trang chủ, ảnh theo danh mục, tối đa 100 ảnh hover trang About và ảnh chuyển động trang Work. Tạo một document Site Images rồi Publish.
5. Website lấy dữ liệu Sanity sau khi Publish, không cần deploy lại cho mỗi lần sửa nội dung.

Đã nhập 5 Project gốc vào dataset `production`. Hai mục Work Showcase và Site Images mới hiện chưa có document; giao diện dùng dữ liệu/khung dự phòng cho đến khi bạn điền và Publish. Danh sách Work mẫu vẫn giữ đủ 6 tên khi Work Showcase chưa có dữ liệu. Dữ liệu dự phòng của trang chi tiết trong `project-data.js` chỉ dùng khi API không truy cập được; kết quả rỗng hoặc 404 từ CMS không khôi phục nội dung đã ẩn.

## Build và deploy

Node.js 22 trở lên và npm. Chạy `npm run build`; kết quả ở `dist`, Studio ở `dist/admin`. Vercel tự deploy khi đẩy mã lên nhánh main. API serverless nằm trong `api/`. Cấu hình build và routing nằm trong `vercel.json`.

Project ID mặc định là `rk9s9iog`, dataset `production`; có thể đổi bằng SANITY_PROJECT_ID, SANITY_DATASET, SANITY_STUDIO_PROJECT_ID và SANITY_STUDIO_DATASET. Đây là thông tin công khai. Website public không cần token.

Sanity CORS cần cho phép origin `https://daskool.site` với Allow credentials để Studio đăng nhập.

## Phát triển và kiểm thử

`npm test` kiểm tra API và bảo vệ bản nháp. `npm run cms:dev` chạy Studio local sau khi cài dependency trong studio. Dùng Vercel dev để chạy cả website và API local; server static đơn thuần chỉ hiển thị dữ liệu dự phòng.

## Chuyển dữ liệu

`scripts/migrate-projects.mjs` cần SANITY_WRITE_TOKEN trong môi trường local. Script tạo tài liệu bằng createIfNotExists, giữ nguyên nội dung đã tồn tại. Không commit token hoặc file .env. Thu hồi token sau khi chuyển dữ liệu.

Preview API chỉ bật khi cả SANITY_API_READ_TOKEN và SANITY_PREVIEW_SECRET được cấu hình phía server. Request preview cần Authorization Bearer với secret; response không được cache. Giao diện preview trực quan chưa được tích hợp.
