# filepath: d:\course\PTTKHTTT\PTTK\be\routes\bill_routes.py
from flask import Blueprint
from controllers import bill_controller

bill_bp = Blueprint('bill_bp', __name__, url_prefix='/api/hoa-don')

@bill_bp.route('', methods=['GET'])
def get_bills_route():
    # Hiện tại chỉ hỗ trợ lấy theo cư dân
    return bill_controller.get_resident_bills()

@bill_bp.route('/dich-vu', methods=['POST']) # Route mới cho tạo HĐ Dịch vụ
def create_service_bill_route():
    return bill_controller.create_service_bill_controller()

@bill_bp.route('/bao-tri', methods=['POST']) # Route mới cho tạo HĐ Bảo trì
def create_maintenance_bill_route():
    return bill_controller.create_maintenance_bill_controller()