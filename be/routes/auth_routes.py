from flask import Blueprint
from controllers import auth_controller

# Tạo Blueprint cho auth
auth_bp = Blueprint('auth_bp', __name__, url_prefix='/api/auth')

# Định nghĩa route /login
@auth_bp.route('/login', methods=['POST'])
def login_route():
    return auth_controller.login()

# Có thể thêm các route khác như /register, /logout sau