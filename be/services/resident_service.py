# filepath: d:\course\PTTKHTTT\PTTK\be\services\resident_service.py
import mysql.connector
from flask import current_app
from .auth_service import get_db_connection_service
import datetime

def get_resident_details(resident_id):
    """Lấy thông tin chi tiết của cư dân bao gồm căn hộ và hợp đồng."""
    conn = get_db_connection_service()
    if not conn:
        return None, "Lỗi kết nối database"

    details = {}
    try:
        cursor = conn.cursor(dictionary=True)

        # Lấy thông tin người dùng và cư dân
        query_user = """
            SELECT nd.ho_ten, nd.email, nd.so_dien_thoai, nd.ngay_sinh, nd.gioi_tinh, nd.dia_chi,
                   cd.ngay_chuyen_den
            FROM nguoi_dung nd
            JOIN cu_dan cd ON nd.id_nguoi_dung = cd.id_cu_dan
            WHERE nd.id_nguoi_dung = %s AND nd.trang_thai = 1
        """
        cursor.execute(query_user, (resident_id,))
        user_info = cursor.fetchone()
        if not user_info:
            cursor.close()
            return None, "Không tìm thấy thông tin cư dân hoặc tài khoản bị khóa."
        details.update(user_info)

        # Lấy thông tin hợp đồng và căn hộ (giả sử mỗi cư dân chỉ có 1 hợp đồng hiệu lực tại 1 thời điểm)
        query_contract_apt = """
            SELECT hd.so_hop_dong, hd.ngay_bat_dau, hd.ngay_ket_thuc, hd.tien_dat_coc,
                   hd.loai_hop_dong, hd.trang_thai AS trang_thai_hop_dong,
                   ch.ma_can, ch.toa_nha, ch.tang, ch.dien_tich, ch.so_phong_ngu,
                   ch.so_phong_tam, ch.trang_thai AS trang_thai_can_ho
            FROM hop_dong hd
            JOIN can_ho ch ON hd.id_can_ho = ch.id_can_ho
            WHERE hd.id_cu_dan = %s
            ORDER BY hd.trang_thai = 'Hiệu_lực' DESC, hd.ngay_bat_dau DESC
            LIMIT 1
        """
        cursor.execute(query_contract_apt, (resident_id,))
        contract_apt_info = cursor.fetchone()

        if contract_apt_info:
            details['hop_dong'] = {
                'so_hop_dong': contract_apt_info['so_hop_dong'],
                'ngay_bat_dau': contract_apt_info['ngay_bat_dau'],
                'ngay_ket_thuc': contract_apt_info['ngay_ket_thuc'],
                'tien_dat_coc': contract_apt_info['tien_dat_coc'],
                'loai_hop_dong': contract_apt_info['loai_hop_dong'],
                'trang_thai': contract_apt_info['trang_thai_hop_dong'],
            }
            details['can_ho'] = {
                'ma_can': contract_apt_info['ma_can'],
                'toa_nha': contract_apt_info['toa_nha'],
                'tang': contract_apt_info['tang'],
                'dien_tich': contract_apt_info['dien_tich'],
                'so_phong_ngu': contract_apt_info['so_phong_ngu'],
                'so_phong_tam': contract_apt_info['so_phong_tam'],
                'trang_thai': contract_apt_info['trang_thai_can_ho'],
            }

        cursor.close()

        # Chuyển đổi kiểu dữ liệu datetime/date/decimal thành string/float
        for key, value in details.items():
            if isinstance(value, (datetime.datetime, datetime.date)):
                details[key] = value.isoformat().split('T')[0]
            elif isinstance(value, dict):
                 for sub_key, sub_value in value.items():
                     if isinstance(sub_value, (datetime.datetime, datetime.date)):
                         value[sub_key] = sub_value.isoformat().split('T')[0]
                     elif isinstance(sub_value, (mysql.connector.types.Decimal)):
                        value[sub_key] = float(sub_value)
            elif isinstance(value, (mysql.connector.types.Decimal)):
                 details[key] = float(value)


        return details, None

    except mysql.connector.Error as err:
        print(f"Lỗi truy vấn chi tiết cư dân: {err}")
        return None, f"Lỗi truy vấn chi tiết cư dân: {err}"
    finally:
        if conn.is_connected():
            conn.close()