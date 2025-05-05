# filepath: d:\course\PTTKHTTT\PTTK\be\controllers\user_controller.py
from flask import request, jsonify
from services import user_service

def get_users_by_role_controller(role):
    """Controller lấy danh sách user theo vai trò."""
    users, error = user_service.get_users_by_role(role)
    if error: return jsonify({"error": error}), 400 if "không hợp lệ" in error else 500
    return jsonify(users)

def create_user_controller(role):
    """Controller tạo user mới."""
    data = request.get_json()
    if not data or 'ho_ten' not in data or 'email' not in data or 'mat_khau' not in data:
        return jsonify({"error": "Thiếu ho_ten, email, hoặc mat_khau"}), 400
    # Thêm validation khác nếu cần (độ dài mk, định dạng email...)

    created_user, error = user_service.create_user(data, role)
    if error: return jsonify({"error": error}), 400 if "Email đã tồn tại" in error or "không hợp lệ" in error or "Thiếu trường" in error else 500
    return jsonify({"message": f"Tạo {role} thành công", "user": created_user}), 201

def update_user_controller(user_id):
    """Controller cập nhật user."""
    data = request.get_json()
    if not data: return jsonify({"error": "Thiếu dữ liệu cập nhật"}), 400

    success, message = user_service.update_user(user_id, data)
    if success: return jsonify({"message": message}), 200
    else: return jsonify({"error": message}), 404 if "Không tìm thấy" in message else (400 if "Email đã tồn tại" in message or "Không có trường" in message else 500)

def delete_user_controller(user_id):
    """Controller xóa user."""
    success, message = user_service.delete_user(user_id)
    if success: return jsonify({"message": message}), 200 # Hoặc 204 No Content
    else: return jsonify({"error": message}), 404 if "Không tìm thấy" in message else (400 if "Không thể xóa" in message else 500)