# filepath: d:\course\PTTKHTTT\PTTK\be\controllers\apartment_controller.py
from flask import request, jsonify
from services import apartment_service

REQUIRED_FIELDS = ['ma_can', 'toa_nha', 'tang', 'dien_tich', 'so_phong_ngu', 'so_phong_tam', 'trang_thai']

def get_apartments_controller():
    apts, error = apartment_service.get_apartments()
    if error:
        return jsonify({"error": error}), 500
    return jsonify(apts)

def create_apartment_controller():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Thiếu dữ liệu"}), 400

    missing_fields = [field for field in REQUIRED_FIELDS if field not in data]
    if missing_fields:
        return jsonify({"error": f"Thiếu các trường: {', '.join(missing_fields)}"}), 400

    created, error = apartment_service.create_apartment(data)
    if error:
        status = 400 if any(keyword in error for keyword in ["đã tồn tại", "không hợp lệ", "Thiếu trường"]) else 500
        return jsonify({"error": error}), status

    return jsonify({"message": "Tạo căn hộ thành công", "apartment": created}), 201

def update_apartment_controller(apartment_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Thiếu dữ liệu cập nhật"}), 400

    success, message = apartment_service.update_apartment(apartment_id, data)
    if success:
        return jsonify({"message": message}), 200
    else:
        if "Không tìm thấy" in message:
            return jsonify({"error": message}), 404
        elif any(keyword in message for keyword in ["đã tồn tại", "không hợp lệ", "Không có trường"]):
            return jsonify({"error": message}), 400
        else:
            return jsonify({"error": message}), 500

def delete_apartment_controller(apartment_id):
    success, message = apartment_service.delete_apartment(apartment_id)
    if success:
        return jsonify({"message": message}), 200
    else:
        return jsonify({"error": message}), 404 if "Không tìm thấy" in message else 500
