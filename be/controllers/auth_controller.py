from flask import request, jsonify
from services import auth_service
# Không cần import gì thêm

def login():
    """Xử lý yêu cầu đăng nhập (So sánh mật khẩu trực tiếp)."""
    data = request.get_json()
    # Yêu cầu cả email và password
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Thiếu email hoặc mật khẩu"}), 400

    email = data['email']
    password = data['password'] # Lấy lại password từ request

    # Tìm user trong DB (bao gồm cả mật khẩu)
    user = auth_service.find_user_by_email(email)

    if not user:
        return jsonify({"error": "Email không tồn tại hoặc tài khoản bị khóa"}), 401

    # --- KIỂM TRA MẬT KHẨU TRỰC TIẾP ---
    # So sánh mật khẩu từ request với mật khẩu trong DB
    if user['mat_khau'] != password:
         return jsonify({"error": "Mật khẩu không đúng"}), 401
    # ------------------------------------

    # Trả về thông tin user (loại bỏ mật khẩu)
    user_info = {
        'id_nguoi_dung': user['id_nguoi_dung'],
        'ho_ten': user['ho_ten'],
        'email': user['email'],
        'vai_tro': user['vai_tro']
    }
    return jsonify({"message": "Đăng nhập thành công", "user": user_info})