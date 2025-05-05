# filepath: d:\course\PTTKHTTT\PTTK\be\services\report_service.py
import mysql.connector
from flask import current_app
from .auth_service import get_db_connection_service
import datetime

STAFF_ID = 2 # Hardcode ID nhân viên

def create_financial_report(tieu_de, mo_ta, tong_thu, tong_chi):
    """Tạo báo cáo thu chi mới."""
    conn = get_db_connection_service()
    if not conn: return None, "Lỗi kết nối DB"
    try:
        cursor = conn.cursor()
        query = """
            INSERT INTO bao_cao_thu_chi
            (tieu_de, mo_ta, tong_thu, tong_chi, ngay_lap, id_nhan_vien_lap, trang_thai)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        ngay_lap = datetime.datetime.now()
        trang_thai = 'Mới'
        cursor.execute(query, (
            tieu_de, mo_ta, tong_thu, tong_chi, ngay_lap, STAFF_ID, trang_thai
        ))
        conn.commit()
        report_id = cursor.lastrowid
        cursor.close()
        return {"id_bao_cao_thu_chi": report_id, "ngay_lap": ngay_lap.isoformat()}, None
    except mysql.connector.Error as err:
        conn.rollback(); print(f"Lỗi MySQL khi tạo BCTC: {err}")
        return None, f"Lỗi DB khi tạo BCTC: {err}"
    except Exception as e: conn.rollback(); print(f"Lỗi khác khi tạo BCTC: {e}"); return None, f"Lỗi hệ thống: {e}"
    finally:
        if conn and conn.is_connected(): conn.close()

def get_financial_reports():
    """Lấy danh sách tất cả báo cáo thu chi."""
    conn = get_db_connection_service()
    if not conn: return None, "Lỗi kết nối DB"
    reports = []
    try:
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT bc.id_bao_cao_thu_chi, bc.tieu_de, bc.mo_ta, bc.tong_thu, bc.tong_chi,
                   bc.ngay_lap, bc.id_nhan_vien_lap, nd.ho_ten AS ten_nhan_vien_lap, bc.trang_thai
            FROM bao_cao_thu_chi bc
            LEFT JOIN nguoi_dung nd ON bc.id_nhan_vien_lap = nd.id_nguoi_dung
            ORDER BY bc.ngay_lap DESC
        """
        cursor.execute(query)
        reports = cursor.fetchall()
        cursor.close()
        # Chuyển đổi kiểu dữ liệu
        for r in reports:
            for key, value in r.items():
                if isinstance(value, datetime.datetime): r[key] = value.isoformat()
                elif isinstance(value, mysql.connector.types.Decimal): r[key] = float(value)
        return reports, None
    except mysql.connector.Error as err: print(f"Lỗi MySQL khi lấy BCTC: {err}"); return None, f"Lỗi DB: {err}"
    except Exception as e: print(f"Lỗi khác khi lấy BCTC: {e}"); return None, f"Lỗi hệ thống: {e}"
    finally:
        if conn and conn.is_connected(): conn.close()