# filepath: d:\course\PTTKHTTT\PTTK\be\routes\apartment_routes.py
from flask import Blueprint
from controllers import apartment_controller

apartment_bp = Blueprint('apartment_bp', __name__, url_prefix='/api/can-ho')

@apartment_bp.route('', methods=['GET'])
def get_apartments_route():
    return apartment_controller.get_apartments_controller()

@apartment_bp.route('', methods=['POST'])
def create_apartment_route():
    return apartment_controller.create_apartment_controller()

@apartment_bp.route('/<int:apartment_id>', methods=['PUT'])
def update_apartment_route(apartment_id):
    return apartment_controller.update_apartment_controller(apartment_id)

@apartment_bp.route('/<int:apartment_id>', methods=['DELETE'])
def delete_apartment_route(apartment_id):
    return apartment_controller.delete_apartment_controller(apartment_id)