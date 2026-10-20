# BIT240131_FoodManager

Ứng dụng React Native/Expo cho đề giữa kỳ Quản lý món ăn của **Nguyễn Trần Tuấn Khôi (BIT240131)**. Ứng dụng dùng AsyncStorage để lưu dữ liệu trên thiết bị, NetInfo để theo dõi kết nối và MockAPI REST để đồng bộ. Ngôn ngữ mặc định là English; lựa chọn ngôn ngữ được lưu lại.

## Chạy ứng dụng

1. Cài Node.js LTS và npm, sau đó mở PowerShell tại thư mục project và chạy `npm install`.
2. Tạo project/resources trên MockAPI theo hướng dẫn bên dưới.
3. Sao chép `.env.example` thành `.env`, thay `YOUR_PROJECT_ID` bằng URL project MockAPI của bạn.
4. Khởi động lại Expo sau khi sửa `.env`, rồi chạy `npm start`.
5. Mở ứng dụng trên Android Emulator hoặc quét mã QR bằng Expo Go.

Tên ứng dụng/project: `BIT240131_FoodManager`.

## Tạo MockAPI trên web và kết nối

1. Mở [mockapi.io](https://mockapi.io/), đăng nhập và tạo một project.
2. Tạo đúng hai resources tên `BIT240131_DishCategory` và `BIT240131_Dish`. MockAPI có thể tự tạo trường `id` cho REST endpoint; giữ nguyên trường hệ thống này.
3. Nếu giao diện resource yêu cầu khai báo schema, dùng đúng tên trường bên dưới. Các trường dữ liệu ứng dụng đều có tiền tố `BIT240131_`; `BIT240131_DishImage` là danh sách JSON gồm các object ảnh.

   **categories**
   - `BIT240131_Id` (string): ID ổn định trong ứng dụng.
   - `BIT240131_Name` (string)
   - `BIT240131_Description` (string)
   - `BIT240131_ClientId` (string): khóa nhận diện để tránh tạo trùng khi retry đồng bộ.
   - `BIT240131_UpdatedAt` (string/date)

   **dishes**
   - `BIT240131_Id` (string), `BIT240131_Name` (string)
   - `BIT240131_Price` (number), `BIT240131_PreparationTime` (number)
   - `BIT240131_IsAvailable` (boolean), `BIT240131_Description` (string)
   - `BIT240131_DishCategoryId` (string): tham chiếu tới `BIT240131_Id` của category.
   - `BIT240131_DishImage` (JSON array): mỗi phần tử có `BIT240131_ImageUrl` (string) và `BIT240131_IsThumbnail` (boolean).
   - `BIT240131_ClientId` (string), `BIT240131_UpdatedAt` (string/date)

4. Copy **base URL** của project, ví dụ `https://65abc123.mockapi.io/api/v1`, vào `.env`:

   ```env
   EXPO_PUBLIC_MOCKAPI_BASE_URL=https://YOUR_PROJECT_ID.mockapi.io/api/v1
   ```

5. Khởi động lại Expo. Lần chạy đầu, ứng dụng lưu cục bộ 3 loại món và 5 món mẫu, sau đó tự đưa chúng lên hai resources khi có mạng. Mở `BIT240131_DishCategory` và `BIT240131_Dish` trên MockAPI để kiểm tra dữ liệu.

MockAPI tự cấp trường `id` dùng cho URL REST; ứng dụng giữ ID riêng trong `BIT240131_Id` để quan hệ loại món không bị đổi khi đồng bộ. Tên hai resources và các khóa AsyncStorage đều có tiền tố MSSV: `BIT240131_Dish`, `BIT240131_DishCategory`, `BIT240131_SyncQueue` và `BIT240131_Language`.

## Kiểm tra phần offline và tự đồng bộ

1. Đảm bảo đã kết nối MockAPI thành công và danh sách mẫu xuất hiện trên web.
2. Tắt Wi-Fi/dữ liệu mạng của emulator hoặc điện thoại.
3. Tạo món mới hoặc sửa một món. Món vẫn xuất hiện trong ứng dụng; trạng thái cho biết thay đổi được lưu cục bộ và số lượng đang chờ đồng bộ.
4. Bật mạng lại, chờ trạng thái đồng bộ hoàn tất; không cần nhấn nút đồng bộ.
5. Làm mới resource `BIT240131_Dish` trên MockAPI để xác nhận món được tạo/cập nhật và không bị nhân đôi.

Ứng dụng lưu dữ liệu và hàng đợi thay đổi trong AsyncStorage. NetInfo tự phát hiện kết nối trở lại. Mỗi bản ghi có `BIT240131_ClientId`; trước khi tạo, ứng dụng tìm khóa này trên MockAPI. Nếu lần POST trước đã tới máy chủ nhưng phản hồi bị mất, lần thử lại sẽ cập nhật bản ghi đó thay vì tạo bản ghi mới. Sau khi đẩy hàng đợi, ứng dụng tải lại cả hai resources và nhập các thay đổi remote chưa có trong hàng đợi local.

## Các nội dung trong đề

- Danh sách, chi tiết, thêm/sửa/xóa món có xác nhận và chọn loại món.
- Tìm tên không phân biệt hoa thường; lọc kết hợp theo loại, trạng thái bán và khoảng giá; sắp xếp theo giá tăng/giảm hoặc thời gian chế biến tăng. Bộ lọc được giữ khi mở rồi quay lại danh sách.
- Nhiều ảnh cho mỗi món, chọn duy nhất một ảnh đại diện; Quick khi thời gian chế biến không quá 15 phút, còn lại là Regular.
- English mặc định, chuyển English ↔ Tiếng Việt; nhãn, trạng thái, validation và thông báo được dịch. Ngôn ngữ được giữ khi chuyển màn hình và khi mở lại ứng dụng.
- Kiểm tra tên món, giá, thời gian chế biến, loại món và tên trùng trong cùng loại.

Video demo và video thuyết minh mã nguồn là nội dung sinh viên tự quay/nộp theo thời hạn của đề; ứng dụng không tạo video.
