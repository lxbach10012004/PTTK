# filepath: d:\course\PTTKHTTT\PTTK\be\controllers\bill_controller.py
from flask import request, jsonify
from services import bill_service

def get_resident_bills():
    """Lấy danh sách hóa đơn của cư dân."""
    resident_id = request.args.get('id_cu_dan')
    if not resident_id:
        return jsonify({"error": "Thiếu query parameter 'id_cu_dan'"}), 400

    try:
        resident_id = int(resident_id)
    except ValueError:
        return jsonify({"error": "'id_cu_dan' phải là số nguyên"}), 400

    # TODO: Kiểm tra quyền truy cập (người dùng hiện tại có phải là resident_id này không)

    bills_list, error = bill_service.get_bills_by_resident(resident_id)
    if error:
        return jsonify({"error": error}), 500
    return jsonify(bills_list)

def create_service_bill_controller():
    """Controller tạo hóa đơn dịch vụ."""
    data = request.get_json()
    if not data or 'id_yeu_cau' not in data:
        return jsonify({"error": "Thiếu 'id_yeu_cau'"}), 400
    try:
        request_id = int(data['id_yeu_cau'])
    except ValueError:
        return jsonify({"error": "'id_yeu_cau' phải là số nguyên"}), 400

    created_bill, error = bill_service.create_service_bill(request_id)
    if error:
        # Phân biệt lỗi do logic (ví dụ: yêu cầu chưa hoàn thành) và lỗi hệ thống
        if "chưa hoàn thành" in error or "đã tồn tại" in error or "Không tìm thấy" in error:
             return jsonify({"error": error}), 400 # Bad Request hoặc Conflict (409) tùy trường hợp
        else:
             return jsonify({"error": error}), 500 # Internal Server Error
    return jsonify({"message": "Tạo hóa đơn dịch vụ thành công", "bill": created_bill}), 201

def create_maintenance_bill_controller():
    """Controller tạo hóa đơn bảo trì."""
    data = request.get_json()
    if not data or 'id_cu_dan' not in data or 'tong_tien' not in data:
        return jsonify({"error": "Thiếu 'id_cu_dan' hoặc 'tong_tien'"}), 400
    try:
        resident_id = int(data['id_cu_dan'])
        amount = float(data['tong_tien'])
        if amount <= 0: raise ValueError("Tổng tiền phải lớn hơn 0")
    except ValueError as e:
        return jsonify({"error": f"Dữ liệu không hợp lệ: {e}"}), 400

    description = data.get('mo_ta', "Phí quản lý/bảo trì") # Optional description

    created_bill, error = bill_service.create_maintenance_bill(resident_id, amount, description)
    if error:
        if "Không tìm thấy cư dân" in error:
             return jsonify({"error": error}), 404
        else:
             return jsonify({"error": error}), 500
    return jsonify({"message": "Tạo hóa đơn bảo trì thành công", "bill": created_bill}), 201