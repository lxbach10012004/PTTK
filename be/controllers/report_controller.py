# filepath: d:\course\PTTKHTTT\PTTK\be\controllers\report_controller.py
from flask import request, jsonify
from services import report_service

def create_financial_report_controller():
    """Controller tạo báo cáo thu chi."""
    data = request.get_json()
    if not data or 'tieu_de' not in data or 'tong_thu' not in data or 'tong_chi' not in data:
        return jsonify({"error": "Thiếu 'tieu_de', 'tong_thu', hoặc 'tong_chi'"}), 400
    try:
        tieu_de = data['tieu_de'].strip()
        mo_ta = data.get('mo_ta', '').strip()
        tong_thu = float(data['tong_thu'])
        tong_chi = float(data['tong_chi'])
        if not tieu_de: raise ValueError("Tiêu đề không được trống")
        if tong_thu < 0 or tong_chi < 0: raise ValueError("Tổng thu và tổng chi không được âm")
    except (ValueError, TypeError) as e:
        return jsonify({"error": f"Dữ liệu không hợp lệ: {e}"}), 400

    created_report, error = report_service.create_financial_report(tieu_de, mo_ta, tong_thu, tong_chi)
    if error: return jsonify({"error": error}), 500
    return jsonify({"message": "Tạo báo cáo thu chi thành công", "report": created_report}), 201

def get_financial_reports_controller():
    """Controller lấy danh sách báo cáo thu chi."""
    reports, error = report_service.get_financial_reports()
    if error: return jsonify({"error": error}), 500
    return jsonify(reports)