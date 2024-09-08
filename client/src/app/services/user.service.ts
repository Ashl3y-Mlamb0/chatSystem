import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly USERS_KEY = 'users';

  constructor() {
    this.initializeSuperUser(); // Call this in the constructor
  }

  private initializeSuperUser() {
    const users = this.getUsers();
    if (users.length === 0) { // If no users exist, create the 'super' user
      const superUser = {
        username: 'super',
        password: '123',
        roles: ['superAdmin']
      };
      this.addUser(superUser);
    }
  }

  // Get all users from local storage
  getUsers(): any[] {
    const usersData = localStorage.getItem(this.USERS_KEY);
    return usersData ? JSON.parse(usersData) : [];
  }

  // Add a new user to local storage
  addUser(user: any): void {
    const users = this.getUsers();
    users.push(user);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

}