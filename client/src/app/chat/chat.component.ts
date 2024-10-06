import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GroupService } from '../services/group.service';
import { ChannelService } from '../services/channel.service';
import { ChatService } from '../services/chat.service';
import { Message } from '../models/message.model';
import { ActivatedRoute } from '@angular/router';
import { Channel } from '../models/channel.model';
import { Subscription } from 'rxjs';
import { Group } from '../models/group.model';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewInit {
  selectedGroup: Group | null = null;
  selectedChannel: Channel | null = null;
  groups: Group[] = [];
  channels: Channel[] = [];
  messages: Message[] = [];
  newMessage: string = '';
  editingMessage: Message | null = null; // Track the message being edited
  currentUser: any; // Add this to store the current user
  private messageDebounce = false; // Added for debouncing message sending
  private messageSubscription: Subscription | null = null;
  private previousMessageSubscription: Subscription | null = null;
  public apiRoot = environment.apiRoot; // Environment API URL

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  constructor(
    private groupService: GroupService,
    private channelService: ChannelService,
    private chatService: ChatService,
    public authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Fetch the current user from AuthService
    this.currentUser = this.authService.getCurrentUser();
    console.log(this.currentUser, 'current');
    // this.checkSocketConnection();
    // Subscribe to route changes and handle group/channel selection
    this.route.paramMap.subscribe((params) => {
      const groupId = params.get('groupId');
      const channelId = params.get('channelId');

      if (groupId && channelId) {
        this.handleGroupAndChannelSelection(groupId, channelId);
      } else if (groupId) {
        this.handleGroupSelection(groupId);
      } else {
        if (this.groups.length > 0) {
          this.selectedGroup = this.groups[0];
          this.onGroupSelect();
        }
      }
    });

    // Fetch groups once on init
    this.groupService.getAccessibleGroups().subscribe({
      next: (groups) => {
        this.groups = groups;
        if (this.groups.length > 0 && !this.selectedGroup) {
          this.selectedGroup = this.groups[0];
          this.onGroupSelect();
        }
      },
      error: (err) => console.error('Error fetching groups', err),
    });
  }

  ngAfterViewInit() {}

  ngOnDestroy() {
    // Cleanup: Unsubscribe and leave the current channel on destroy
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    if (this.previousMessageSubscription) {
      this.previousMessageSubscription.unsubscribe();
    }
    if (this.selectedChannel) {
      this.chatService.leaveChannel(this.selectedChannel._id); // Leave the current channel
    }
  }

  scrollToBottom(): void {
    try {
      setTimeout(() => {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }, 100); // Delay of 100ms (adjust if needed)
    } catch (err) {
      console.error('Error scrolling to bottom', err);
    }
  }

  handleGroupAndChannelSelection(groupId: string, channelId: string) {
    this.selectedGroup =
      this.groups.find((group) => group._id === groupId) || null;
    if (!this.selectedGroup) return;

    this.fetchChannels().then(() => {
      this.selectedChannel =
        this.channels.find((channel) => channel._id === channelId) || null;
      if (!this.selectedChannel) return;

      this.onChannelSelect(this.selectedChannel);
    });
  }

  handleGroupSelection(groupId: string) {
    this.selectedGroup =
      this.groups.find((group) => group._id === groupId) || null;

    if (!this.selectedGroup) return;

    this.fetchChannels().then(() => {
      if (this.channels.length > 0) {
        this.selectedChannel = this.channels[0];
        this.onChannelSelect(this.selectedChannel);
      }
    });
  }

  async fetchChannels() {
    if (this.selectedGroup) {
      const channels = await this.channelService
        .getChannelsByGroupId(this.selectedGroup._id)
        .toPromise();
      this.channels = channels || []; // Ensure channels is an empty array if undefined
    }
  }

  // Called when a channel is selected
  onChannelSelect(channel: Channel) {
    if (!channel) {
      console.warn('Channel selection is empty!');
      return;
    }

    // If a previous channel was selected, leave it
    if (this.selectedChannel) {
      this.chatService.leaveChannel(this.selectedChannel._id); // Leave the previous channel
    }

    this.selectedChannel = channel;
    this.messages = []; // Clear messages when switching channels
    this.subscribeToMessages(); // Subscribe to real-time messages
    this.subscribeToPreviousMessages(); // Fetch previous messages

    // Join the newly selected channel
    this.chatService.joinChannel(this.selectedChannel._id);
  }

  // Subscribe to incoming real-time messages for the selected channel
  subscribeToMessages() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe(); // Unsubscribe from previous channel messages
    }

    if (this.selectedChannel) {
      this.messageSubscription = this.chatService
        .listenForNewMessages()
        .subscribe({
          next: (message: Message) => {
            console.log(message);
            this.messages.push(message);
            this.scrollToBottom(); // Scroll to bottom when a new message arrives
          },
          error: (err: any) => {
            console.error('Error receiving messages', err);
            alert('Connection error: Failed to receive messages');
          },
        });
    }
  }

  // Fetch previous messages when a channel is selected
  subscribeToPreviousMessages() {
    if (this.previousMessageSubscription) {
      this.previousMessageSubscription.unsubscribe(); // Unsubscribe from the previous fetch
    }

    if (this.selectedChannel) {
      this.previousMessageSubscription = this.chatService
        .getPreviousMessages()
        .subscribe({
          next: (messages: Message[]) => {
            this.messages = [...this.messages, ...messages.reverse()]; // Reverse messages before appending
            this.scrollToBottom(); // Scroll to bottom after fetching previous messages
          },
          error: (err: any) =>
            console.error('Error fetching previous messages', err),
        });
    }
  }

  // Send a new message using Socket.IO with debounce to prevent spamming
  sendMessage() {
    if (this.messageDebounce) return; // Prevent spamming
    this.messageDebounce = true;

    if (this.newMessage.trim() !== '' && this.selectedChannel) {
      this.chatService.sendMessage(this.selectedChannel._id, this.newMessage);
      this.newMessage = ''; // Clear the input field
    }

    setTimeout(() => (this.messageDebounce = false), 500); // Debounce for 500ms
  }

  // Method to edit a message
  editMessage(message: Message) {
    this.editingMessage = { ...message }; // Clone the message to edit
  }

  // Save the edited message
  saveMessage() {
    if (this.editingMessage) {
      const messageId = this.editingMessage._id; // Assuming message has _id
      const updatedContent = this.editingMessage.content;

      // Call the service to update the message
      this.chatService.updateMessage(messageId, updatedContent).subscribe({
        next: (res: any) => {
          const updatedMessage = res.updatedMessage;
          // Find the message in the local array and update its content
          const index = this.messages.findIndex((msg) => msg._id === messageId);
          if (index !== -1) {
            this.messages[index] = updatedMessage;
          }
          this.editingMessage = null; // Exit edit mode after saving
        },
        error: (err) => {
          console.error('Error updating message:', err);
          alert('Failed to update message');
        },
      });
    }
  }

  // Cancel message edit
  cancelMessageEdit() {
    this.editingMessage = null; // Exit edit mode without saving
  }

  onGroupSelect() {
    if (this.selectedGroup) {
      this.channels = [];
      this.messages = []; // Clear messages when a new group is selected

      // Fetch channels for the selected group and select the first one
      this.fetchChannels().then(() => {
        if (this.channels.length > 0) {
          this.onChannelSelect(this.channels[0]);
        } else {
          this.selectedChannel = null;
        }
      });
    }
  }
}
