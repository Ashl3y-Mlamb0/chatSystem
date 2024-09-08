export interface Message {
    _id: string;
    channelId: string;
    sender: string;
    content: string;
    timestamp: Date;
}