# Bài trình bày: Chiến lược chuyển đổi số

## Chạy trên máy (không cần mạng)
Mở `index.html` bằng Chrome hoặc Edge, nhập mật khẩu được cung cấp riêng. Nội dung slide được mã hóa, chỉ giải mã được khi nhập đúng mật khẩu. Trong cùng một tab, tải lại trang không phải nhập lại. Toàn bộ thư viện và font đã nằm trong thư mục `vendor/`.

## Cấu trúc
33 slide chính và 5 phụ lục (A1–A5). Màu sắc theo nhận diện Tara: xanh #0057A9, xanh nhạt #277CBE, đỏ #D53F59, xám #6D6E71: tiêu đề Montserrat, nội dung Be Vietnam Pro.

Slide tương tác: 1 (3D), 6 (hiện trạng và giải pháp đề xuất), 7 (kiến trúc MIS 3D bốn lớp), 9 (mô phỏng 3D ba cách lấy tồn kho), 17 (thẻ lật 3D AI), 20 (bậc thang lộ trình). Slide 10 là luồng dữ liệu đi qua bốn lớp: slide 11 là thẩm định website BlueStone (quan sát ngày 08/10/2026). Slide 16 và 17 là chiến lược AI ngắn hạn và dài hạn. Slide 31 là bảng hành động tương tác: bấm vào ô ưu tiên để đổi P1, P2, P3. Slide 33 là slide cảm ơn và hỏi đáp, có năm ô bấm để nhảy thẳng tới từng phụ lục. Chân trang mỗi slide ghi rõ slide đó trả lời yêu cầu nào của đề bài. Khi dùng ô nhập hoặc nút trên slide, bấm vào vùng trống trước khi chuyển slide bằng phím mũi tên.

## Phím tắt khi trình bày
- Mũi tên phải / Space: bước tiếp theo (slide có hiệu ứng sẽ chạy từng bước)
- Mũi tên trái: lùi lại
- `S`: mở màn hình người trình bày (ghi chú, đồng hồ, slide kế tiếp). Cho phép popup nếu trình duyệt chặn.
- `F`: toàn màn hình. `Esc`: xem tổng quan các slide.

## Đưa lên GitHub Pages
1. Tạo repo (nên đặt tên khó đoán), đẩy toàn bộ thư mục này lên nhánh `main`.
2. Settings → Pages → Source: Deploy from a branch → `main` / root.
3. Trang đã có thẻ `noindex` để không bị Google lập chỉ mục.

## Xuất PDF
1. Mở `index.html?print-pdf` trong Chrome.
2. Ctrl+P → Destination: Save as PDF → Layout: Landscape → Margins: None → bật Background graphics.
Các slide có hiệu ứng sẽ được in ở trạng thái cuối.
