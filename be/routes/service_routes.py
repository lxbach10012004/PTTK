# filepath: d:\course\PTTKHTTT\PTTK\be\routes\service_routes.py
from flask import Blueprint
from controllers import service_controller

service_bp = Blueprint('service_bp', __name__, url_prefix='/api/dich-vu')

# Route GET cho cư dân xem dịch vụ khả dụng
@service_bp.route('/available', methods=['GET'])
def get_available_services_route():
    """ Lấy danh sách dịch vụ đang hoạt động (cho cư dân). """
    return service_controller.get_services() # Gọi hàm controller cũ đã được sửa

# Route GET cho quản lý/nhân viên lấy dịch vụ nội bộ
@service_bp.route('/internal', methods=['GET'])
def get_internal_services_route():
    """ Lấy danh sách dịch vụ nội bộ đang hoạt động. """
    return service_controller.get_internal_services_controller()

# --- Routes cho Manager (CRUD) ---
@service_bp.route('', methods=['GET']) # Route GET gốc lấy tất cả
def get_all_services_route():
    """ Lấy tất cả dịch vụ (cho quản lý). """
    return service_controller.get_all_services_controller()

@service_bp.route('', methods=['POST'])
def create_service_route():
    """ Tạo dịch vụ mới (cho quản lý). """
    return service_controller.create_service_controller()

@service_bp.route('/<int:service_id>', methods=['PUT'])
def update_service_route(service_id):
    """ Cập nhật dịch vụ (cho quản lý). """
    return service_controller.update_service_controller(service_id)

@service_bp.route('/<int:service_id>', methods=['DELETE'])
def delete_service_route(service_id):
    """ Xóa (ẩn) dịch vụ (cho quản lý). """
    return service_controller.delete_service_controller(service_id)