# filepath: d:\course\PTTKHTTT\PTTK\be\routes\user_routes.py
from flask import Blueprint
from controllers import user_controller

user_bp = Blueprint('user_bp', __name__, url_prefix='/api/users')

# --- Staff Routes ---
@user_bp.route('/staff', methods=['GET'])
def get_staff_route():
    return user_controller.get_users_by_role_controller('staff')

@user_bp.route('/staff', methods=['POST'])
def create_staff_route():
    return user_controller.create_user_controller('staff')

@user_bp.route('/staff/<int:user_id>', methods=['PUT'])
def update_staff_route(user_id):
    return user_controller.update_user_controller(user_id)

@user_bp.route('/staff/<int:user_id>', methods=['DELETE'])
def delete_staff_route(user_id):
    return user_controller.delete_user_controller(user_id)

# --- Resident Routes ---
@user_bp.route('/residents', methods=['GET'])
def get_residents_route():
    return user_controller.get_users_by_role_controller('resident')

@user_bp.route('/residents', methods=['POST'])
def create_resident_route():
    # Lưu ý: Việc tạo resident có thể phức tạp hơn (cần thông tin căn hộ...)
    return user_controller.create_user_controller('resident')

@user_bp.route('/residents/<int:user_id>', methods=['PUT'])
def update_resident_route(user_id):
    return user_controller.update_user_controller(user_id)

@user_bp.route('/residents/<int:user_id>', methods=['DELETE'])
def delete_resident_route(user_id):
    return user_controller.delete_user_controller(user_id)