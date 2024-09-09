import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupService } from '../services/group.service';
import { AuthService } from '../services/auth.service';
import { Group } from '../models/group.model';

@Component({
  selector: 'app-group-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.css']
})
export class GroupListComponent implements OnInit {
  groups: Group[] = [];

  constructor(
    private groupService: GroupService,
    public authService: AuthService
  ) { }

  ngOnInit() {
    this.fetchGroups();
  }

  fetchGroups() {
    this.groups = this.groupService.getGroups();
  }

  requestAccess(group: Group) {
    const currentUserId = this.authService.getCurrentUser().id;
    console.log(currentUserId)
    if (currentUserId) {
      // Check if the user has already requested access to this group
      const existingRequests = this.groupService.getJoinRequests(group.id);
      if (existingRequests.includes(currentUserId)) {
        alert('You have already requested access to this group.');
        return;
      }

      this.groupService.addJoinRequest(group.id, currentUserId);
      alert(`Access request sent for group: ${group.name}`);
    } else {
      // Handle the case where the user is not logged in (e.g., redirect to login)
    }
  }
}