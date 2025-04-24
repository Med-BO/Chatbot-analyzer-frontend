from flask import Blueprint, request, jsonify
from app.config.config_manager import ConfigManager

admin_bp = Blueprint('admin', __name__)
config_manager = ConfigManager()

# Questions routes
@admin_bp.route('/api/admin/questions', methods=['GET'])
def get_all_questions():
    """Get all questions"""
    return jsonify({"questions": config_manager.get_questions()})

@admin_bp.route('/api/admin/questions', methods=['POST'])
def add_question():
    """Add a new question"""
    data = request.json
    if not data or 'question' not in data:
        return jsonify({"error": "Question is required"}), 400
    
    if config_manager.add_question(data['question']):
        return jsonify({"message": "Question added successfully"}), 201
    return jsonify({"error": "Question already exists"}), 409

@admin_bp.route('/api/admin/questions/<old_question>', methods=['PUT'])
def update_question(old_question):
    """Update an existing question"""
    data = request.json
    if not data or 'new_question' not in data:
        return jsonify({"error": "New question is required"}), 400
    
    if config_manager.update_question(old_question, data['new_question']):
        return jsonify({"message": "Question updated successfully"})
    return jsonify({"error": "Question not found"}), 404

@admin_bp.route('/api/admin/questions/<question>', methods=['DELETE'])
def delete_question(question):
    """Delete a question"""
    if config_manager.delete_question(question):
        return jsonify({"message": "Question deleted successfully"})
    return jsonify({"error": "Question not found"}), 404

# Hotels routes
@admin_bp.route('/api/admin/hotels', methods=['GET'])
def get_all_hotels():
    """Get all hotels"""
    return jsonify({"hotels": config_manager.get_hotels()})

@admin_bp.route('/api/admin/hotels', methods=['POST'])
def add_hotel():
    """Add a new hotel"""
    data = request.json
    required_fields = ['name', 'company_id', 'payload']
    
    if not data or not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400
    
    if config_manager.add_hotel(data):
        return jsonify({"message": "Hotel added successfully"}), 201
    return jsonify({"error": "Hotel already exists"}), 409

@admin_bp.route('/api/admin/hotels/<hotel_name>', methods=['PUT'])
def update_hotel(hotel_name):
    """Update an existing hotel"""
    data = request.json
    required_fields = ['name', 'company_id', 'payload']
    
    if not data or not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400
    
    if config_manager.update_hotel(hotel_name, data):
        return jsonify({"message": "Hotel updated successfully"})
    return jsonify({"error": "Hotel not found"}), 404

@admin_bp.route('/api/admin/hotels/<hotel_name>', methods=['DELETE'])
def delete_hotel(hotel_name):
    """Delete a hotel"""
    if config_manager.delete_hotel(hotel_name):
        return jsonify({"message": "Hotel deleted successfully"})
    return jsonify({"error": "Hotel not found"}), 404 