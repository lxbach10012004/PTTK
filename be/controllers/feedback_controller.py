# filepath: d:\course\PTTKHTTT\PTTK\be\controllers\feedback_controller.py
from flask import request, jsonify
from services import feedback_service

def create_feedback():
    """Xử lý tạo phản hồi mới từ cư dân."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Không có dữ liệu được gửi"}), 400

    # TODO: Lấy id_cu_dan từ user đang đăng nhập thay vì tin tưởng client
    if 'id_cu_dan' not in data:
         return jsonify({"error": "Thiếu id_cu_dan"}), 400
    if 'tieu_de' not in data or not data['tieu_de'].strip():
         return jsonify({"error": "Thiếu tiêu đề"}), 400
    if 'noi_dung' not in data or not data['noi_dung'].strip():
         return jsonify({"error": "Thiếu nội dung"}), 400

    created_feedback, error = feedback_service.create_resident_feedback(data)
    if error:
        return jsonify({"error": error}), 500
    return jsonify({"message": "Gửi phản hồi thành công", "feedback": created_feedback}), 201

def get_all_feedback_controller():
    """Controller lấy danh sách tất cả phản hồi."""
    feedback, error = feedback_service.get_all_feedback()
    if error: return jsonify({"error": error}), 500
    return jsonify(feedback)