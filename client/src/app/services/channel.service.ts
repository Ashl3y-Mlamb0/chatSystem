import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

interface Channel {
  id: string;
  name: string;
  groupId: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  private readonly CHANNELS_KEY = 'channels';

  // Get all channels from local storage
  getChannels(): Channel[] {
    const channelsData = localStorage.getItem(this.CHANNELS_KEY);
    return channelsData ? JSON.parse(channelsData) as Channel[] : [];
  }

  // Get channels by group ID
  getChannelsByGroupId(groupId: string): Channel[] {
    const allChannels = this.getChannels();
    return allChannels.filter(channel => channel.groupId === groupId);
  }

  // Get a channel by its ID
  getChannelById(channelId: string): Channel | undefined {
    const allChannels = this.getChannels();
    return allChannels.find(channel => channel.id === channelId);
  }

  // Add a new channel to local storage
  addChannel(channelName: string, groupId: string): void {
    const channels = this.getChannels();
    const newChannel: Channel = {
      id: uuidv4(), // Generate a simple ID
      name: channelName,
      groupId
    };
    channels.push(newChannel);
    localStorage.setItem(this.CHANNELS_KEY, JSON.stringify(channels));
  }

  // Update a channel in local storage
  updateChannel(updatedChannel: Channel): void {
    const channels = this.getChannels();
    const index = channels.findIndex(channel => channel.id === updatedChannel.id);
    if (index !== -1) {
      channels[index] = updatedChannel;
      localStorage.setItem(this.CHANNELS_KEY, JSON.stringify(channels));
    }
  }

  // Delete a channel from local storage
  deleteChannel(channelId: string): void {
    const channels = this.getChannels();
    const updatedChannels = channels.filter(channel => channel.id !== channelId);
    localStorage.setItem(this.CHANNELS_KEY, JSON.stringify(updatedChannels));
  }

}