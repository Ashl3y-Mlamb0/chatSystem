import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Channel } from '../models/channel.model'; // Assuming you have a channel model defined
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment'; // Adjust path if necessary

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  private apiUrl = `${environment.apiUrl}/channels`; // Base URL for channel management

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Helper method to get headers with the authorization token
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  // Get all channels for a specific group by groupId
  getChannelsByGroupId(groupId: string): Observable<Channel[]> {
    return this.http.get<Channel[]>(`${this.apiUrl}/group/${groupId}`, {
      headers: this.getHeaders(),
    });
  }

  // Get a specific channel by its ID
  getChannelById(channelId: string): Observable<Channel> {
    return this.http.get<Channel>(`${this.apiUrl}/${channelId}`, {
      headers: this.getHeaders(),
    });
  }

  // Add a new channel
  addChannel(channelName: string, groupId: string): Observable<Channel> {
    const newChannel = {
      name: channelName,
      groupId,
    };
    return this.http.post<Channel>(this.apiUrl, newChannel, {
      headers: this.getHeaders(),
    });
  }

  // Update an existing channel
  updateChannel(updatedChannel: Channel): Observable<Channel> {
    return this.http.put<Channel>(
      `${this.apiUrl}/${updatedChannel._id}`,
      updatedChannel,
      { headers: this.getHeaders() }
    );
  }

  // Delete a channel
  deleteChannel(channelId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${channelId}`, {
      headers: this.getHeaders(),
    });
  }
}
