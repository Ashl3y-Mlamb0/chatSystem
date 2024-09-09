import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GroupService } from '../services/group.service';
import { ChannelService } from '../services/channel.service';
import { ChatService } from '../services/chat.service';
import { Message } from '../models/message.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Channel } from '../models/channel.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  selectedGroup: any = null;
  selectedChannel: any = null;
  groups: any[] = [];
  channels: any[] = [];
  messages: Message[] = [];
  newMessage: string = '';

  constructor(
    private groupService: GroupService,
    private channelService: ChannelService,
    private chatService: ChatService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.groups = this.groupService.getAccessibleGroups();

    this.route.paramMap.subscribe(params => {
      const groupId = params.get('groupId');
      const channelId = params.get('channelId');

      if (groupId && channelId) {
        this.handleGroupAndChannelSelection(groupId, channelId);
      } else if (groupId) {
        this.handleGroupSelection(groupId);
      } else {
        // If no group/channel is selected, you might want to handle this differently
        // For now, let's just select the first group and its first channel (if available)
        if (this.groups.length > 0) {
          this.selectedGroup = this.groups[0];
          this.onGroupSelect();
        }
      }
    });
  }

  handleGroupAndChannelSelection(groupId: string, channelId: string) {
    this.selectedGroup = this.groups.find(group => group.id === groupId);
    if (!this.selectedGroup) {
      // Handle invalid groupId (you might want to redirect or show an error)
      return;
    }

    this.fetchChannels().then(() => {
      this.selectedChannel = this.channels.find(channel => channel.id === channelId);
      if (!this.selectedChannel) {
        // Handle invalid channelId (you might want to redirect or show an error)
        return;
      }
      this.fetchMessages();
    });
  }

  handleGroupSelection(groupId: string) {
    this.selectedGroup = this.groups.find(group => group.id === groupId);
    if (!this.selectedGroup) {
      // Handle invalid groupId
      return;
    }

    this.fetchChannels().then(() => {
      if (this.channels.length > 0) {
        this.selectedChannel = this.channels[0];
        this.fetchMessages();
      }
    });
  }

  async fetchChannels() {
    if (this.selectedGroup) {
      this.channels = this.channelService.getChannelsByGroupId(this.selectedGroup.id);
    }
  }

  onChannelSelect(channel: Channel) {
    this.selectedChannel = channel;
    this.fetchMessages();
  }

  fetchMessages() {
    if (this.selectedChannel) {
      this.messages = this.chatService.getMessages(this.selectedChannel.id);
    }
  }

  sendMessage() {
    if (this.newMessage.trim() !== '' && this.selectedChannel) {
      this.chatService.sendMessage(this.selectedChannel.id, this.newMessage);
      this.fetchMessages();
      this.newMessage = '';
    }
  }

  // Add the onGroupSelect method here
  onGroupSelect() {
    if (this.selectedGroup) {
      this.channels = this.channelService.getChannelsByGroupId(this.selectedGroup.id);
      this.messages = []; // Clear messages

      // If there are channels, select the first one and fetch its messages
      if (this.channels.length > 0) {
        this.selectedChannel = this.channels[0];
        this.fetchMessages();
      } else {
        // If no channels, clear the selectedChannel
        this.selectedChannel = null;
      }
    }
  }

  logChannel() {
    console.log(this.selectedChannel)
  }
}