import { Injectable } from '@angular/core';
import { Message } from '../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly MESSAGES_KEY = 'messages';
  private messageCounter = 0;

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
      _id: (this.messageCounter++).toString(),
      channelId,
      sender: 'You', // Replace with actual user information in Phase 2
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