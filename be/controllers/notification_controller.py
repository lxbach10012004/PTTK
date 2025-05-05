# filepath: d:\course\PTTKHTTT\PTTK\be\controllers\notification_controller.py
from flask import request, jsonify
from services import notification_service

def get_notifications():
    """Lấy danh sách thông báo."""
    # TODO: Có thể thêm phân trang hoặc lọc theo người nhận sau
    notifications_list, error = notification_service.get_all_notifications()
    if error:
        return jsonify({"error": error}), 500
    return jsonify(notifications_list)

def create_notification_controller():
    """Controller tạo thông báo."""
    data = request.get_json()
    if not data or 'tieu_de' not in data or 'noi_dung' not in data:
        return jsonify({"error": "Thiếu 'tieu_de' hoặc 'noi_dung'"}), 400
    tieu_de = data['tieu_de'].strip()
    noi_dung = data['noi_dung'].strip()
    if not tieu_de or not noi_dung:
        return jsonify({"error": "Tiêu đề và nội dung không được trống"}), 400

    created_noti, error = notification_service.create_notification(tieu_de, noi_dung)
    if error: return jsonify({"error": error}), 500
    return jsonify({"message": "Gửi thông báo thành công", "notification": created_noti}), 201