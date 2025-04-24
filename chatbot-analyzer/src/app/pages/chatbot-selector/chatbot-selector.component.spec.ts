import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatbotSelectorComponent } from './chatbot-selector.component';

describe('ChatbotSelectorComponent', () => {
  let component: ChatbotSelectorComponent;
  let fixture: ComponentFixture<ChatbotSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatbotSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatbotSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
