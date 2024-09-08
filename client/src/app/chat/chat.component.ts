import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../services/chat.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  messages: string[] = []; // Array to store chat messages
  newMessage: string = '';

  constructor(private chatService: ChatService) {
    // In Phase 2, subscribe to real-time messages from the ChatService here
  }

  sendMessage() {
    if (this.newMessage.trim() !== '') {
      // In Phase 2, send the message using the ChatService
      this.messages.push(this.newMessage);
      this.newMessage = '';
    }
  }
}