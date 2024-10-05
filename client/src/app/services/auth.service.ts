import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment'; // Assuming you have an environment file with the API URL

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly CURRENT_USER_KEY = 'currentUser'; // Key for storing the current user in local storage
  private readonly TOKEN_KEY = 'authToken'; // Key for storing the JWT token

  private apiUrl = environment.apiUrl; // The base URL for your backend API

  constructor(private http: HttpClient) {}

  // Login and get a JWT token
  authenticate(username: string, password: string): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/auth/login`, { username, password })
      .pipe(
        map((response) => {
          // Store the token and user information in local storage
          localStorage.setItem(this.TOKEN_KEY, response.token);
          localStorage.setItem(
            this.CURRENT_USER_KEY,
            JSON.stringify(response.user)
          );
          return response.user;
        })
      );
  }

  // Register a new user
  signup(username: string, email: string, password: string): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/auth/register`, { username, email, password })
      .pipe(
        map((response) => {
          // You may automatically log the user in after signup
          this.authenticate(username, password).subscribe();
          return response;
        })
      );
  }

  // Get the currently logged-in user from local storage
  getCurrentUser(): any {
    const userData = localStorage.getItem(this.CURRENT_USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  // Get the JWT token from local storage
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Logout the user (clear local storage)
  logout(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
  }

  // Check if the user has a specific role
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user && user.roles && user.roles.includes(role);
  }

  // Check if the current user is an admin of the specified group
  isGroupAdmin(groupId: string): boolean {
    const user = this.getCurrentUser();
    return (
      user &&
      user.groups &&
      user.groups.includes(groupId) &&
      this.hasRole('groupAdmin')
    );
  }

  // Check if the current user is a member of the specified group
  isGroupMember(groupId: string): boolean {
    const user = this.getCurrentUser();
    return user && user.groups && user.groups.includes(groupId);
  }

  // Get the headers for authenticated requests (used for API calls that require the token)
  getHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }
}
