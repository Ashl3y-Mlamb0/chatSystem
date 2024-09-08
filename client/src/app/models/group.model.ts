import { Channel } from './channel.model';

export interface Group {
    id: string;
    name: string;
    admins: string[]; // Array of user IDs who are admins of this group
    channels: Channel[];
}