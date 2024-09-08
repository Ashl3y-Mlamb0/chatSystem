import { Component, OnInit } from '@angular/core'; // Remove @Input() 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChannelService } from '../services/channel.service';
import { AuthService } from '../services/auth.service';
import { Channel } from '../models/channel.model';
import { GroupService } from '../services/group.service';

@Component({
  selector: 'app-channel-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './channel-list.component.html',
  styleUrls: ['./channel-list.component.css']
})
export class ChannelListComponent implements OnInit {
  groups: any[] = [];
  selectedGroup: any = null;
  channels: Channel[] = [];
  newChannelName: string = '';
  editingChannel: Channel | null = null;

  constructor(
    private channelService: ChannelService,
    public authService: AuthService,
    private groupService: GroupService // Inject GroupService
  ) { }

  ngOnInit() {
    this.fetchGroups();
  }

  fetchGroups() {
    this.groups = this.groupService.getGroups();

    // If there's a default group, select it and fetch its channels
    if (this.groups.length > 0) {
      this.selectedGroup = this.groups[0];
      this.fetchChannels();
    }
  }

  fetchChannels() {
    if (this.selectedGroup) {
      this.channels = this.channelService.getChannelsByGroupId(this.selectedGroup.id);
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

  cancelEdit() {
    this.editingChannel = null;
  }

  deleteChannel(channelId: string) {
    if (confirm('Are you sure you want to delete this channel?')) {
      this.channelService.deleteChannel(channelId);
      this.fetchChannels();
    }
  }

}