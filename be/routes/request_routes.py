# filepath: d:\course\PTTKHTTT\PTTK\be\routes\request_routes.py
from flask import Blueprint
from controllers import request_controller

request_bp = Blueprint('request_bp', __name__, url_prefix='/api/yeu-cau-dich-vu')

@request_bp.route('', methods=['POST'])
def create_request_route():
    """ Route để tạo yêu cầu mới (cho cư dân). """
    return request_controller.create_request()

# Route mới cho quản lý tạo yêu cầu nội bộ
@request_bp.route('/manager', methods=['POST'])
def create_manager_request_route():
    """ Route để tạo yêu cầu nội bộ (cho quản lý). """
    return request_controller.create_manager_request_controller()

@request_bp.route('', methods=['GET'])
def get_requests_route():
    """ Route để lấy danh sách yêu cầu dịch vụ (theo role và filter). """
    return request_controller.get_requests()

@request_bp.route('/<int:request_id>', methods=['PUT'])
def update_request_route(request_id):
    """ Route để cập nhật thông tin yêu cầu (trạng thái, gán nhân viên, etc.). """
    return request_controller.update_request_details(request_id)

@request_bp.route('/<int:request_id>/report', methods=['POST'])
def add_report_route(request_id):
    """ Route để nhân viên/quản lý thêm báo cáo/phản hồi vào yêu cầu. """
    return request_controller.add_report(request_id)

# Xóa các blueprint/route của internal_request nếu đã tạo trước đó
# (Không cần làm gì ở đây nếu chưa đăng ký trong app.py)