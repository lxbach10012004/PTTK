# filepath: d:\course\PTTKHTTT\PTTK\be\routes\resident_routes.py
from flask import Blueprint
from controllers import resident_controller

resident_bp = Blueprint('resident_bp', __name__, url_prefix='/api/cu-dan')

@resident_bp.route('/<int:resident_id>/thong-tin', methods=['GET'])
def get_resident_details_route(resident_id):
    return resident_controller.get_details(resident_id)

# Có thể thêm các route khác cho cư dân sau (ví dụ: cập nhật thông tin)