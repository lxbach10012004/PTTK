# filepath: d:\course\PTTKHTTT\PTTK\be\controllers\service_controller.py
from flask import request, jsonify
from services import service_service, auth_service # Import thêm auth_service nếu cần check role

def get_services():
    """Controller lấy danh sách dịch vụ khả dụng cho cư dân."""
    services, error = service_service.get_available_services() # Gọi hàm mới
    if error:
        return jsonify({"error": error}), 500
    return jsonify(services)

def get_internal_services_controller():
    """Controller lấy danh sách dịch vụ nội bộ (cho quản lý/nhân viên)."""
    # TODO: Có thể thêm kiểm tra role ở đây nếu cần
    services, error = service_service.get_internal_services()
    if error: return jsonify({"error": error}), 500
    return jsonify(services)

# ... (get_all_services_controller, create, update, delete giữ nguyên hoặc cập nhật để xử lý hien_thi_cho_cu_dan từ JSON) ...
def get_all_services_controller():
    """Controller lấy tất cả dịch vụ (cho quản lý)."""
    services, error = service_service.get_all_services()
    if error: return jsonify({"error": error}), 500
    return jsonify(services)

def create_service_controller():
    """Controller tạo dịch vụ mới."""
    data = request.get_json()
    if not data or 'ten_dich_vu' not in data or 'don_gia' not in data or 'don_vi_tinh' not in data:
        return jsonify({"error": "Thiếu ten_dich_vu, don_gia, hoặc don_vi_tinh"}), 400
    try:
        float(data['don_gia'])
        # Lấy giá trị hien_thi_cho_cu_dan từ request, mặc định là 0 (nội bộ) nếu không có
        data['hien_thi_cho_cu_dan'] = int(data.get('hien_thi_cho_cu_dan', 0))
    except (ValueError, TypeError):
        return jsonify({"error": "don_gia phải là số, hien_thi_cho_cu_dan phải là 0 hoặc 1"}), 400

    created, error = service_service.create_service(data)
    if error: return jsonify({"error": error}), 400 if "Thiếu trường" in error else 500
    return jsonify({"message": "Tạo dịch vụ thành công", "service": created}), 201

def update_service_controller(service_id):
    """Controller cập nhật dịch vụ."""
    data = request.get_json()
    if not data: return jsonify({"error": "Thiếu dữ liệu cập nhật"}), 400
    try:
        if 'don_gia' in data: float(data['don_gia'])
        if 'hien_thi_cho_cu_dan' in data: data['hien_thi_cho_cu_dan'] = int(data['hien_thi_cho_cu_dan'])
    except (ValueError, TypeError):
         return jsonify({"error": "don_gia phải là số, hien_thi_cho_cu_dan phải là 0 hoặc 1"}), 400

    success, message = service_service.update_service(service_id, data)
    if success: return jsonify({"message": message}), 200
    else: return jsonify({"error": message}), 404 if "Không tìm thấy" in message else (400 if "Không có trường" in message else 500)

def delete_service_controller(service_id):
    """Controller xóa (ẩn) dịch vụ."""
    success, message = service_service.delete_service(service_id)
    if success: return jsonify({"message": message}), 200
    else: return jsonify({"error": message}), 404 if "Không tìm thấy" in message else 500