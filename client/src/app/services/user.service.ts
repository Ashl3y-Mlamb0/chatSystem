import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public readonly USERS_KEY = 'users';

  constructor() {
    this.initializeSuperUser(); // Call this in the constructor
  }

  private initializeSuperUser() {
    const users = this.getUsers();
    if (users.length === 0) { // If no users exist, create the 'super' user
      const superUser = {
        id: uuidv4(),
        username: 'super',
        password: '123',
        roles: ['superAdmin'],
        groups: []
      };
      this.addUser(superUser);
    }
  }

  // Get all users from local storage
  getUsers(): any[] {
    const usersData = localStorage.getItem(this.USERS_KEY);
    return usersData ? JSON.parse(usersData) : [];
  }

  // Get a user by their ID
  getUserById(userId: string): User | undefined {
    const users = this.getUsers();
    return users.find(user => user.id === userId);
  }

  // Add a new user to local storage
  addUser(user: any): void {
    const users = this.getUsers();
    users.push(user);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

}