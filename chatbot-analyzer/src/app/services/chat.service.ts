import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Hotel {
  name: string;
  company_id: string;
}

export interface ChatResponse {
  conversation_id: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = environment.apiUrl + "/chat";

  constructor(private http: HttpClient) { }

  getHotels(): Observable<Hotel[]> {
    return this.http.get<Hotel[]>(`${this.apiUrl}/hotels`);
  }

  startChat(companyId: string): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.apiUrl}/start`, { company_id: companyId });
  }

  sendMessage(conversationId: string, message: string, companyId: string): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.apiUrl}/send`, {
      conversation_id: conversationId,
      message: message,
      company_id: companyId
    });
  }
} 