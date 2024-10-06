import { Channel } from './channel.model';
import { User } from './user.model';

export interface Group {
  _id: string;
  //   id: string;
  name: string;
  admins: string[]; // Array of user IDs who are admins of this group
  channels: Channel[];
  joinRequests: User[]; // Array of user IDs who have requested to join
}
