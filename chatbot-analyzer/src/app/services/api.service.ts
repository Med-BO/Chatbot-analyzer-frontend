import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Hotel {
  name: string;
  company_id: string;
  payload: any;
}

export interface Question {
  text: string;
}

export interface ChatbotResponse {
  hotel: string;
  question: string;
  response: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Questions API
  getQuestions(): Observable<{ questions: string[] }> {
    return this.http.get<{ questions: string[] }>(`${this.baseUrl}/questions`);
  }

  getAdminQuestions(): Observable<{ questions: string[] }> {
    return this.http.get<{ questions: string[] }>(`${this.baseUrl}/admin/questions`);
  }

  addQuestion(question: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/questions`, { question });
  }

  updateQuestion(oldQuestion: string, newQuestion: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/questions/${encodeURIComponent(oldQuestion)}`, { new_question: newQuestion });
  }

  deleteQuestion(question: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/admin/questions/${encodeURIComponent(question)}`);
  }

  // Hotels API
  getHotels(): Observable<{ hotels: { name: string; company_id: string }[] }> {
    return this.http.get<{ hotels: { name: string; company_id: string }[] }>(`${this.baseUrl}/hotels`);
  }

  getAdminHotels(): Observable<{ hotels: Hotel[] }> {
    return this.http.get<{ hotels: Hotel[] }>(`${this.baseUrl}/admin/hotels`);
  }

  addHotel(hotel: Hotel): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/hotels`, hotel);
  }

  updateHotel(hotelName: string, hotel: Hotel): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/hotels/${encodeURIComponent(hotelName)}`, hotel);
  }

  deleteHotel(hotelName: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/admin/hotels/${encodeURIComponent(hotelName)}`);
  }

  // Chatbot API
  askQuestions(hotels: string[], questions: string[]): Observable<{ timestamp: string; results: ChatbotResponse[] }> {
    return this.http.post<{ timestamp: string; results: ChatbotResponse[] }>(`${this.baseUrl}/ask`, {
      hotels,
      questions
    });
  }
} 