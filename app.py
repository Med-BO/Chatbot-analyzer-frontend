from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import time
import json
from datetime import datetime
from app.routes.admin_routes import admin_bp
from app.config.config_manager import ConfigManager

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Register the admin blueprint
app.register_blueprint(admin_bp)

# Initialize config manager
config_manager = ConfigManager()

def log_message(message, decoration="-"):
    print(f"{decoration * 50}\n{message}\n{decoration * 50}")

def initialiser_conversation(company_id):
    log_message("Initialisation de la conversation", "=")
    
    base_url = "https://directline.asksuite.com/directline/conversations"
    params = {
        "isTest": "false",
        "companyId": company_id
    }
    
    print("🔄 Initialisation de la conversation...")
    response = requests.post(base_url, params=params)
    
    if response.status_code == 200:
        resp_body = response.json()
        conversation_id = resp_body.get("conversationId")
        if conversation_id:
            print(f"✅ Conversation initialisée avec succès (ID: {conversation_id})")
            return conversation_id
        else:
            print("❌ Impossible de récupérer l'ID de conversation")
            return None
    else:
        print(f"❌ Échec de l'initialisation (Statut : {response.status_code})")
        print(f"Réponse : {response.text}")
        return None

def interroger_chatbot(hotel, question_text):
    log_message(f"Interrogation du chatbot pour : {hotel['name']}", "=")
    
    # Initialiser la conversation
    conversation_id = initialiser_conversation(hotel['company_id'])
    if not conversation_id:
        return {
            "hotel": hotel['name'],
            "question": question_text,
            "response": "Échec de l'initialisation de la conversation",
            "status": "error"
        }
    
    # Construire l'URL avec le conversation_id
    url = f"https://directline.asksuite.com/directline/conversations/{conversation_id}/activities"
    
    headers = {"Content-Type": "application/json"}
    payload = hotel['payload'].copy()
    payload["text"] = question_text
    
    print(f"\n➡️ Envoi du message : \"{question_text}\" à {hotel['name']}...\n")
    response = requests.post(url, json=payload, headers=headers)
    
    if response.status_code != 200:
        return {
            "hotel": hotel['name'],
            "question": question_text,
            "response": f"Échec de l'envoi du message (Statut : {response.status_code})",
            "status": "error"
        }
    
    print("⏳ En attente de la réponse du chatbot...\n")
    time.sleep(5)
    
    print("📨 Récupération de la réponse du chatbot...\n")
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        resp_body = response.json()
        
        if "activities" in resp_body and resp_body["activities"]:
            print(f"#### activies {resp_body['activities']}")
            dernier_message = resp_body["activities"][-1].get("text", "Aucun texte disponible")
            chatbot_reply = ""
            for message in resp_body["activities"][1:]:
                message_text = message.get("text", None)
                if message_text:
                    chatbot_reply = f"{chatbot_reply}\n{message_text}"
            
            if dernier_message == question_text:
                return {
                    "hotel": hotel['name'],
                    "question": question_text,
                    "response": "Aucune réponse reçue du chatbot",
                    "status": "no_response"
                }
            else:
                return {
                    "hotel": hotel['name'],
                    "question": question_text,
                    "response": chatbot_reply,
                    "status": "success"
                }
        else:
            return {
                "hotel": hotel['name'],
                "question": question_text,
                "response": "Aucune activité trouvée dans la réponse",
                "status": "error"
            }
    else:
        return {
            "hotel": hotel['name'],
            "question": question_text,
            "response": f"Échec de la récupération de la réponse (Statut : {response.status_code})",
            "status": "error"
        }

@app.route('/api/questions', methods=['GET'])
def get_questions():
    """Get list of available questions"""
    return jsonify({
        "questions": config_manager.get_questions()
    })

@app.route('/api/hotels', methods=['GET'])
def get_hotels():
    """Get list of available hotels"""
    hotels = config_manager.get_hotels()
    return jsonify({
        "hotels": [{"name": hotel['name'], "company_id": hotel['company_id']} for hotel in hotels]
    })

@app.route('/api/ask', methods=['POST'])
def ask_questions():
    """Ask questions to selected hotels"""
    data = request.json
    
    if not data or 'hotels' not in data or 'questions' not in data:
        return jsonify({
            "error": "Missing required parameters: hotels and questions"
        }), 400
    
    all_hotels = config_manager.get_hotels()
    selected_hotels = [hotel for hotel in all_hotels if hotel['name'] in data['hotels']]
    selected_questions = [q for q in config_manager.get_questions() if q in data['questions']]
    
    if not selected_hotels or not selected_questions:
        return jsonify({
            "error": "No valid hotels or questions selected"
        }), 400
    
    results = []
    for hotel in selected_hotels:
        for question in selected_questions:
            result = interroger_chatbot(hotel, question)
            results.append(result)
    
    # Generate timestamp for the response
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    return jsonify({
        "timestamp": timestamp,
        "results": results
    })

if __name__ == '__main__':
    app.run(debug=True) 