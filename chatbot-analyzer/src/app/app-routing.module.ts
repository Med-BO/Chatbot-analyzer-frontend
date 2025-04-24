import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatbotSelectorComponent } from './pages/chatbot-selector/chatbot-selector.component';
import { ChatbotDetailsComponent } from './pages/chatbot-details/chatbot-details.component';
import { QuestionsComponent } from './pages/questions/questions.component';
import { HotelsComponent } from './pages/hotels/hotels.component';

const routes: Routes = [
  { path: '', redirectTo: '/chatbot-selector', pathMatch: 'full' },
  { path: 'chatbot-selector', component: ChatbotSelectorComponent },
  { path: 'chatbot-details/:id', component: ChatbotDetailsComponent },
  { path: 'questions', component: QuestionsComponent },
  { path: 'hotels', component: HotelsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
