# filepath: d:\course\PTTKHTTT\PTTK\be_python\app.py
import os
import mysql.connector
from flask import Flask, jsonify, request
from flask_cors import CORS # Import CORS
from dotenv import load_dotenv


# Load biến môi trường từ file .env
load_dotenv()

app = Flask(__name__)
CORS(app) # Kích hoạt CORS cho tất cả các route

# Cấu hình kết nối database từ biến môi trường
db_config = {
    'host': os.getenv('DB_HOST'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME'),
    'port': os.getenv('DB_PORT', 3306)
}
# Lưu config vào app context để các module khác có thể truy cập
app.config['DB_CONFIG'] = db_config

# Hàm để lấy kết nối database (có thể giữ lại để test hoặc dùng trong các route đơn giản)
def get_db_connection():
    try:
        conn = mysql.connector.connect(**app.config['DB_CONFIG'])
        return conn
    except mysql.connector.Error as err:
        print(f"Lỗi kết nối database: {err}")
        return None

# --- Đăng ký các Blueprints ---
from routes.auth_routes import auth_bp
from routes.bill_routes import bill_bp # Thêm import
from routes.resident_routes import resident_bp # Thêm import
from routes.notification_routes import notification_bp # Thêm import
from routes.feedback_routes import feedback_bp # Thêm import
from routes.service_routes import service_bp # Đảm bảo đã import
from routes.request_routes import request_bp # Đảm bảo đã import
from routes.report_routes import report_bp # Thêm import
from routes.user_routes import user_bp # Mới
from routes.apartment_routes import apartment_bp # Mới
from routes.contract_routes import contract_bp # <-- Thêm import


app.register_blueprint(auth_bp)
app.register_blueprint(service_bp)
app.register_blueprint(request_bp)
app.register_blueprint(bill_bp) # Đăng ký blueprint hóa đơn
app.register_blueprint(resident_bp) # Đăng ký blueprint cư dân
app.register_blueprint(notification_bp) # Đăng ký blueprint thông báo
app.register_blueprint(feedback_bp) # Đăng ký blueprint phản hồi
app.register_blueprint(report_bp) # Đăng ký blueprint báo cáo
app.register_blueprint(user_bp) # Mới
app.register_blueprint(apartment_bp) # Mới
app.register_blueprint(contract_bp) # <-- Đăng ký blueprint hợp đồng

# (Có thể đăng ký các blueprint khác ở đây sau)
# from routes.user_routes import user_bp
# app.register_blueprint(user_bp)

# --- Các route gốc hoặc test (có thể giữ lại hoặc xóa) ---
@app.route('/api/db-test')
def db_test():
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            cursor.close()
            return jsonify({"message": "Kết nối database thành công!", "result": result[0]})
        except mysql.connector.Error as err:
            return jsonify({"error": f"Lỗi truy vấn: {err}"}), 500
        finally:
            if conn.is_connected():
                conn.close()
    else:
        return jsonify({"error": "Không thể kết nối đến database"}), 500

@app.route('/api/nguoi-dung', methods=['GET'])
def get_users():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Không thể kết nối đến database"}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id_nguoi_dung, ho_ten, email, vai_tro FROM nguoi_dung LIMIT 10")
        users = cursor.fetchall()
        cursor.close()
        return jsonify(users)
    except mysql.connector.Error as err:
        return jsonify({"error": f"Lỗi truy vấn người dùng: {err}"}), 500
    finally:
        if conn.is_connected():
            conn.close()

# Chạy Flask development server
if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5000))
    app.run(host='0.0.0.0', port=port)