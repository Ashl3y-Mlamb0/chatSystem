export interface Sender {
  username: string;
  avatar: string;
}

export interface Message {
  _id: string;
  channelId: string;
  sender: Sender;
  content: string;
  timestamp: Date;
}
