# filepath: d:\course\PTTKHTTT\PTTK\be\services\feedback_service.py
import mysql.connector
from flask import current_app
from .auth_service import get_db_connection_service
import datetime

def create_resident_feedback(data):
    """Tạo phản hồi mới từ cư dân."""
    conn = get_db_connection_service()
    if not conn:
        return None, "Lỗi kết nối database"

    try:
        cursor = conn.cursor()
        query = """
            INSERT INTO phan_hoi_cu_dan
            (id_cu_dan, tieu_de, noi_dung, ngay_gui, trang_thai)
            VALUES (%s, %s, %s, %s, %s)
        """
        ngay_gui = datetime.datetime.now()
        trang_thai = 'Mới'

        cursor.execute(query, (
            data['id_cu_dan'],
            data['tieu_de'],
            data['noi_dung'],
            ngay_gui,
            trang_thai
        ))
        conn.commit()
        feedback_id = cursor.lastrowid
        cursor.close()
        return {"id_phan_hoi": feedback_id, "ngay_gui": ngay_gui.isoformat(), "trang_thai": trang_thai}, None
    except mysql.connector.Error as err:
        conn.rollback()
        print(f"Lỗi tạo phản hồi cư dân: {err}")
        return None, f"Lỗi tạo phản hồi cư dân: {err}"
    except KeyError as e:
         return None, f"Thiếu trường bắt buộc: {e}"
    finally:
        if conn.is_connected():
            conn.close()

def get_all_feedback():
    """Lấy danh sách tất cả phản hồi."""
    conn = get_db_connection_service()
    if not conn: return None, "Lỗi kết nối DB"
    feedback_list = []
    try:
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT ph.id_phan_hoi, ph.tieu_de, ph.noi_dung, ph.ngay_gui, ph.trang_thai,
                   ph.id_cu_dan, nd.ho_ten AS ten_cu_dan
            FROM phan_hoi_cu_dan ph
            LEFT JOIN nguoi_dung nd ON ph.id_cu_dan = nd.id_nguoi_dung
            ORDER BY ph.ngay_gui DESC
        """
        cursor.execute(query)
        feedback_list = cursor.fetchall()
        cursor.close()
        # Chuyển đổi datetime
        for fb in feedback_list:
            if fb.get('ngay_gui') and isinstance(fb['ngay_gui'], datetime.datetime):
                fb['ngay_gui'] = fb['ngay_gui'].isoformat()
        return feedback_list, None
    except mysql.connector.Error as err: print(f"Lỗi MySQL khi lấy phản hồi: {err}"); return None, f"Lỗi DB: {err}"
    except Exception as e: print(f"Lỗi khác khi lấy phản hồi: {e}"); return None, f"Lỗi hệ thống: {e}"
    finally:
        if conn and conn.is_connected(): conn.close()