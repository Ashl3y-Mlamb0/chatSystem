import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  private readonly CHANNELS_KEY = 'channels'; // Key for storing channels in local storage

  // Get all channels from local storage
  getChannels(): any[] {
    const channelsData = localStorage.getItem(this.CHANNELS_KEY);
    return channelsData ? JSON.parse(channelsData) : [];
  }

  // Add a new channel to local storage
  addChannel(channel: any): void {
    const channels = this.getChannels();
    channels.push(channel);
    localStorage.setItem(this.CHANNELS_KEY, JSON.stringify(channels));
  }

  // ... (Add other methods for updating, deleting channels as needed)
}