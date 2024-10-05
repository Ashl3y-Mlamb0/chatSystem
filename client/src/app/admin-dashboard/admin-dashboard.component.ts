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
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  groups: Group[] = [];
  selectedGroup: Group | null = null;
  channels: Channel[] = [];
  newGroupName: string = '';
  newChannelName: string = '';
  editingGroup: Group | null = null; // Track the group being edited
  editingChannel: Channel | null = null; // Track the channel being edited
  joinRequests: { groupId: string; userId: string }[] = [];

  constructor(
    private groupService: GroupService,
    private channelService: ChannelService,
    public authService: AuthService,
    public userService: UserService
  ) {}

  ngOnInit() {
    this.fetchGroups();
  }

  fetchGroups() {
    // Fetch all accessible groups (based on admin roles)
    this.groupService.getAccessibleGroups().subscribe({
      next: (groups: Group[]) => {
        this.groups = groups;
        if (this.groups.length > 0) {
          this.selectedGroup = this.groups[0]; // Select the first group by default
          this.fetchChannels();
          this.fetchJoinRequests(); // Fetch join requests when a group is selected
        }
      },
      error: (err) => console.error('Error fetching groups', err),
    });
  }

  // Fetch channels for the selected group
  fetchChannels() {
    if (this.selectedGroup) {
      this.channelService
        .getChannelsByGroupId(this.selectedGroup._id)
        .subscribe({
          next: (channels: Channel[]) => {
            this.channels = channels;
          },
          error: (err) => console.error('Error fetching channels', err),
        });
    }
  }

  // Create a new group
  createGroup() {
    if (this.newGroupName.trim() !== '') {
      this.groupService.addGroup(this.newGroupName).subscribe({
        next: (res: any) => {
          const group = res.group;
          this.groups.push(group); // Add the new group to the list
          this.newGroupName = ''; // Clear the input field
        },
        error: (err: any) => console.error('Error creating group', err),
      });
    }
  }

  // Edit a group
  editGroup(group: Group) {
    this.editingGroup = { ...group }; // Clone the group to edit
  }

  // Save the edited group
  saveGroup() {
    if (this.editingGroup) {
      this.groupService.updateGroup(this.editingGroup).subscribe({
        next: (res: any) => {
          const updatedGroup = res.updatedGroup;
          const index = this.groups.findIndex(
            (g) => g._id === updatedGroup._id
          );
          if (index !== -1) {
            this.groups[index] = updatedGroup; // Update the group in the list
          }
          this.editingGroup = null; // Exit edit mode
        },
        error: (err) => console.error('Error saving group', err),
      });
    }
  }

  // Cancel the group edit
  cancelGroupEdit() {
    this.editingGroup = null; // Exit edit mode without saving
  }

  // Delete a group
  deleteGroup(groupId: string) {
    if (confirm('Are you sure you want to delete this group?')) {
      this.groupService.deleteGroup(groupId).subscribe({
        next: () => {
          this.groups = this.groups.filter((group) => group._id !== groupId); // Remove the group from the list
          this.selectedGroup = this.groups.length > 0 ? this.groups[0] : null; // Select the first group if available
          this.channels = [];
        },
        error: (err) => console.error('Error deleting group', err),
      });
    }
  }

  // Create a new channel
  createChannel() {
    if (this.newChannelName.trim() !== '' && this.selectedGroup) {
      this.channelService
        .addChannel(this.newChannelName, this.selectedGroup._id)
        .subscribe({
          next: (res: any) => {
            const channel = res.channel;
            this.channels.push(channel); // Add the new channel to the list
            this.newChannelName = ''; // Clear the input field
          },
          error: (err: any) => console.error('Error creating channel', err),
        });
    }
  }

  // Edit a channel
  editChannel(channel: Channel) {
    this.editingChannel = { ...channel }; // Clone the channel to edit
  }

  // Save the edited channel
  saveChannel() {
    if (this.editingChannel) {
      this.channelService.updateChannel(this.editingChannel).subscribe({
        next: (res: any) => {
          const updatedChannel = res.updatedChannel;
          console.log('updated', updatedChannel);
          const index = this.channels.findIndex(
            (c) => c._id === updatedChannel._id
          );
          if (index !== -1) {
            this.channels[index] = updatedChannel; // Update the channel in the list
          }
          this.editingChannel = null; // Exit edit mode
        },
        error: (err) => console.error('Error saving channel', err),
      });
    }
  }

  // Cancel the channel edit
  cancelChannelEdit() {
    this.editingChannel = null; // Exit edit mode without saving
  }

  // Delete a channel
  deleteChannel(channelId: string) {
    if (confirm('Are you sure you want to delete this channel?')) {
      this.channelService.deleteChannel(channelId).subscribe({
        next: () => {
          this.channels = this.channels.filter(
            (channel) => channel._id !== channelId
          ); // Remove the channel from the list
        },
        error: (err) => console.error('Error deleting channel', err),
      });
    }
  }

  // Fetch pending join requests for the selected group
  fetchJoinRequests() {
    if (this.selectedGroup) {
      this.groupService.getJoinRequests(this.selectedGroup._id).subscribe({
        next: (requests: string[]) => {
          this.joinRequests = requests.map((userId: string) => ({
            groupId: this.selectedGroup!._id,
            userId: userId,
          }));
        },
        error: (err) => console.error('Error fetching join requests', err),
      });
    }
  }

  // Approve a join request
  approveJoinRequest(request: { groupId: string; userId: string }) {
    this.groupService
      .approveJoinRequest(request.groupId, request.userId)
      .subscribe({
        next: () => {
          this.joinRequests = this.joinRequests.filter(
            (r) => r.userId !== request.userId
          ); // Remove the request from the list
        },
        error: (err) => console.error('Error approving join request', err),
      });
  }

  // Reject a join request
  rejectJoinRequest(request: { groupId: string; userId: string }) {
    this.groupService
      .rejectJoinRequest(request.groupId, request.userId)
      .subscribe({
        next: () => {
          this.joinRequests = this.joinRequests.filter(
            (r) => r.userId !== request.userId
          ); // Remove the request from the list
        },
        error: (err) => console.error('Error rejecting join request', err),
      });
  }
}
