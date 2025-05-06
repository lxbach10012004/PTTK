# filepath: d:\course\PTTKHTTT\PTTK\be\controllers\request_controller.py
from flask import request, jsonify
from services import request_service
import datetime

# Giả sử có cách lấy thông tin user đã login (ví dụ từ token, session...)
# Tạm thời hardcode để demo
def get_current_user_info():
    # Đây là phần cần thay thế bằng logic xác thực thực tế
    # return {'role': 'resident', 'id': 3} # Ví dụ cư dân
    # return {'role': 'staff', 'id': 2}   # Ví dụ nhân viên
     return {'role': 'manager', 'id': 1} # Ví dụ quản lý
    # return {'role': 'anonymous'}

def create_request():
    """Tạo yêu cầu mới (cho cư dân)."""
    # Nên kiểm tra role ở đây, chỉ cho phép resident
    # user_info = get_current_user_info()
    # if user_info['role'] != 'resident':
    #      return jsonify({"error": "Chỉ cư dân mới được tạo yêu cầu này."}), 403

    data = request.get_json()
    if not data: return jsonify({"error": "Không có dữ liệu"}), 400
    required = ['id_dich_vu', 'ngay_hen', 'tieu_de']
    if any(f not in data or not data[f] for f in required):
         return jsonify({"error": f"Thiếu trường: {', '.join(f for f in required if f not in data or not data[f])}"}), 400

    # Gán id_cu_dan từ user đang login
    data['id_cu_dan'] = 3

    created, error = request_service.create_service_request(data)
    if error: return jsonify({"error": error}), 500 if "Lỗi DB" in error or "Lỗi hệ thống" in error else 400
    return jsonify({"message": "Tạo yêu cầu thành công", "request": created}), 201

def create_manager_request_controller():
    """Tạo yêu cầu nội bộ (cho quản lý)."""
    user_info = get_current_user_info()
    if user_info['role'] != 'manager':
         return jsonify({"error": "Chỉ quản lý mới được tạo yêu cầu này."}), 403

    data = request.get_json()
    if not data: return jsonify({"error": "Không có dữ liệu"}), 400
    required = ['id_dich_vu', 'tieu_de'] # id_nhan_vien có thể optional
    if any(f not in data or not data[f] for f in required):
         return jsonify({"error": f"Thiếu trường: {', '.join(f for f in required if f not in data or not data[f])}"}), 400

    created, error = request_service.create_manager_request(data)
    if error: return jsonify({"error": error}), 500 if "Lỗi DB" in error or "Lỗi hệ thống" in error else 400
    return jsonify({"message": "Tạo yêu cầu nội bộ thành công", "request": created}), 201

def get_requests():
    """Lấy danh sách yêu cầu dựa trên vai trò và filter."""
    user_info = get_current_user_info()
    user_role = user_info.get('role', 'anonymous')
    user_id = user_info.get('id')

    if user_role == 'anonymous':
        return jsonify({"error": "Yêu cầu xác thực"}), 401

    # Lấy các tham số filter từ query string
    filters = {}
    status_param = request.args.get('status')
    resident_id_str = request.args.get('resident_id') # Filter theo cư dân (cho manager/staff)
    service_type_param = request.args.get('service_type') # Filter theo loại dv (resident/internal)

    if status_param: filters['status'] = status_param
    if service_type_param in ['resident', 'internal']: filters['service_type'] = service_type_param

    # Nếu là manager/staff xem yêu cầu của 1 cư dân cụ thể
    if user_role in ['manager', 'staff'] and resident_id_str:
        try: filters['resident_id'] = int(resident_id_str)
        except ValueError: return jsonify({"error": "'resident_id' phải là số nguyên"}), 400
    # Nếu là cư dân, chỉ lấy yêu cầu của chính họ (user_id từ login)
    elif user_role == 'resident':
         user_id_from_param = request.args.get('id_cu_dan')
         # Cư dân chỉ được xem của mình, bỏ qua param nếu có
         if user_id_from_param and int(user_id_from_param) != user_id:
              print(f"Cảnh báo: Cư dân {user_id} cố gắng xem yêu cầu của {user_id_from_param}")
              # Không trả lỗi, chỉ lấy của user_id đang login
         pass # Service layer sẽ tự lọc theo user_id và role resident

    requests_list, error = request_service.get_requests(filters, user_role=user_role, user_id=user_id)
    if error: return jsonify({"error": error}), 500
    return jsonify(requests_list)

# ... (update_request_details, add_report giữ nguyên) ...
def update_request_details(request_id):
    """Cập nhật yêu cầu."""
    # Nên kiểm tra role ở đây (staff/manager)
    user_info = get_current_user_info()
    if user_info['role'] not in ['staff', 'manager']:
         return jsonify({"error": "Không có quyền cập nhật yêu cầu."}), 403

    data = request.get_json()
    if not data: return jsonify({"error": "Thiếu dữ liệu cập nhật"}), 400
    success, message = request_service.update_request(request_id, data)
    if success: return jsonify({"message": message}), 200
    else: return jsonify({"error": message}), 404 if "Không tìm thấy" in message else (400 if "không hợp lệ" in message else 500)

def add_report(request_id):
    """Thêm báo cáo vào yêu cầu."""
    # Nên kiểm tra role (staff/manager)
    user_info = get_current_user_info()
    if user_info['role'] not in ['staff', 'manager']:
         return jsonify({"error": "Không có quyền thêm báo cáo."}), 403

    data = request.get_json()
    if not data or 'noi_dung' not in data or not data['noi_dung'].strip():
        return jsonify({"error": "Thiếu 'noi_dung'"}), 400
    noi_dung = data['noi_dung'].strip()
    file_dinh_kem = data.get('file_dinh_kem')
    # Sử dụng STAFF_ID cứng hoặc ID của user đang login nếu là staff/manager
    # current_staff_id = user_info['id'] if user_info['role'] in ['staff', 'manager'] else STAFF_ID
    # Hiện tại service đang dùng STAFF_ID cứng
    created, error = request_service.create_request_report(request_id, noi_dung, file_dinh_kem)
    if error: return jsonify({"error": error}), 404 if "không hợp lệ" in error else 500
    return jsonify({"message": "Thêm báo cáo thành công", "report": created}), 201