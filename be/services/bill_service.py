# filepath: d:\course\PTTKHTTT\PTTK\be\services\bill_service.py
import mysql.connector
from flask import current_app
from .auth_service import get_db_connection_service
import datetime
import uuid

STAFF_ID = 2 

def get_bills_by_resident(resident_id):
    """Lấy danh sách hóa đơn (dịch vụ và bảo trì) của một cư dân."""
    conn = get_db_connection_service()
    if not conn:
        return None, "Lỗi kết nối database"

    bills = []
    try:
        cursor = conn.cursor(dictionary=True)

        # Lấy hóa đơn dịch vụ
        query_dv = """
            SELECT hd.id_hoa_don, hd.so_hoa_don, hd.ngay_xuat, hd.tong_tien, hd.trang_thai,
                   'Dịch vụ' AS loai_hoa_don_goc, dv.ten_dich_vu, yc.tieu_de AS tieu_de_yeu_cau
            FROM hoa_don_dich_vu hd
            JOIN yeu_cau_dich_vu yc ON hd.id_yeu_cau = yc.id_yeu_cau
            JOIN dich_vu dv ON yc.id_dich_vu = dv.id_dich_vu
            WHERE hd.id_cu_dan = %s
        """
        cursor.execute(query_dv, (resident_id,))
        service_bills = cursor.fetchall()
        for bill in service_bills:
            bill['loai_hoa_don'] = f"Dịch vụ ({bill.get('ten_dich_vu', 'N/A')})" # Tạo tên loại dễ hiểu hơn

        # Lấy hóa đơn phí bảo trì
        query_pbt = """
            SELECT id_hoa_don, so_hoa_don, ngay_xuat, tong_tien, trang_thai,
                   'Phí bảo trì' AS loai_hoa_don_goc
            FROM hoa_don_phi_bao_tri
            WHERE id_cu_dan = %s
        """
        # TODO: Cần thêm thông tin kỳ thanh toán (tháng/năm) vào bảng hoa_don_phi_bao_tri
        # Hiện tại chỉ lấy tên chung chung
        cursor.execute(query_pbt, (resident_id,))
        maintenance_bills = cursor.fetchall()
        for bill in maintenance_bills:
             # Giả sử có cột thang, nam trong bảng hoa_don_phi_bao_tri
             # bill['loai_hoa_don'] = f"Phí quản lý tháng {bill.get('thang', '?')}/{bill.get('nam', '?')}"
             bill['loai_hoa_don'] = "Phí quản lý/bảo trì" # Tên tạm thời

        cursor.close()

        # Kết hợp và sắp xếp
        all_bills = service_bills + maintenance_bills
        # Chuyển đổi kiểu dữ liệu datetime/date thành string
        for bill in all_bills:
            for key, value in bill.items():
                if isinstance(value, (datetime.datetime, datetime.date)):
                    bill[key] = value.isoformat().split('T')[0] # Chỉ lấy YYYY-MM-DD

        all_bills.sort(key=lambda x: x.get('ngay_xuat', ''), reverse=True)
        return all_bills, None

    except mysql.connector.Error as err:
        print(f"Lỗi truy vấn hóa đơn theo cư dân: {err}")
        return None, f"Lỗi truy vấn hóa đơn: {err}"
    finally:
        if conn.is_connected():
            conn.close()

def create_service_bill(request_id):
    """Tạo hóa đơn dịch vụ từ một yêu cầu đã hoàn thành."""
    conn = get_db_connection_service()
    if not conn: return None, "Lỗi kết nối DB"
    try:
        cursor = conn.cursor(dictionary=True)
        # 1. Lấy thông tin yêu cầu và dịch vụ tương ứng
        query_req = """
            SELECT yc.id_cu_dan, yc.id_quan_ly, dv.don_gia
            FROM yeu_cau_dich_vu yc
            JOIN dich_vu dv ON yc.id_dich_vu = dv.id_dich_vu
            WHERE yc.id_yeu_cau = %s AND yc.trang_thai = 'Hoàn_thành'
        """
        cursor.execute(query_req, (request_id,))
        req_info = cursor.fetchone()
        if not req_info:
            # Kiểm tra xem yêu cầu có tồn tại nhưng chưa hoàn thành không
            cursor.execute("SELECT trang_thai FROM yeu_cau_dich_vu WHERE id_yeu_cau = %s", (request_id,))
            status_check = cursor.fetchone()
            if status_check:
                 return None, f"Yêu cầu #{request_id} chưa hoàn thành (Trạng thái: {status_check['trang_thai']})."
            else:
                 return None, f"Không tìm thấy yêu cầu #{request_id} hoặc yêu cầu chưa hoàn thành."

        # 2. Kiểm tra xem hóa đơn đã tồn tại cho yêu cầu này chưa
        cursor.execute("SELECT id_hoa_don FROM hoa_don_dich_vu WHERE id_yeu_cau = %s", (request_id,))
        existing_bill = cursor.fetchone()
        if existing_bill:
            return None, f"Hóa đơn cho yêu cầu #{request_id} đã tồn tại (ID: {existing_bill['id_hoa_don']})."

        # 3. Tạo hóa đơn
        so_hoa_don = f"HDDV-{uuid.uuid4().hex[:8].upper()}" # Tạo số HĐ ngẫu nhiên
        ngay_xuat = datetime.date.today()
        tong_tien = req_info['don_gia'] # Lấy đơn giá từ dịch vụ
        trang_thai = 'Chưa_thanh_toán'

        query_insert = """
            INSERT INTO hoa_don_dich_vu
            (so_hoa_don, id_yeu_cau, id_cu_dan, id_quan_ly, id_nhan_vien_lap, ngay_xuat, tong_tien, trang_thai)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query_insert, (
            so_hoa_don, request_id, req_info['id_cu_dan'], req_info['id_quan_ly'],
            STAFF_ID, ngay_xuat, tong_tien, trang_thai
        ))
        conn.commit()
        bill_id = cursor.lastrowid
        cursor.close()
        return {"id_hoa_don": bill_id, "so_hoa_don": so_hoa_don, "ngay_xuat": ngay_xuat.isoformat(), "tong_tien": float(tong_tien)}, None
    except mysql.connector.Error as err:
        conn.rollback(); print(f"Lỗi MySQL khi tạo HĐDV {request_id}: {err}")
        return None, f"Lỗi DB khi tạo HĐDV: {err}"
    except Exception as e: conn.rollback(); print(f"Lỗi khác khi tạo HĐDV {request_id}: {e}"); return None, f"Lỗi hệ thống: {e}"
    finally:
        if conn and conn.is_connected(): conn.close()

def create_maintenance_bill(resident_id, amount, description="Phí quản lý/bảo trì"):
    """Tạo hóa đơn phí bảo trì hàng tháng cho cư dân."""
    conn = get_db_connection_service()
    if not conn: return None, "Lỗi kết nối DB"
    try:
        cursor = conn.cursor(dictionary=True)
        # Kiểm tra cư dân tồn tại
        cursor.execute("SELECT 1 FROM cu_dan WHERE id_cu_dan = %s", (resident_id,))
        if not cursor.fetchone():
            return None, f"Không tìm thấy cư dân với ID {resident_id}."

        so_hoa_don = f"HDPBT-{uuid.uuid4().hex[:8].upper()}"
        ngay_xuat = datetime.date.today()
        trang_thai = 'Chưa_thanh_toán'
        # TODO: Nên thêm cột kỳ thanh toán (tháng/năm) vào bảng hoa_don_phi_bao_tri
        # và kiểm tra xem đã tạo hóa đơn cho kỳ đó chưa.

        query_insert = """
            INSERT INTO hoa_don_phi_bao_tri
            (so_hoa_don, id_cu_dan, id_nhan_vien_lap, ngay_xuat, tong_tien, trang_thai)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query_insert, (
            so_hoa_don, resident_id, STAFF_ID, ngay_xuat, amount, trang_thai
        ))
        conn.commit()
        bill_id = cursor.lastrowid
        cursor.close()
        return {"id_hoa_don": bill_id, "so_hoa_don": so_hoa_don, "ngay_xuat": ngay_xuat.isoformat(), "tong_tien": float(amount)}, None
    except mysql.connector.Error as err:
        conn.rollback(); print(f"Lỗi MySQL khi tạo HDPBT cho {resident_id}: {err}")
        return None, f"Lỗi DB khi tạo HDPBT: {err}"
    except Exception as e: conn.rollback(); print(f"Lỗi khác khi tạo HDPBT cho {resident_id}: {e}"); return None, f"Lỗi hệ thống: {e}"
    finally:
        if conn and conn.is_connected(): conn.close()