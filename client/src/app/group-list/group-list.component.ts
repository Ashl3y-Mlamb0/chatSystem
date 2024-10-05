import { Component, OnInit } from '@angular/core';
import { GroupService } from '../services/group.service';
import { AuthService } from '../services/auth.service';
import { Group } from '../models/group.model';

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.css'],
})
export class GroupListComponent implements OnInit {
  groups: Group[] = [];

  constructor(
    private groupService: GroupService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.fetchGroups();
  }

  // Fetch accessible groups based on user roles
  fetchGroups() {
    this.groupService.getAccessibleGroups().subscribe({
      next: (groups: Group[]) => {
        this.groups = groups;
      },
      error: (err) => console.error('Error fetching groups', err),
    });
  }

  // Request access to a group
  requestAccess(group: Group) {
    const userId = this.authService.getCurrentUser()?.id; // Get the current user's ID

    if (
      userId &&
      confirm(`Do you want to request access to the group "${group.name}"?`)
    ) {
      this.groupService.addJoinRequest(group._id, userId).subscribe({
        next: () => {
          alert(`Access request sent for group "${group.name}"`);
        },
        error: (err) => console.error('Error requesting access', err),
      });
    } else {
      console.error('User ID is missing or confirmation was cancelled.');
    }
  }
}
