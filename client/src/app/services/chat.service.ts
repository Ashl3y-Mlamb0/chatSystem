import { Injectable } from '@angular/core';
import { Message } from '../models/message.model';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly MESSAGES_KEY = 'messages';

  constructor(private authService: AuthService) { }

  // Get messages for a channel from local storage
  getMessages(channelId: string): Message[] {
    const allMessagesData = localStorage.getItem(this.MESSAGES_KEY);
    const allMessages = allMessagesData ? JSON.parse(allMessagesData) as Message[] : [];

    return allMessages.filter(message => message.channelId === channelId);
  }

  // Send a message (store in local storage)
  sendMessage(channelId: string, messageContent: string) {
    const allMessages = this.getAllMessages();
    const newMessage: Message = {
      id: uuidv4(),
      channelId,
      sender: this.authService.getCurrentUser()?.username,
      content: messageContent,
      timestamp: new Date()
    };
    allMessages.push(newMessage);
    localStorage.setItem(this.MESSAGES_KEY, JSON.stringify(allMessages));
  }

  private getAllMessages(): Message[] {
    const allMessagesData = localStorage.getItem(this.MESSAGES_KEY);
    return allMessagesData ? JSON.parse(allMessagesData) as Message[] : [];
  }
}