# filepath: d:\course\PTTKHTTT\PTTK\be\services\request_service.py
import mysql.connector
from flask import current_app
from .auth_service import get_db_connection_service
import datetime

STAFF_ID = 2 # Hardcode ID của nhân viên duy nhất
MANAGER_ID = 1 # Hardcode ID của quản lý

# ... (create_service_request cho cư dân giữ nguyên) ...
def create_service_request(data):
    """Tạo yêu cầu dịch vụ mới (cho cư dân)."""
    conn = get_db_connection_service()
    if not conn: return None, "Lỗi kết nối DB"
    try:
        cursor = conn.cursor()
        # Kiểm tra xem id_dich_vu có phải là dịch vụ cho cư dân không? (Tùy chọn)
        # cursor.execute("SELECT 1 FROM dich_vu WHERE id_dich_vu = %s AND hien_thi_cho_cu_dan = 1", (data['id_dich_vu'],))
        # if not cursor.fetchone():
        #     return None, f"Dịch vụ ID {data['id_dich_vu']} không hợp lệ cho cư dân."

        query = """
            INSERT INTO yeu_cau_dich_vu
            (tieu_de, mo_ta, id_dich_vu, id_cu_dan, ngay_tao, ngay_hen, trang_thai, muc_do_uu_tien)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        ngay_tao = datetime.datetime.now()
        trang_thai = 'Mới'
        muc_do_uu_tien = data.get('muc_do_uu_tien', 'Trung_bình')
        cursor.execute(query, (
            data['tieu_de'], data.get('mo_ta'), data['id_dich_vu'], data['id_cu_dan'],
            ngay_tao, data['ngay_hen'], trang_thai, muc_do_uu_tien
        ))
        conn.commit()
        request_id = cursor.lastrowid
        cursor.close()
        return {"id_yeu_cau": request_id, "trang_thai": trang_thai, "ngay_tao": ngay_tao.isoformat()}, None
    except mysql.connector.Error as err:
        conn.rollback(); print(f"Lỗi MySQL khi tạo yêu cầu DV: {err}")
        if err.errno == 1452: return None, f"Lỗi tạo yêu cầu: ID Dịch vụ hoặc Cư dân không hợp lệ."
        return None, f"Lỗi DB khi tạo yêu cầu: {err}"
    except KeyError as e: return None, f"Thiếu trường dữ liệu '{e}'."
    except Exception as e: conn.rollback(); print(f"Lỗi khác khi tạo yêu cầu DV: {e}"); return None, f"Lỗi hệ thống: {e}"
    finally:
        if conn and conn.is_connected(): conn.close()

def create_manager_request(data):
    """Tạo yêu cầu nội bộ mới (cho quản lý)."""
    conn = get_db_connection_service()
    if not conn: return None, "Lỗi kết nối DB"
    try:
        cursor = conn.cursor()
        # Kiểm tra xem id_dich_vu có phải là dịch vụ nội bộ không?
        cursor.execute("SELECT 1 FROM dich_vu WHERE id_dich_vu = %s AND hien_thi_cho_cu_dan = 0", (data['id_dich_vu'],))
        if not cursor.fetchone():
            return None, f"Dịch vụ ID {data['id_dich_vu']} không phải là dịch vụ nội bộ."

        query = """
            INSERT INTO yeu_cau_dich_vu
            (tieu_de, mo_ta, id_dich_vu, id_quan_ly, ngay_tao, trang_thai, muc_do_uu_tien)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        ngay_tao = datetime.datetime.now()
        trang_thai = 'Mới'
        muc_do_uu_tien = data.get('muc_do_uu_tien', 'Cao')
        # id_cu_dan là NULL cho yêu cầu nội bộ
        # id_nhan_vien_phu_trach có thể được gán ngay lúc tạo
        # id_nhan_vien = data.get('id_nhan_vien_phu_trach')

        cursor.execute(query, (
            data['tieu_de'], data.get('mo_ta'), data['id_dich_vu'], 1, # id_cu_dan = NULL
            ngay_tao, trang_thai, muc_do_uu_tien
        ))
        conn.commit()
        request_id = cursor.lastrowid
        cursor.close()
        # Có thể thêm log ghi nhận MANAGER_ID đã tạo yêu cầu này
        return {"id_yeu_cau": request_id, "trang_thai": trang_thai, "ngay_tao": ngay_tao.isoformat()}, None
    except mysql.connector.Error as err:
        conn.rollback(); print(f"Lỗi MySQL khi tạo yêu cầu NB: {err}")
        if err.errno == 1452: return None, f"Lỗi tạo yêu cầu: ID Dịch vụ hoặc Nhân viên không hợp lệ."
        return None, f"Lỗi DB khi tạo yêu cầu: {err}"
    except KeyError as e: return None, f"Thiếu trường dữ liệu '{e}'."
    except Exception as e: conn.rollback(); print(f"Lỗi khác khi tạo yêu cầu NB: {e}"); return None, f"Lỗi hệ thống: {e}"
    finally:
        if conn and conn.is_connected(): conn.close()


def get_requests(filters=None, user_role='staff', user_id=None):
    """Lấy danh sách yêu cầu dịch vụ dựa trên vai trò và bộ lọc."""
    conn = get_db_connection_service()
    if not conn: return None, "Lỗi kết nối DB"
    requests_list = []
    try:
        cursor = conn.cursor(dictionary=True)
        base_query = """
            SELECT
                yc.id_yeu_cau, yc.tieu_de, yc.mo_ta, yc.id_dich_vu, yc.id_cu_dan,
                yc.id_nhan_vien_phu_trach, yc.muc_do_uu_tien, yc.trang_thai,
                yc.ngay_tao, yc.ngay_hen, yc.ngay_hoan_thanh,
                dv.ten_dich_vu, dv.hien_thi_cho_cu_dan, -- Lấy thêm loại dịch vụ
                nd_cd.ho_ten AS ten_cu_dan, nd_cd.so_dien_thoai AS sdt_cu_dan,
                nd_nv.ho_ten AS ten_nhan_vien
            FROM yeu_cau_dich_vu yc
            JOIN dich_vu dv ON yc.id_dich_vu = dv.id_dich_vu -- JOIN để lọc theo loại dịch vụ
            LEFT JOIN nguoi_dung nd_cd ON yc.id_cu_dan = nd_cd.id_nguoi_dung
            LEFT JOIN nguoi_dung nd_nv ON yc.id_nhan_vien_phu_trach = nd_nv.id_nguoi_dung
        """
        where_clauses = []
        params = []

        if user_role == 'resident' and user_id:
            where_clauses.append("yc.id_cu_dan = %s")
            params.append(user_id)
            # Cư dân chỉ xem được yêu cầu của dịch vụ dành cho cư dân
            where_clauses.append("dv.hien_thi_cho_cu_dan = 1")
        elif user_role == 'staff':
            # Nhân viên xem các yêu cầu Mới và Đang xử lý (cả nội bộ và cư dân)
            default_status = ['Mới', 'Đang_xử_lý']
            status_to_query = default_status
            if filters and 'status' in filters and filters['status']:
                 status_list = filters['status'].split(',') if isinstance(filters['status'], str) else filters['status']
                 if status_list: status_to_query = status_list

            placeholders = ', '.join(['%s'] * len(status_to_query))
            where_clauses.append(f"yc.trang_thai IN ({placeholders})")
            params.extend(status_to_query)
            # Có thể thêm filter theo nhân viên được gán nếu cần:
            # if filters and 'assigned_staff_id' in filters and filters['assigned_staff_id']:
            #    where_clauses.append("yc.id_nhan_vien_phu_trach = %s")
            #    params.append(filters['assigned_staff_id'])
        elif user_role == 'manager':
            # Quản lý xem tất cả (hoặc theo filter nếu có)
            if filters and 'status' in filters and filters['status']:
                status_list = filters['status'].split(',') if isinstance(filters['status'], str) else filters['status']
                if status_list:
                    placeholders = ', '.join(['%s'] * len(status_list))
                    where_clauses.append(f"yc.trang_thai IN ({placeholders})")
                    params.extend(status_list)
            # Thêm các filter khác cho quản lý nếu cần (theo loại dv, theo nv, theo cư dân...)
            if filters and 'service_type' in filters:
                 if filters['service_type'] == 'resident': where_clauses.append("dv.hien_thi_cho_cu_dan = 1")
                 elif filters['service_type'] == 'internal': where_clauses.append("dv.hien_thi_cho_cu_dan = 0")
            if filters and 'resident_id' in filters and filters['resident_id']:
                 where_clauses.append("yc.id_cu_dan = %s")
                 params.append(filters['resident_id'])

        # Ghép query
        if where_clauses:
            query = base_query + " WHERE " + " AND ".join(where_clauses)
        else: # Nếu không có điều kiện nào (ví dụ manager xem tất cả)
            query = base_query
        query += " ORDER BY yc.ngay_tao DESC"

        cursor.execute(query, tuple(params))
        requests_list = cursor.fetchall()
        cursor.close()
        # ... (xử lý datetime, Decimal) ...
        for req in requests_list:
            for key, value in req.items():
                if isinstance(value, (datetime.datetime, datetime.date)): req[key] = value.isoformat()
                elif isinstance(value, mysql.connector.types.Decimal): req[key] = float(value)
        return requests_list, None
    except mysql.connector.Error as err: print(f"Lỗi MySQL khi lấy yêu cầu: {err}"); return None, f"Lỗi DB: {err}"
    except Exception as e: print(f"Lỗi khác khi lấy yêu cầu: {e}"); return None, f"Lỗi hệ thống: {e}"
    finally:
        if conn and conn.is_connected(): conn.close()

# ... (update_request, create_request_report giữ nguyên) ...
def update_request(request_id, update_data):
    """Cập nhật yêu cầu, không cần staff_id."""
    conn = get_db_connection_service()
    if not conn: return False, "Lỗi kết nối DB"
    allowed_fields = ['trang_thai', 'id_nhan_vien_phu_trach', 'ngay_hoan_thanh', 'mo_ta', 'muc_do_uu_tien']
    set_clauses = []
    params = []

    # Tự động gán nhân viên STAFF_ID nếu trạng thái là Đang_xử_lý và chưa có ai gán
    if update_data.get('trang_thai') == 'Đang_xử_lý' and 'id_nhan_vien_phu_trach' not in update_data:
         # Kiểm tra xem yêu cầu đã có người phụ trách chưa trước khi gán cứng
         cursor_check = conn.cursor(dictionary=True)
         cursor_check.execute("SELECT id_nhan_vien_phu_trach FROM yeu_cau_dich_vu WHERE id_yeu_cau = %s", (request_id,))
         current_assignment = cursor_check.fetchone()
         cursor_check.close()
         if current_assignment and current_assignment['id_nhan_vien_phu_trach'] is None:
              update_data['id_nhan_vien_phu_trach'] = STAFF_ID

    # Tự động thêm ngày hoàn thành nếu trạng thái là Hoàn_thành
    if update_data.get('trang_thai') == 'Hoàn_thành' and 'ngay_hoan_thanh' not in update_data:
         update_data['ngay_hoan_thanh'] = datetime.datetime.now().isoformat()

    for field, value in update_data.items():
        if field in allowed_fields:
            if field == 'id_nhan_vien_phu_trach' and (value is None or str(value).lower() == 'null' or value == 0):
                 set_clauses.append("id_nhan_vien_phu_trach = NULL")
            else:
                 set_clauses.append(f"{field} = %s")
                 params.append(value)

    if not set_clauses: return False, "Không có trường hợp lệ để cập nhật."
    params.append(request_id)

    try:
        cursor = conn.cursor()
        query = f"UPDATE yeu_cau_dich_vu SET {', '.join(set_clauses)} WHERE id_yeu_cau = %s"
        cursor.execute(query, tuple(params))
        affected_rows = cursor.rowcount
        conn.commit()
        cursor.close()
        if affected_rows > 0: return True, "Cập nhật thành công."
        else: return False, f"Không tìm thấy yêu cầu ID {request_id} hoặc không có gì thay đổi."
    except mysql.connector.Error as err:
        conn.rollback(); print(f"Lỗi MySQL khi cập nhật yêu cầu {request_id}: {err}")
        if err.errno == 1452: return False, f"Lỗi cập nhật: ID không hợp lệ."
        return False, f"Lỗi DB khi cập nhật: {err}"
    except Exception as e: conn.rollback(); print(f"Lỗi khác khi cập nhật yêu cầu {request_id}: {e}"); return False, f"Lỗi hệ thống: {e}"
    finally:
        if conn and conn.is_connected(): conn.close()

def create_request_report(request_id, noi_dung, file_dinh_kem=None):
    """Tạo báo cáo, dùng STAFF_ID."""
    conn = get_db_connection_service()
    if not conn: return None, "Lỗi kết nối DB"
    try:
        cursor = conn.cursor()
        query = """
            INSERT INTO bao_cao_phan_hoi
            (id_yeu_cau, id_nhan_vien_phu_trach, noi_dung, ngay_tao, file_dinh_kem, trang_thai)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        ngay_tao = datetime.datetime.now()
        trang_thai = 'Mới' # Trạng thái của báo cáo, không phải của yêu cầu
        cursor.execute(query, (request_id, STAFF_ID, noi_dung, ngay_tao, file_dinh_kem, trang_thai))
        conn.commit()
        report_id = cursor.lastrowid
        cursor.close()
        return {"id_bao_cao": report_id, "ngay_tao": ngay_tao.isoformat()}, None
    except mysql.connector.Error as err:
        conn.rollback(); print(f"Lỗi MySQL khi tạo báo cáo {request_id}: {err}")
        if err.errno == 1452: return None, f"Lỗi tạo báo cáo: ID Yêu cầu không hợp lệ."
        return None, f"Lỗi DB khi tạo báo cáo: {err}"
    except Exception as e: conn.rollback(); print(f"Lỗi khác khi tạo báo cáo {request_id}: {e}"); return None, f"Lỗi hệ thống: {e}"
    finally:
        if conn and conn.is_connected(): conn.close()