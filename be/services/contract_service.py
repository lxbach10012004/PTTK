import mysql.connector
from flask import current_app, jsonify

def get_db_connection():
    """Lấy kết nối database từ app context."""
    try:
        # Lấy config từ app context
        db_config = current_app.config['DB_CONFIG']
        conn = mysql.connector.connect(**db_config)
        return conn
    except mysql.connector.Error as err:
        print(f"Lỗi kết nối database trong service: {err}")
        return None
    except Exception as e:
        # Bắt lỗi nếu config không tồn tại trong app context
        print(f"Lỗi lấy DB config từ app context: {e}")
        return None

def get_all_contracts_service():
    """Lấy tất cả hợp đồng kèm thông tin căn hộ và cư dân."""
    conn = get_db_connection()
    if not conn:
        return None, "Không thể kết nối đến database"
    try:
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT
                hd.*,
                ch.ma_can,
                nd.ho_ten AS ho_ten_cu_dan
            FROM hop_dong hd
            JOIN can_ho ch ON hd.id_can_ho = ch.id_can_ho
            JOIN nguoi_dung nd ON hd.id_cu_dan = nd.id_nguoi_dung
            ORDER BY hd.ngay_bat_dau DESC
        """
        cursor.execute(query)
        contracts = cursor.fetchall()
        return contracts, None
    except mysql.connector.Error as err:
        print(f"Lỗi truy vấn lấy danh sách hợp đồng: {err}")
        return None, f"Lỗi truy vấn database: {err}"
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

def get_contract_by_id_service(contract_id):
    """Lấy thông tin chi tiết một hợp đồng theo ID."""
    conn = get_db_connection()
    if not conn:
        return None, "Không thể kết nối đến database"
    try:
        cursor = conn.cursor(dictionary=True)
        query = "SELECT * FROM hop_dong WHERE id_hop_dong = %s"
        cursor.execute(query, (contract_id,))
        contract = cursor.fetchone()
        return contract, None
    except mysql.connector.Error as err:
        print(f"Lỗi truy vấn lấy hợp đồng theo ID: {err}")
        return None, f"Lỗi truy vấn database: {err}"
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

def create_contract_service(data):
    """Tạo một hợp đồng mới."""
    conn = get_db_connection()
    if not conn:
        return None, "Không thể kết nối đến database"

    required_fields = ['id_can_ho', 'id_cu_dan', 'ngay_bat_dau']
    if not all(field in data and data[field] for field in required_fields):
        return None, "Thiếu thông tin bắt buộc (căn hộ, cư dân, ngày bắt đầu)."

    try:
        cursor = conn.cursor()
        query = """
            INSERT INTO hop_dong
            (id_can_ho, id_cu_dan, ngay_bat_dau, ngay_ket_thuc, tien_dat_coc, loai_hop_dong, trang_thai, ghi_chu)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            data.get('id_can_ho'),
            data.get('id_cu_dan'),
            data.get('ngay_bat_dau'),
            data.get('ngay_ket_thuc') or None,
            data.get('tien_dat_coc') or None,
            data.get('loai_hop_dong') or None,
            data.get('trang_thai', 'Hiệu_lực'), # Mặc định là Hiệu lực
            data.get('ghi_chu') or None
        )
        cursor.execute(query, values)
        conn.commit()
        new_contract_id = cursor.lastrowid
        return {"id_hop_dong": new_contract_id}, None
    except mysql.connector.Error as err:
        conn.rollback()
        print(f"Lỗi tạo hợp đồng: {err}")
        if err.errno == 1452: # Foreign key constraint fails
             return None, "ID Căn hộ hoặc ID Cư dân không tồn tại."
        return None, f"Lỗi database khi tạo hợp đồng: {err}"
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

def update_contract_service(contract_id, data):
    """Cập nhật thông tin một hợp đồng."""
    conn = get_db_connection()
    if not conn:
        return None, "Không thể kết nối đến database"

    required_fields = ['id_can_ho', 'id_cu_dan', 'ngay_bat_dau', 'trang_thai']
    if not all(field in data and data[field] for field in required_fields):
        return None, "Thiếu thông tin bắt buộc (căn hộ, cư dân, ngày bắt đầu, trạng thái)."

    try:
        cursor = conn.cursor()
        query = """
            UPDATE hop_dong SET
            id_can_ho = %s,
            id_cu_dan = %s,
            ngay_bat_dau = %s,
            ngay_ket_thuc = %s,
            tien_dat_coc = %s,
            loai_hop_dong = %s,
            trang_thai = %s,
            ghi_chu = %s
            WHERE id_hop_dong = %s
        """
        values = (
            data.get('id_can_ho'),
            data.get('id_cu_dan'),
            data.get('ngay_bat_dau'),
            data.get('ngay_ket_thuc') or None,
            data.get('tien_dat_coc') or None,
            data.get('loai_hop_dong') or None,
            data.get('trang_thai'),
            data.get('ghi_chu') or None,
            contract_id
        )
        cursor.execute(query, values)
        affected_rows = cursor.rowcount
        conn.commit()

        if affected_rows == 0:
            return None, "Không tìm thấy hợp đồng để cập nhật hoặc không có thay đổi."

        return {"affected_rows": affected_rows}, None
    except mysql.connector.Error as err:
        conn.rollback()
        print(f"Lỗi cập nhật hợp đồng: {err}")
        if err.errno == 1452: # Foreign key constraint fails
             return None, "ID Căn hộ hoặc ID Cư dân không tồn tại."
        return None, f"Lỗi database khi cập nhật hợp đồng: {err}"
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

def delete_contract_service(contract_id):
    """Xóa một hợp đồng."""
    conn = get_db_connection()
    if not conn:
        return None, "Không thể kết nối đến database"
    try:
        cursor = conn.cursor()
        query = "DELETE FROM hop_dong WHERE id_hop_dong = %s"
        cursor.execute(query, (contract_id,))
        affected_rows = cursor.rowcount
        conn.commit()

        if affected_rows == 0:
            return None, "Không tìm thấy hợp đồng để xóa."

        return {"affected_rows": affected_rows}, None
    except mysql.connector.Error as err:
        conn.rollback()
        print(f"Lỗi xóa hợp đồng: {err}")
        if err.errno == 1451: # Foreign key constraint fails (bảng khác tham chiếu đến)
            return None, "Không thể xóa hợp đồng vì có dữ liệu liên quan."
        return None, f"Lỗi database khi xóa hợp đồng: {err}"
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()