import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private readonly GROUPS_KEY = 'groups'; // Key for storing groups in local storage

  // Get all groups from local storage
  getGroups(): any[] {
    const groupsData = localStorage.getItem(this.GROUPS_KEY);
    return groupsData ? JSON.parse(groupsData) : [];
  }

  // Add a new group to local storage
  addGroup(group: any): void {
    const groups = this.getGroups();
    groups.push(group);
    localStorage.setItem(this.GROUPS_KEY, JSON.stringify(groups));
  }

  // ... (Add other methods for updating, deleting groups as needed)
}