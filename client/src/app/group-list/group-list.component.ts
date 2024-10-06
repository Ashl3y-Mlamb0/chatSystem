import { Component, OnInit } from '@angular/core';
import { GroupService } from '../services/group.service';
import { AuthService } from '../services/auth.service';
import { Group } from '../models/group.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../models/user.model';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-group-list',
  standalone: true,
  templateUrl: './group-list.component.html',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./group-list.component.css'],
})
export class GroupListComponent implements OnInit {
  groups: Group[] = [];
  currentUser: User | null = null; // To store the current user's data

  constructor(
    private groupService: GroupService,
    public authService: AuthService,
    public userService: UserService
  ) {}

  ngOnInit() {
    this.fetchGroups();
    this.fetchCurrentUser();
  }

  // Fetch all available groups
  fetchGroups() {
    this.groupService.getGroups().subscribe({
      next: (groups: Group[]) => {
        if (groups.length === 0) {
          console.log('No groups found');
        } else {
          this.groups = groups;
          console.log('Groups fetched:', this.groups);
        }
      },
      error: (err) => {
        console.error('Error fetching groups', err);
      },
    });
  }

  // Fetch the current user
  fetchCurrentUser() {
    this.userService.getCurrentUser().subscribe({
      next: (user: User) => {
        this.currentUser = user;
        console.log('Current user fetched:', this.currentUser);
      },
      error: (err) => {
        console.error('Error fetching current user:', err);
      },
    });
  }

  // Request access to a group
  requestAccess(group: Group) {
    const userId = this.authService.getCurrentUser()?.id;

    if (userId) {
      if (
        confirm(`Do you want to request access to the group "${group.name}"?`)
      ) {
        this.groupService.addJoinRequest(group._id, userId).subscribe({
          next: () => {
            group.joinRequests.push(userId); // Add user to joinRequests locally
            alert(`Access request sent for group "${group.name}"`);
          },
          error: (err) => {
            if (err.status === 409) {
              alert(
                `You have already requested access or are already a member of "${group.name}".`
              );
            } else {
              console.error('Error requesting access:', err);
              alert(`Error: ${err.error.message}`);
            }
          },
        });
      }
    } else {
      console.error('User ID is missing.');
    }
  }

  // Check if the current user has a pending request to join the group
  hasPendingRequest(group: Group): boolean {
    const userId = this.authService.getCurrentUser()?.id;

    // Check if the joinRequests array contains a user object with the current user's ID
    return group.joinRequests.some((user: User) => user._id === userId);
  }

  // Check if the current user is a member of the group
  isGroupMember(group: Group): boolean {
    if (!this.currentUser) {
      return false; // Return false if currentUser has not been fetched yet
    }

    // Check if the group._id exists in the current user's groups array
    return this.currentUser.groups.some(
      (groupId: string) => groupId === group._id
    );
  }
}
