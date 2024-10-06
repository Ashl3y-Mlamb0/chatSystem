import { Injectable } from '@angular/core';
import { Socket, SocketIoConfig } from 'ngx-socket-io';
import { environment } from '../../environments/environment'; // Your backend URL
import { AuthService } from './auth.service'; // AuthService for fetching token
import { Observable } from 'rxjs';
import { Message } from '../models/message.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private socket: Socket; // The socket instance
  private apiUrl = `${environment.apiUrl}/messages`; // Base URL for group management

  constructor(private http: HttpClient, private authService: AuthService) {
    // Get the auth token from AuthService or localStorage
    const token = localStorage.getItem('authToken');

    // Configure the Socket.IO connection with the backend URL and token
    const config: SocketIoConfig = {
      url: environment.socketUrl, // Set the socket backend URL
      options: {
        auth: {
          token: token, // Pass the token in the auth object for the handshake
        },
        transports: ['websocket'], // Ensure WebSocket transport is used
      },
    };

    // Initialize the socket with the configuration
    this.socket = new Socket(config);

    // Handle connection errors and reconnections
    this.handleConnectionErrors();
  }

  // Join a specific channel
  joinChannel(channelId: string) {
    this.socket.emit('joinChannel', channelId);
  }

  // Leave a specific channel
  leaveChannel(channelId: string) {
    this.socket.emit('leaveChannel', channelId);
  }

  // Send a message, with optional image URL
  sendMessage(
    channelId: string,
    messageContent: string,
    imageUrl: string | null = null
  ) {
    const messageData: any = { channelId, content: messageContent };
    if (imageUrl) {
      messageData.imageUrl = imageUrl; // Include image URL if provided
    }
    this.socket.emit('sendMessage', messageData);
  }

  // Method to upload an image
  uploadImage(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload`, formData, {
      headers: this.authService.getHeaders(), // Ensure proper headers (like auth) are sent
    });
  }

  // Method to update a message by ID
  updateMessage(messageId: string, content: string): Observable<Message> {
    return this.http.put<Message>(
      `${this.apiUrl}/${messageId}`,
      { content },
      {
        headers: this.authService.getHeaders(),
      }
    );
  }

  // Fetch previous messages when a channel is selected
  getPreviousMessages(): Observable<Message[]> {
    return this.socket.fromEvent<Message[]>('previousMessages');
  }

  // Listen for real-time messages
  listenForNewMessages(): Observable<Message> {
    return this.socket.fromEvent<Message>('receiveMessage');
  }

  // Listen for errors
  listenForErrors(): Observable<any> {
    return this.socket.fromEvent<any>('error');
  }

  // Listen for socket connection errors, disconnections, and reconnections
  handleConnectionErrors() {
    this.socket.on('connect_error', (error: any) => {
      console.error('Connection error:', error);
    });

    this.socket.on('disconnect', (reason: any) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('reconnect', (attemptNumber: number) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
    });
  }

  // Disconnect socket when no longer needed
  disconnectSocket() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
