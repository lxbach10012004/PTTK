# filepath: d:\course\PTTKHTTT\PTTK\be\services\apartment_service.py
import mysql.connector
from flask import current_app
from .auth_service import get_db_connection_service

def get_apartments():
    """Lấy danh sách tất cả căn hộ kèm tên cư dân hiện tại (nếu có hợp đồng hiệu lực)."""
    conn = get_db_connection_service()
    if not conn:
        return None, "Lỗi kết nối DB"
    apartments = []
    try:
        cursor = conn.cursor(dictionary=True)
        # Cập nhật câu query để JOIN với hop_dong và nguoi_dung
        query = """
            SELECT
                ch.*,
                nd.ho_ten AS ten_cu_dan_hien_tai
            FROM can_ho ch
            LEFT JOIN hop_dong hd ON ch.id_can_ho = hd.id_can_ho AND hd.trang_thai = 'Hiệu_lực'
            LEFT JOIN nguoi_dung nd ON hd.id_cu_dan = nd.id_nguoi_dung
            ORDER BY ch.ma_can
        """
        cursor.execute(query)
        apartments = cursor.fetchall()
        cursor.close()
        # Xử lý kiểu Decimal nếu có
        for apt in apartments:
            if apt.get('dien_tich') and isinstance(apt['dien_tich'], mysql.connector.types.Decimal):
                apt['dien_tich'] = float(apt['dien_tich'])
            # Đảm bảo ten_cu_dan_hien_tai là None nếu không có cư dân
            if 'ten_cu_dan_hien_tai' not in apt:
                 apt['ten_cu_dan_hien_tai'] = None

        return apartments, None
    except mysql.connector.Error as err:
        print(f"Lỗi MySQL khi lấy căn hộ: {err}")
        return None, f"Lỗi DB: {err}"
    except Exception as e:
        print(f"Lỗi khác khi lấy căn hộ: {e}")
        return None, f"Lỗi hệ thống: {e}"
    finally:
        if conn and conn.is_connected():
            conn.close()

def create_apartment(data):
    """Tạo căn hộ mới."""
    conn = get_db_connection_service()
    if not conn:
        return None, "Lỗi kết nối DB"
    try:
        cursor = conn.cursor()
        query = """
            INSERT INTO can_ho (ma_can, toa_nha, tang, dien_tich, so_phong_ngu, so_phong_tam, trang_thai)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (
            data['ma_can'], data['toa_nha'], data.get('tang'),
            data.get('dien_tich'), data.get('so_phong_ngu'),
            data.get('so_phong_tam'), data.get('trang_thai', 'Trống')
        ))
        conn.commit()
        apt_id = cursor.lastrowid
        cursor.close()
        return {"id_can_ho": apt_id}, None
    except mysql.connector.Error as err:
        conn.rollback()
        print(f"Lỗi MySQL khi tạo căn hộ: {err}")
        if err.errno == 1062:
            return None, f"Mã căn hộ '{data.get('ma_can')}' đã tồn tại."
        return None, f"Lỗi DB khi tạo căn hộ: {err}"
    except KeyError as e:
        return None, f"Thiếu trường dữ liệu '{e}'"
    except Exception as e:
        conn.rollback()
        print(f"Lỗi khác khi tạo căn hộ: {e}")
        return None, f"Lỗi hệ thống: {e}"
    finally:
        if conn and conn.is_connected():
            conn.close()

def update_apartment(apartment_id, data):
    """Cập nhật thông tin căn hộ."""
    conn = get_db_connection_service()
    if not conn:
        return False, "Lỗi kết nối DB"
    allowed = ['ma_can', 'toa_nha', 'tang', 'dien_tich', 'so_phong_ngu', 'so_phong_tam', 'trang_thai']
    set_clauses = []
    params = []
    for field, value in data.items():
        if field in allowed:
            set_clauses.append(f"{field} = %s")
            params.append(value)
    if not set_clauses:
        return False, "Không có trường hợp lệ để cập nhật."
    params.append(apartment_id)
    try:
        cursor = conn.cursor()
        query = f"UPDATE can_ho SET {', '.join(set_clauses)} WHERE id_can_ho = %s"
        cursor.execute(query, tuple(params))
        affected_rows = cursor.rowcount
        conn.commit()
        cursor.close()
        if affected_rows > 0:
            return True, "Cập nhật thành công."
        else:
            return False, f"Không tìm thấy căn hộ ID {apartment_id} hoặc không có gì thay đổi."
    except mysql.connector.Error as err:
        conn.rollback()
        print(f"Lỗi MySQL khi cập nhật căn hộ {apartment_id}: {err}")
        if err.errno == 1062:
            return False, f"Mã căn hộ '{data.get('ma_can')}' đã tồn tại."
        return False, f"Lỗi DB khi cập nhật: {err}"
    except Exception as e:
        conn.rollback()
        print(f"Lỗi khác khi cập nhật căn hộ {apartment_id}: {e}")
        return False, f"Lỗi hệ thống: {e}"
    finally:
        if conn and conn.is_connected():
            conn.close()

def delete_apartment(apartment_id):
    """Xóa căn hộ."""
    conn = get_db_connection_service()
    if not conn:
        return False, "Lỗi kết nối DB"
    try:
        cursor = conn.cursor()
        query = "DELETE FROM can_ho WHERE id_can_ho = %s"
        cursor.execute(query, (apartment_id,))
        affected_rows = cursor.rowcount
        conn.commit()
        cursor.close()
        if affected_rows > 0:
            return True, "Xóa căn hộ thành công."
        else:
            return False, f"Không tìm thấy căn hộ ID {apartment_id}."
    except mysql.connector.Error as err:
        conn.rollback()
        print(f"Lỗi MySQL khi xóa căn hộ {apartment_id}: {err}")
        return False, f"Lỗi DB khi xóa: {err}"
    except Exception as e:
        conn.rollback()
        print(f"Lỗi khác khi xóa căn hộ {apartment_id}: {e}")
        return False, f"Lỗi hệ thống: {e}"
    finally:
        if conn and conn.is_connected():
            conn.close()
