# filepath: d:\course\PTTKHTTT\PTTK\be\services\user_service.py
import mysql.connector
from flask import current_app
from .auth_service import get_db_connection_service # Tái sử dụng hash
import datetime

def _map_user_role(role_input):
    # Ánh xạ vai trò từ input sang giá trị lưu trong DB (nếu cần)
    mapping = {
        "staff": "NhanVienPhuTrach",
        "resident": "CuDan",
        "manager": "QuanLyToaNha"
    }
    return mapping.get(str(role_input).lower())

def get_users_by_role(role):
    """Lấy danh sách người dùng theo vai trò."""
    db_role = _map_user_role(role)
    if not db_role: return None, f"Vai trò '{role}' không hợp lệ."

    conn = get_db_connection_service()
    if not conn: return None, "Lỗi kết nối DB"
    users = []
    try:
        cursor = conn.cursor(dictionary=True)
        # Không lấy mật khẩu
        query = "SELECT id_nguoi_dung, ho_ten, email, so_dien_thoai, ngay_tao FROM nguoi_dung WHERE vai_tro = %s ORDER BY ho_ten"
        cursor.execute(query, (db_role,))
        users = cursor.fetchall()
        cursor.close()
        for u in users:
            if u.get('ngay_tao') and isinstance(u['ngay_tao'], datetime.datetime):
                u['ngay_tao'] = u['ngay_tao'].isoformat()
        return users, None
    except mysql.connector.Error as err: print(f"Lỗi MySQL khi lấy user theo role: {err}"); return None, f"Lỗi DB: {err}"
    except Exception as e: print(f"Lỗi khác khi lấy user: {e}"); return None, f"Lỗi hệ thống: {e}"
    finally:
        if conn and conn.is_connected(): conn.close()

def create_user(data, role):
    """Tạo người dùng mới (Staff hoặc Resident)."""
    db_role = _map_user_role(role)
    if not db_role: return None, f"Vai trò '{role}' không hợp lệ."

    conn = get_db_connection_service()
    if not conn: return None, "Lỗi kết nối DB"
    try:
        cursor = conn.cursor()
        # Sử dụng mật khẩu trực tiếp từ data, không băm
        plain_password = data['mat_khau']
        query = """
            INSERT INTO nguoi_dung (ho_ten, email, mat_khau, so_dien_thoai, vai_tro, ngay_tao)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        ngay_tao = datetime.datetime.now()
        cursor.execute(query, (
            data['ho_ten'], data['email'], plain_password, data.get('so_dien_thoai'), db_role, ngay_tao
        ))
        conn.commit()
        user_id = cursor.lastrowid
        cursor.close()
        return {"id_nguoi_dung": user_id, "vai_tro": db_role}, None
    # ... (except blocks giữ nguyên) ...
    except mysql.connector.Error as err:
        conn.rollback(); print(f"Lỗi MySQL khi tạo user: {err}")
        if err.errno == 1062: return None, "Email đã tồn tại."
        return None, f"Lỗi DB khi tạo user: {err}"
    except KeyError as e: return None, f"Thiếu trường dữ liệu '{e}'."
    except Exception as e: conn.rollback(); print(f"Lỗi khác khi tạo user: {e}"); return None, f"Lỗi hệ thống: {e}"
    finally:
        if conn and conn.is_connected(): conn.close()

def update_user(user_id, data):
    """Cập nhật thông tin người dùng (không bao gồm mật khẩu, vai trò)."""
    conn = get_db_connection_service()
    if not conn: return False, "Lỗi kết nối DB"
    allowed_fields = ['ho_ten', 'email', 'so_dien_thoai'] # Chỉ cho phép cập nhật các trường này
    set_clauses = []
    params = []
    for field, value in data.items():
        if field in allowed_fields:
            set_clauses.append(f"{field} = %s")
            params.append(value)
    if not set_clauses: return False, "Không có trường hợp lệ để cập nhật."
    params.append(user_id)
    try:
        cursor = conn.cursor()
        query = f"UPDATE nguoi_dung SET {', '.join(set_clauses)} WHERE id_nguoi_dung = %s"
        cursor.execute(query, tuple(params))
        affected_rows = cursor.rowcount
        conn.commit()
        cursor.close()
        if affected_rows > 0: return True, "Cập nhật thành công."
        else: return False, f"Không tìm thấy người dùng ID {user_id} hoặc không có gì thay đổi."
    except mysql.connector.Error as err:
        conn.rollback(); print(f"Lỗi MySQL khi cập nhật user {user_id}: {err}")
        if err.errno == 1062: return False, "Email đã tồn tại."
        return False, f"Lỗi DB khi cập nhật: {err}"
    except Exception as e: conn.rollback(); print(f"Lỗi khác khi cập nhật user {user_id}: {e}"); return False, f"Lỗi hệ thống: {e}"
    finally:
        if conn and conn.is_connected(): conn.close()

def delete_user(user_id):
    """Xóa người dùng (nên là soft delete thay vì xóa cứng)."""
    # Hiện tại đang xóa cứng, CẨN THẬN VỚI KHÓA NGOẠI!
    conn = get_db_connection_service()
    if not conn: return False, "Lỗi kết nối DB"
    try:
        cursor = conn.cursor()
        # Kiểm tra khóa ngoại trước khi xóa? (Ví dụ: nhân viên đang phụ trách yêu cầu?)
        query = "DELETE FROM nguoi_dung WHERE id_nguoi_dung = %s"
        cursor.execute(query, (user_id,))
        affected_rows = cursor.rowcount
        conn.commit()
        cursor.close()
        if affected_rows > 0: return True, "Xóa người dùng thành công."
        else: return False, f"Không tìm thấy người dùng ID {user_id}."
    except mysql.connector.Error as err:
        conn.rollback(); print(f"Lỗi MySQL khi xóa user {user_id}: {err}")
        if err.errno == 1451: return False, "Không thể xóa: Người dùng này đang được tham chiếu ở bảng khác (ví dụ: yêu cầu, hóa đơn)." # Foreign key constraint
        return False, f"Lỗi DB khi xóa: {err}"
    except Exception as e: conn.rollback(); print(f"Lỗi khác khi xóa user {user_id}: {e}"); return False, f"Lỗi hệ thống: {e}"
    finally:
        if conn and conn.is_connected(): conn.close()