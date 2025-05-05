# filepath: d:\course\PTTKHTTT\PTTK\be\controllers\resident_controller.py
from flask import jsonify
from services import resident_service

def get_details(resident_id):
    """Lấy thông tin chi tiết của cư dân."""
    # TODO: Kiểm tra quyền truy cập (người dùng hiện tại có phải là resident_id này không)
    try:
        res_id = int(resident_id)
    except ValueError:
        return jsonify({"error": "ID cư dân phải là số nguyên"}), 400

    details, error = resident_service.get_resident_details(res_id)
    if error:
        # Phân biệt lỗi không tìm thấy và lỗi server
        if "Không tìm thấy" in error:
            return jsonify({"error": error}), 404
        else:
            return jsonify({"error": error}), 500
    return jsonify(details)