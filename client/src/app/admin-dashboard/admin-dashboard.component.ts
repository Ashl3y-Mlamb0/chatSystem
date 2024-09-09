import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GroupService } from '../services/group.service';
import { ChannelService } from '../services/channel.service';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { Group } from '../models/group.model';
import { Channel } from '../models/channel.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  groups: Group[] = [];
  selectedGroup: Group | null = null;
  channels: Channel[] = [];
  newGroupName: string = '';
  newChannelName: string = '';
  editingGroup: Group | null = null;
  editingChannel: Channel | null = null;
  joinRequests: { groupId: string, userId: string }[] = [];

  constructor(
    private groupService: GroupService,
    private channelService: ChannelService,
    public authService: AuthService,
    public userService: UserService
  ) { }

  ngOnInit() {
    this.fetchGroups();
  }

  fetchGroups() {
    if (this.authService.hasRole('superAdmin')) {
      this.groups = this.groupService.getGroups();
    } else {
      this.groups = this.groupService.getGroups().filter(group =>
        group.admins.includes(this.authService.getCurrentUser()?.id)
      );
    }

    if (this.groups.length > 0) {
      this.selectedGroup = this.groups[0];
      this.fetchChannels();
      this.fetchJoinRequests(); // Fetch join requests when a group is selected
    }
  }

  fetchChannels() {
    if (this.selectedGroup) {
      this.channels = this.channelService.getChannelsByGroupId(this.selectedGroup.id);
    } else {
      this.channels = [];
    }
  }

  createGroup() {
    if (this.newGroupName.trim() !== '') {
      this.groupService.addGroup(this.newGroupName);
      this.newGroupName = '';
      this.fetchGroups();
    }
  }

  editGroup(group: Group) {
    this.editingGroup = { ...group };
  }

  saveGroup() {
    if (this.editingGroup) {
      this.groupService.updateGroup(this.editingGroup);
      this.editingGroup = null;
      this.fetchGroups();
    }
  }

  cancelGroupEdit() {
    this.editingGroup = null;
  }

  deleteGroup(groupId: string) {
    if (confirm('Are you sure you want to delete this group?')) {
      this.groupService.deleteGroup(groupId);
      this.fetchGroups();

      if (this.selectedGroup && this.selectedGroup.id === groupId) {
        this.selectedGroup = null;
        this.channels = [];
      }
    }
  }

  createChannel() {
    if (this.newChannelName.trim() !== '' && this.selectedGroup) {
      this.channelService.addChannel(this.newChannelName, this.selectedGroup.id);
      this.newChannelName = '';
      this.fetchChannels();
    }
  }

  editChannel(channel: Channel) {
    this.editingChannel = { ...channel };
  }

  saveChannel() {
    if (this.editingChannel) {
      this.channelService.updateChannel(this.editingChannel);
      this.editingChannel = null;
      this.fetchChannels();
    }
  }

  cancelChannelEdit() {
    this.editingChannel = null;
  }

  deleteChannel(channelId: string) {
    if (confirm('Are you sure you want to delete this channel?')) {
      this.channelService.deleteChannel(channelId);
      this.fetchChannels();
    }
  }

  fetchJoinRequests() {
    if (this.selectedGroup) {
      this.joinRequests = this.groupService.getJoinRequests(this.selectedGroup.id)
        .map(userId => ({ groupId: this.selectedGroup!.id, userId }));
    } else {
      this.joinRequests = [];
    }
  }

  approveJoinRequest(request: { groupId: string, userId: string }) {
    this.groupService.approveJoinRequest(request.groupId, request.userId);
    this.fetchJoinRequests();
  }

  rejectJoinRequest(request: { groupId: string, userId: string }) {
    this.groupService.rejectJoinRequest(request.groupId, request.userId);
    this.fetchJoinRequests();
  }
}