import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators'; // Add switchMap for chaining
import { environment } from '../../environments/environment';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly CURRENT_USER_KEY = 'currentUser';
  private readonly TOKEN_KEY = 'authToken';
  private apiUrl = environment.apiUrl;

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
        }),
        catchError((error) => {
          console.error('Login failed', error);
          return throwError(() => new Error('Login failed. Please try again.'));
        })
      );
  }

  // Register a new user and auto-login after successful registration
  signup(username: string, email: string, password: string): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/auth/register`, { username, email, password })
      .pipe(
        switchMap((response) => {
          // After signup, automatically log the user in
          return this.authenticate(username, password);
        }),
        catchError((error) => {
          console.error('Signup failed', error);
          return throwError(
            () => new Error('Signup failed. Please try again.')
          );
        })
      );
  }

  // Get the currently logged-in user from local storage
  getCurrentUser(): any {
    const userData = localStorage.getItem(this.CURRENT_USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  // Get the JWT token from local storage and check for expiry
  getToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token && !this.isTokenExpired(token)) {
      return token;
    } else {
      this.logout(); // Auto logout if token expired
      return null;
    }
  }

  // Check if the JWT token is expired
  private isTokenExpired(token: string): boolean {
    const decoded: any = jwtDecode(token);
    const expiry = decoded.exp;
    return expiry * 1000 < Date.now(); // Check if the token is expired
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
