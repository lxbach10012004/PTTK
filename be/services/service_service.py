# filepath: d:\course\PTTKHTTT\PTTK\be\services\service_service.py
import mysql.connector
from flask import current_app
from .auth_service import get_db_connection_service
import datetime

def get_available_services():
    """Lấy danh sách dịch vụ đang hoạt động và hiển thị cho cư dân."""
    conn = get_db_connection_service()
    if not conn: return None, "Lỗi kết nối DB"
    services = []
    try:
        cursor = conn.cursor(dictionary=True)
        # Chỉ lấy dịch vụ hoạt động (trang_thai=1) VÀ hiển thị cho cư dân (hien_thi_cho_cu_dan=1)
        query = "SELECT * FROM dich_vu WHERE trang_thai = 1 AND hien_thi_cho_cu_dan = 1 ORDER BY ten_dich_vu"
        cursor.execute(query)
        services = cursor.fetchall()
        cursor.close()
        # ... (xử lý Decimal) ...
        for s in services:
             if s.get('don_gia') and isinstance(s['don_gia'], mysql.connector.types.Decimal):
                 s['don_gia'] = float(s['don_gia'])
        return services, None
    except mysql.connector.Error as err: print(f"Lỗi MySQL khi lấy dịch vụ cư dân: {err}"); return None, f"Lỗi DB: {err}"
    except Exception as e: print(f"Lỗi khác khi lấy dịch vụ cư dân: {e}"); return None, f"Lỗi hệ thống: {e}"
    finally:
        if conn and conn.is_connected(): conn.close()

def get_internal_services():
    """Lấy danh sách dịch vụ nội bộ đang hoạt động."""
    conn = get_db_connection_service()
    if not conn: return None, "Lỗi kết nối DB"
    services = []
    try:
        cursor = conn.cursor(dictionary=True)
        # Chỉ lấy dịch vụ hoạt động (trang_thai=1) VÀ KHÔNG hiển thị cho cư dân (hien_thi_cho_cu_dan=0)
        query = "SELECT * FROM dich_vu WHERE trang_thai = 1 AND hien_thi_cho_cu_dan = 0 ORDER BY ten_dich_vu"
        cursor.execute(query)
        services = cursor.fetchall()
        cursor.close()
        # ... (xử lý Decimal) ...
        for s in services:
             if s.get('don_gia') and isinstance(s['don_gia'], mysql.connector.types.Decimal):
                 s['don_gia'] = float(s['don_gia'])
        return services, None
    except mysql.connector.Error as err: print(f"Lỗi MySQL khi lấy dịch vụ nội bộ: {err}"); return None, f"Lỗi DB: {err}"
    except Exception as e: print(f"Lỗi khác khi lấy dịch vụ nội bộ: {e}"); return None, f"Lỗi hệ thống: {e}"
    finally:
        if conn and conn.is_connected(): conn.close()

def create_service(data):
    """Tạo dịch vụ mới."""
    conn = get_db_connection_service()
    if not conn: return None, "Lỗi kết nối DB"
    try:
        cursor = conn.cursor()
        query = """
            INSERT INTO dich_vu (ten_dich_vu, don_gia, don_vi_tinh, mo_ta, trang_thai, hien_thi_cho_cu_dan)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        trang_thai = data.get('trang_thai', 1)
        # Mặc định là dịch vụ nội bộ nếu không nói gì? Hoặc lấy từ data
        hien_thi = data.get('hien_thi_cho_cu_dan', 0) # Mặc định là nội bộ
        cursor.execute(query, (
            data['ten_dich_vu'], data['don_gia'], data['don_vi_tinh'], data.get('mo_ta'), trang_thai, hien_thi
        ))
        conn.commit()
        service_id = cursor.lastrowid
        cursor.close()
        return {"id_dich_vu": service_id}, None
    # ... (except blocks giữ nguyên) ...
    except KeyError as e: return None, f"Thiếu trường dữ liệu '{e}'."
    except Exception as e: conn.rollback(); print(f"Lỗi khác khi tạo dịch vụ: {e}"); return None, f"Lỗi hệ thống: {e}"
    finally:
        if conn and conn.is_connected(): conn.close()


def update_service(service_id, data):
    """Cập nhật thông tin dịch vụ."""
    conn = get_db_connection_service()
    if not conn: return False, "Lỗi kết nối DB"
    # Thêm 'hien_thi_cho_cu_dan' vào allowed fields
    allowed = ['ten_dich_vu', 'don_gia', 'don_vi_tinh', 'mo_ta', 'trang_thai', 'hien_thi_cho_cu_dan']
    set_clauses = []
    params = []
    for field, value in data.items():
        if field in allowed:
            set_clauses.append(f"{field} = %s")
            params.append(value)
    # ... (phần còn lại của try-except giữ nguyên) ...
    if not set_clauses: return False, "Không có trường hợp lệ để cập nhật."
    params.append(service_id)
    try:
        cursor = conn.cursor()
        query = f"UPDATE dich_vu SET {', '.join(set_clauses)} WHERE id_dich_vu = %s"
        cursor.execute(query, tuple(params))
        affected_rows = cursor.rowcount
        conn.commit()
        cursor.close()
        if affected_rows > 0: return True, "Cập nhật thành công."
        else: return False, f"Không tìm thấy dịch vụ ID {service_id} hoặc không có gì thay đổi."
    except mysql.connector.Error as err:
        conn.rollback(); print(f"Lỗi MySQL khi cập nhật dịch vụ {service_id}: {err}")
        return False, f"Lỗi DB khi cập nhật: {err}"
    except Exception as e: conn.rollback(); print(f"Lỗi khác khi cập nhật dịch vụ {service_id}: {e}"); return False, f"Lỗi hệ thống: {e}"
    finally:
        if conn and conn.is_connected(): conn.close()

# ... (delete_service và get_all_services giữ nguyên) ...
def delete_service(service_id):
    """Xóa dịch vụ (Soft delete bằng cách cập nhật trạng thái = 0)."""
    conn = get_db_connection_service()
    if not conn: return False, "Lỗi kết nối DB"
    try:
        cursor = conn.cursor()
        query = "UPDATE dich_vu SET trang_thai = 0 WHERE id_dich_vu = %s"
        cursor.execute(query, (service_id,))
        affected_rows = cursor.rowcount
        conn.commit()
        cursor.close()
        if affected_rows > 0: return True, "Xóa (ẩn) dịch vụ thành công."
        else: return False, f"Không tìm thấy dịch vụ ID {service_id}."
    except mysql.connector.Error as err:
        conn.rollback(); print(f"Lỗi MySQL khi xóa dịch vụ {service_id}: {err}")
        return False, f"Lỗi DB khi xóa: {err}"
    except Exception as e: conn.rollback(); print(f"Lỗi khác khi xóa dịch vụ {service_id}: {e}"); return False, f"Lỗi hệ thống: {e}"
    finally:
        if conn and conn.is_connected(): conn.close()

def get_all_services():
    """Lấy danh sách tất cả dịch vụ (bao gồm cả không hoạt động)."""
    conn = get_db_connection_service()
    if not conn: return None, "Lỗi kết nối DB"
    services = []
    try:
        cursor = conn.cursor(dictionary=True)
        query = "SELECT * FROM dich_vu ORDER BY ten_dich_vu"
        cursor.execute(query)
        services = cursor.fetchall()
        cursor.close()
        for s in services:
            if s.get('don_gia') and isinstance(s['don_gia'], mysql.connector.types.Decimal):
                s['don_gia'] = float(s['don_gia'])
        return services, None
    except mysql.connector.Error as err: print(f"Lỗi MySQL khi lấy tất cả dịch vụ: {err}"); return None, f"Lỗi DB: {err}"
    except Exception as e: print(f"Lỗi khác khi lấy tất cả dịch vụ: {e}"); return None, f"Lỗi hệ thống: {e}"
    finally:
        if conn and conn.is_connected(): conn.close()