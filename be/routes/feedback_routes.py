# filepath: d:\course\PTTKHTTT\PTTK\be\routes\feedback_routes.py
from flask import Blueprint
from controllers import feedback_controller

feedback_bp = Blueprint('feedback_bp', __name__, url_prefix='/api/phan-hoi-cu-dan')

@feedback_bp.route('', methods=['POST'])
def create_feedback_route():
    return feedback_controller.create_feedback()

# API xem phản hồi (cho manager/staff) sẽ thêm sau
@feedback_bp.route('', methods=['GET']) # Route GET để lấy danh sách
def get_feedback_route():
    # TODO: Phân biệt giữa lấy của cư dân và lấy tất cả của quản lý (có thể dùng query param?)
    # Hiện tại, mặc định lấy tất cả cho quản lý
    return feedback_controller.get_all_feedback_controller()