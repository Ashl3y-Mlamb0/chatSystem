import { Injectable } from '@angular/core';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly CURRENT_USER_KEY = 'currentUser'; // Key for storing the current user in local storage

  constructor(private userService: UserService) { } // Inject UserService

  // For Phase 1, simulate authentication and store current user in local storage
  authenticate(username: string, password: string): boolean {
    const users = this.userService.getUsers(); // Get all users from UserService

    // Find the user with matching username and password (replace with actual logic in Phase 2)
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
      return true;
    } else {
      return false;
    }
  }

  signup(username: string, email: string, password: string): boolean {
    const users = this.userService.getUsers();

    // Check if username is already taken
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
      // Handle username conflict (e.g., display an error message)
      return false;
    }

    // Create the new user object
    const newUser = { username, email, password, roles: ['user'] };

    // Add the new user to local storage (replace with backend call in Phase 2)
    this.userService.addUser(newUser);

    // Simulate login after signup (replace with actual login in Phase 2)
    this.authenticate(username, password);

    return true; // Signup successful
  }

  // Get the currently logged-in user (or null if not logged in)
  getCurrentUser(): any {
    const userData = localStorage.getItem(this.CURRENT_USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  // Logout the user (clear local storage)
  logout(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  // Check if the user has a specific role
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user && user.roles && user.roles.includes(role);
  }
}