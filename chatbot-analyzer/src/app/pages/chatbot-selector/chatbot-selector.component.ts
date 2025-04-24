import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface Chatbot {
  id: string;
  name: string;
  logo: string;
  description: string;
}

@Component({
  selector: 'app-chatbot-selector',
  templateUrl: './chatbot-selector.component.html',
  styleUrls: ['./chatbot-selector.component.scss']
})
export class ChatbotSelectorComponent {
  chatbots: Chatbot[] = [
    {
      id: 'asksuite',
      name: 'Asksuite',
      logo: 'assets/images/chatbots-logos/asksuite.png',
      description: 'No description provided'
    },
    // {
    //   id: 'apartahotel-jardines-de-sabatini',
    //   name: 'Apartahotel Jardines de Sabatini',
    //   logo: 'assets/images/jardines-sabatini-logo.png',
    //   description: 'Boutique hotel chatbot for Jardines de Sabatini'
    // },
    // {
    //   id: 'hard-rock-cafe-new-york',
    //   name: 'Hard Rock Hotel',
    //   logo: 'assets/images/hard-rock-logo.png',
    //   description: 'Entertainment hotel chatbot for Hard Rock'
    // }
  ];

  constructor(private router: Router) {}

  selectChatbot(chatbotId: string): void {
    this.router.navigate(['/chatbot-details', chatbotId]);
  }
}
