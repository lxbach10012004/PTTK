# PTTK - Hệ thống Quản lý Chung cư

Hướng dẫn cài đặt và chạy dự án.

## Chuẩn bị

1.  Clone repository này về máy.
2.  Đảm bảo bạn đã cài đặt Node.js (bao gồm npm hoặc yarn) và Python.

## Backend (Flask)

1.  Mở terminal, điều hướng đến thư mục `be`:
    ```bash
    cd PTTK/be
    ```
2.  (Tùy chọn, khuyến khích) Tạo và kích hoạt môi trường ảo:
    ```bash
    python -m venv venv
    # Windows
    .\venv\Scripts\activate
    # macOS/Linux
    source venv/bin/activate
    ```
3.  Cài đặt các thư viện Python cần thiết:
    ```bash
    pip install -r requirements.txt
    ```
    *(Lưu ý: Nếu chưa có file `requirements.txt`, bạn cần tạo nó bằng cách chạy `pip freeze > requirements.txt` sau khi đã cài đặt các thư viện như Flask, mysql-connector-python, python-dotenv, Flask-CORS)*

4.  Sao chép file `.env.example` (nếu có) thành `.env` và cấu hình các biến môi trường, đặc biệt là thông tin kết nối database.
    File `be/app.py` hiện đang sử dụng các biến môi trường:
    *   `DB_HOST`
    *   `DB_USER`
    *   `DB_PASSWORD`
    *   `DB_NAME`
    *   `DB_PORT`

5.  Chạy backend server:
    ```bash
    python app.py
    ```

    Backend sẽ thường chạy ở `http://127.0.0.1:5000`.

## Frontend (React + Vite)

1.  Mở một terminal khác, điều hướng đến thư mục `fe`:
    ```bash
    cd PTTK/fe
    ```
2.  Cài đặt các dependencies:
    ```bash
    npm install
    ```
    Hoặc nếu bạn dùng Yarn:
    ```bash
    yarn install
    ```
3.  Chạy frontend development server:
    ```bash
    npm run dev
    ```

    Frontend sẽ thường chạy ở `http://localhost:5173` (hoặc một port khác do Vite chọn). Mở trình duyệt và truy cập địa chỉ này.

    Trong các file frontend (ví dụ: [`fe/src/pages/manager/ManageServices.jsx`](d:\course\PTTKHTTT\PTTK\fe\src\pages\manager\ManageServices.jsx), [`fe/src/pages/staff/CreateServiceBill.jsx`](d:\course\PTTKHTTT\PTTK\fe\src\pages\staff\CreateServiceBill.jsx)), API_URL đang được đặt là `https://mmncb6j3-5000.asse.devtunnels.ms/api`. Bạn có thể cần thay đổi thành địa chỉ backend cục bộ của mình (ví dụ: `http://127.0.0.1:5000/api`) nếu không sử dụng dev tunnel.

## Hoàn tất

Sau khi cả backend và frontend đều chạy, bạn có thể truy cập ứng dụng qua địa chỉ của frontend trên trình duyệt.