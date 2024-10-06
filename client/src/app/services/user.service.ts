import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment'; // Adjust path as necessary

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`; // Base URL for user management

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Helper method to get the headers with authorization token
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  // Get all users (Admin only)
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  // Get the current logged-in user's profile
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`, {
      headers: this.getHeaders(),
    });
  }

  // Update the current user's profile
  updateCurrentUser(updatedUser: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/me`, updatedUser, {
      headers: this.getHeaders(),
    });
  }

  // Update the user's avatar (profile picture)
  updateAvatar(avatarFile: File): Observable<User> {
    const formData = new FormData();
    formData.append('avatar', avatarFile); // Attach the avatar file

    return this.http.put<User>(`${this.apiUrl}/me/avatar`, formData, {
      headers: this.getHeaders(),
    });
  }

  // Get a specific user by their ID (Super Admin only)
  getUserById(userId: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${userId}`, {
      headers: this.getHeaders(),
    });
  }
}
