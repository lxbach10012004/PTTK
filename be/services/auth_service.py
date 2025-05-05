import mysql.connector
from flask import current_app

def get_db_connection_service():
    """Hàm helper để lấy kết nối DB trong service."""
    try:
        db_config = current_app.config['DB_CONFIG']
        conn = mysql.connector.connect(**db_config)
        return conn
    except mysql.connector.Error as err:
        print(f"Lỗi kết nối database trong service: {err}")
        return None
    except Exception as e:
        print(f"Lỗi không xác định khi lấy config DB: {e}")
        return None

def find_user_by_email(email):
    """Tìm người dùng trong DB bằng email (bao gồm cả mật khẩu)."""
    conn = get_db_connection_service()
    if not conn:
        return None

    user = None
    try:
        cursor = conn.cursor(dictionary=True)
        # Lấy cả cột mat_khau
        query = "SELECT id_nguoi_dung, ho_ten, email, mat_khau, vai_tro FROM nguoi_dung WHERE email = %s AND trang_thai = 1"
        cursor.execute(query, (email,))
        user = cursor.fetchone()
        cursor.close()
    except mysql.connector.Error as err:
        print(f"Lỗi truy vấn người dùng: {err}")
    finally:
        if conn.is_connected():
            conn.close()
    return user