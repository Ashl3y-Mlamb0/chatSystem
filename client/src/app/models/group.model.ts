import { Channel } from './channel.model';

export interface Group {
  _id: string;
  //   id: string;
  name: string;
  admins: string[]; // Array of user IDs who are admins of this group
  channels: Channel[];
  joinRequests: string[]; // Array of user IDs who have requested to join
}
