import json
import os
from typing import List, Dict, Any

class ConfigManager:
    def __init__(self, config_path: str = 'config.json'):
        self.config_path = config_path
        self.config = self._load_config()

    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from file"""
        if not os.path.exists(self.config_path):
            return {"questions": [], "hotels": []}
        
        with open(self.config_path, 'r', encoding='utf-8') as f:
            return json.load(f)

    def _save_config(self):
        """Save configuration to file"""
        with open(self.config_path, 'w', encoding='utf-8') as f:
            json.dump(self.config, f, indent=4)

    # Questions CRUD operations
    def get_questions(self) -> List[str]:
        """Get all questions"""
        return self.config.get("questions", [])

    def add_question(self, question: str) -> bool:
        """Add a new question"""
        if question not in self.config["questions"]:
            self.config["questions"].append(question)
            self._save_config()
            return True
        return False

    def update_question(self, old_question: str, new_question: str) -> bool:
        """Update an existing question"""
        if old_question in self.config["questions"]:
            index = self.config["questions"].index(old_question)
            self.config["questions"][index] = new_question
            self._save_config()
            return True
        return False

    def delete_question(self, question: str) -> bool:
        """Delete a question"""
        if question in self.config["questions"]:
            self.config["questions"].remove(question)
            self._save_config()
            return True
        return False

    # Hotels CRUD operations
    def get_hotels(self) -> List[Dict[str, Any]]:
        """Get all hotels"""
        return self.config.get("hotels", [])

    def add_hotel(self, hotel: Dict[str, Any]) -> bool:
        """Add a new hotel"""
        if not any(h["name"] == hotel["name"] for h in self.config["hotels"]):
            self.config["hotels"].append(hotel)
            self._save_config()
            return True
        return False

    def update_hotel(self, hotel_name: str, updated_hotel: Dict[str, Any]) -> bool:
        """Update an existing hotel"""
        for i, hotel in enumerate(self.config["hotels"]):
            if hotel["name"] == hotel_name:
                self.config["hotels"][i] = updated_hotel
                self._save_config()
                return True
        return False

    def delete_hotel(self, hotel_name: str) -> bool:
        """Delete a hotel"""
        for i, hotel in enumerate(self.config["hotels"]):
            if hotel["name"] == hotel_name:
                del self.config["hotels"][i]
                self._save_config()
                return True
        return False 