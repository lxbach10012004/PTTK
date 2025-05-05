from flask import jsonify, request
from services import contract_service

def get_all_contracts():
    """Controller lấy danh sách tất cả hợp đồng."""
    contracts, error = contract_service.get_all_contracts_service()
    if error:
        return jsonify({"error": error}), 500
    return jsonify(contracts), 200

def get_contract_by_id(contract_id):
    """Controller lấy chi tiết một hợp đồng."""
    contract, error = contract_service.get_contract_by_id_service(contract_id)
    if error:
        return jsonify({"error": error}), 500
    if not contract:
        return jsonify({"error": "Không tìm thấy hợp đồng."}), 404
    return jsonify(contract), 200

def create_contract():
    """Controller tạo hợp đồng mới."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Dữ liệu không hợp lệ."}), 400

    result, error = contract_service.create_contract_service(data)
    if error:
        # Phân biệt lỗi do client hay server
        status_code = 400 if "Thiếu thông tin" in error or "không tồn tại" in error else 500
        return jsonify({"error": error}), status_code
    return jsonify({"message": "Tạo hợp đồng thành công.", "contract": result}), 201

def update_contract(contract_id):
    """Controller cập nhật hợp đồng."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Dữ liệu không hợp lệ."}), 400

    result, error = contract_service.update_contract_service(contract_id, data)
    if error:
        status_code = 404 if "Không tìm thấy" in error else (400 if "không tồn tại" in error else 500)
        return jsonify({"error": error}), status_code
    return jsonify({"message": "Cập nhật hợp đồng thành công."}), 200

def delete_contract(contract_id):
    """Controller xóa hợp đồng."""
    result, error = contract_service.delete_contract_service(contract_id)
    if error:
        status_code = 404 if "Không tìm thấy" in error else (400 if "dữ liệu liên quan" in error else 500)
        return jsonify({"error": error}), status_code
    return jsonify({"message": "Xóa hợp đồng thành công."}), 200