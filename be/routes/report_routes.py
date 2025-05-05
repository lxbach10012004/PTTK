# filepath: d:\course\PTTKHTTT\PTTK\be\routes\report_routes.py
from flask import Blueprint
from controllers import report_controller

report_bp = Blueprint('report_bp', __name__, url_prefix='/api/bao-cao')

@report_bp.route('/thu-chi', methods=['POST'])
def create_financial_report_route():
    return report_controller.create_financial_report_controller()

@report_bp.route('/thu-chi', methods=['GET'])
def get_financial_reports_route():
    return report_controller.get_financial_reports_controller()