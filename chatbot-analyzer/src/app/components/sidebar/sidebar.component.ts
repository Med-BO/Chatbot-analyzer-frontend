import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface NavItem {
  title: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  navItems: NavItem[] = [
    { title: 'Chatbot Selector', icon: 'chat', route: '/chatbot-selector' },
    { title: 'Hotels', icon: 'hotel', route: '/hotels' },
    { title: 'Questions', icon: 'question_answer', route: '/questions' }
  ];

  constructor(private router: Router) {}

  isActive(route: string): boolean {
    return this.router.url === route;
  }
} 