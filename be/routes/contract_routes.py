from flask import Blueprint
from controllers import contract_controller
# Thêm middleware xác thực nếu cần
# from middleware.auth import token_required, role_required

contract_bp = Blueprint('contract_bp', __name__, url_prefix='/api/hop-dong')

# Áp dụng middleware nếu cần
# contract_bp.before_request(token_required)
# contract_bp.before_request(role_required(['QuanLyToaNha'])) # Ví dụ: Chỉ Manager

contract_bp.route('/', methods=['GET'])(contract_controller.get_all_contracts)
contract_bp.route('/', methods=['POST'])(contract_controller.create_contract)
contract_bp.route('/<int:contract_id>', methods=['GET'])(contract_controller.get_contract_by_id)
contract_bp.route('/<int:contract_id>', methods=['PUT'])(contract_controller.update_contract)
contract_bp.route('/<int:contract_id>', methods=['DELETE'])(contract_controller.delete_contract)