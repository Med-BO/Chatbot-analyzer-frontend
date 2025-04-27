import { Component, OnInit } from '@angular/core';
import { ChatService, Hotel, ChatResponse } from '../../services/chat.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  hotels: Hotel[] = [];
  selectedHotel: Hotel | null = null;
  conversationId: string | null = null;
  messages: { text: string; isUser: boolean }[] = [];
  chatForm: FormGroup;
  isLoading = false;

  constructor(
    private chatService: ChatService,
    private fb: FormBuilder
  ) {
    this.chatForm = this.fb.group({
      message: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadHotels();
  }

  loadHotels(): void {
    this.chatService.getHotels().subscribe(
      (data: any) => {
        this.hotels = data.hotels
      }
    );
  }

  selectHotel(hotel: Hotel): void {
    this.selectedHotel = hotel;
    this.startNewChat();
  }

  startNewChat(): void {
    if (!this.selectedHotel) return;
    
    this.isLoading = true;
    this.chatService.startChat(this.selectedHotel.company_id).subscribe(
      response => {
        this.conversationId = response.conversation_id;
        this.messages = [];
        const initializationSuccessMessage = `Conversation avec ${this.selectedHotel!.name} initialisé avec succes. vous pouvez commencer a interroger le chatbot.`
        this.messages.push({ text: initializationSuccessMessage, isUser: false });
        this.isLoading = false;
      },
      error => {
        console.error('Error starting chat:', error);
        this.isLoading = false;
      }
    );
  }

  sendMessage(): void {
    if (!this.chatForm.valid || !this.conversationId || !this.selectedHotel) return;

    const message = this.chatForm.get('message')?.value;
    this.messages.push({ text: message, isUser: true });
    this.chatForm.reset();

    this.isLoading = true;
    this.chatService.sendMessage(this.conversationId, message, this.selectedHotel.company_id).subscribe(
      response => {
        if (response.message === "") {
          response.message = "Pas de réponse"
        }
        this.messages.push({ text: response.message, isUser: false });
        this.isLoading = false;
      },
      error => {
        console.error('Error sending message:', error);
        this.isLoading = false;
      }
    );
  }
} 