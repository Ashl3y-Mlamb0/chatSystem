import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { Group } from '../models/group.model';
import { User } from '../models/user.model';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from '../services/auth.service';


@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private readonly GROUPS_KEY = 'groups';

  constructor(private userService: UserService, private authService: AuthService) { }

  // Get all groups from local storage
  getGroups(): Group[] {
    const groupsData = localStorage.getItem(this.GROUPS_KEY);
    return groupsData ? JSON.parse(groupsData) as Group[] : [];
  }

  // Get groups that the current user can access
  getAccessibleGroups(): Group[] {
    if (this.authService.hasRole('superAdmin')) {
      // Super admins can see all groups
      return this.getGroups();
    } else {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        const allGroups = this.getGroups();
        return allGroups.filter(group => {
          // Normal users can only see groups they're a member of
          // Group admins can see groups they're an admin of
          return currentUser.groups.includes(group.id) || group.admins.includes(currentUser.id);
        });
      } else {
        // If not logged in, return an empty array or handle it differently
        return [];
      }
    }
  }

  // Add a new group to local storage
  addGroup(groupName: string): void {
    const groups = this.getGroups();
    const newGroup: Group = {
      id: uuidv4(),
      name: groupName,
      admins: [this.authService.getCurrentUser().id],
      channels: [],
      joinRequests: []
    };
    groups.push(newGroup);
    localStorage.setItem(this.GROUPS_KEY, JSON.stringify(groups));
  }

  // Update a group in local storage
  updateGroup(updatedGroup: Group): void {
    const groups = this.getGroups();
    const index = groups.findIndex(group => group.id === updatedGroup.id);
    if (index !== -1) {
      groups[index] = updatedGroup;
      localStorage.setItem(this.GROUPS_KEY, JSON.stringify(groups));
    }
  }

  // Delete a group from local storage
  deleteGroup(groupId: string): void {
    const groups = this.getGroups();
    const updatedGroups = groups.filter(group => group.id !== groupId);
    localStorage.setItem(this.GROUPS_KEY, JSON.stringify(updatedGroups));
  }

  // Add a join request to a group
  addJoinRequest(groupId: string, userId: string): void {
    const groups = this.getGroups();
    const group = groups.find(g => g.id === groupId);
    if (group) {
      group.joinRequests.push(userId);
      localStorage.setItem(this.GROUPS_KEY, JSON.stringify(groups));
    }
  }

  // Get pending join requests for a group
  getJoinRequests(groupId: string): string[] {
    const groups = this.getGroups();
    const group = groups.find(g => g.id === groupId);
    return group ? group.joinRequests : [];
  }

  // Approve a join request (add user to the group and remove the request)
  approveJoinRequest(groupId: string, userId: string): void {
    const groups = this.getGroups();
    const group = groups.find(g => g.id === groupId);

    if (group) {
      group.joinRequests = group.joinRequests.filter(id => id !== userId);
      localStorage.setItem(this.GROUPS_KEY, JSON.stringify(groups));

      // Update the user's groups array directly in local storage
      const usersData = localStorage.getItem(this.userService.USERS_KEY);
      if (usersData) {
        const users = JSON.parse(usersData);
        const user = users.find((u: User) => u.id === userId);
        if (user) {
          user.groups.push(groupId);
          localStorage.setItem(this.userService.USERS_KEY, JSON.stringify(users));
        }
      }
    }
  }

  // Reject a join request (remove the request)
  rejectJoinRequest(groupId: string, userId: string): void {
    const groups = this.getGroups();
    const group = groups.find(g => g.id === groupId);
    if (group) {
      group.joinRequests = group.joinRequests.filter(id => id !== userId);
      localStorage.setItem(this.GROUPS_KEY, JSON.stringify(groups));
    }
  }
}