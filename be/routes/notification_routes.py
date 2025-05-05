# filepath: d:\course\PTTKHTTT\PTTK\be\routes\notification_routes.py
from flask import Blueprint
from controllers import notification_controller

notification_bp = Blueprint('notification_bp', __name__, url_prefix='/api/thong-bao')

@notification_bp.route('', methods=['GET'])
def get_notifications_route():
    return notification_controller.get_notifications()

@notification_bp.route('', methods=['POST']) # Route mới cho tạo thông báo
def create_notification_route():
    return notification_controller.create_notification_controller()