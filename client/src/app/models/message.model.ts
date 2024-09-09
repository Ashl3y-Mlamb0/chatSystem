export interface Message {
    id: string;
    channelId: string;
    sender: string;
    content: string;
    timestamp: Date;
}