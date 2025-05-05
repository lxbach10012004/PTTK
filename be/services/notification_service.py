# filepath: d:\course\PTTKHTTT\PTTK\be\services\notification_service.py
import mysql.connector
from flask import current_app
from .auth_service import get_db_connection_service
import datetime

STAFF_ID = 2 # Hardcode ID nhân viên

def get_all_notifications():
    """Lấy tất cả thông báo, sắp xếp mới nhất trước."""
    conn = get_db_connection_service()
    if not conn:
        return None, "Lỗi kết nối database"

    notifications = []
    try:
        cursor = conn.cursor(dictionary=True)
        # Có thể join với nguoi_dung để lấy tên người gửi nếu cần
        query = """
            SELECT id_thong_bao, id_nhan_vien_phu_trach, tieu_de, noi_dung, ngay_gui
            FROM thong_bao
            ORDER BY ngay_gui DESC
        """
        cursor.execute(query)
        notifications = cursor.fetchall()
        cursor.close()

        # Chuyển đổi datetime thành string
        for noti in notifications:
            if isinstance(noti.get('ngay_gui'), (datetime.datetime, datetime.date)):
                noti['ngay_gui'] = noti['ngay_gui'].isoformat()

        return notifications, None
    except mysql.connector.Error as err:
        print(f"Lỗi truy vấn thông báo: {err}")
        return None, f"Lỗi truy vấn thông báo: {err}"
    finally:
        if conn.is_connected():
            conn.close()

def create_notification(tieu_de, noi_dung):
    """Tạo thông báo mới."""
    conn = get_db_connection_service()
    if not conn: return None, "Lỗi kết nối DB"
    try:
        cursor = conn.cursor()
        query = """
            INSERT INTO thong_bao (id_nhan_vien_phu_trach, tieu_de, noi_dung, ngay_gui)
            VALUES (%s, %s, %s, %s)
        """
        ngay_gui = datetime.datetime.now()
        cursor.execute(query, (STAFF_ID, tieu_de, noi_dung, ngay_gui))
        conn.commit()
        noti_id = cursor.lastrowid
        cursor.close()
        return {"id_thong_bao": noti_id, "ngay_gui": ngay_gui.isoformat()}, None
    except mysql.connector.Error as err:
        conn.rollback(); print(f"Lỗi MySQL khi tạo thông báo: {err}")
        return None, f"Lỗi DB khi tạo thông báo: {err}"
    except Exception as e: conn.rollback(); print(f"Lỗi khác khi tạo thông báo: {e}"); return None, f"Lỗi hệ thống: {e}"
    finally:
        if conn and conn.is_connected(): conn.close()