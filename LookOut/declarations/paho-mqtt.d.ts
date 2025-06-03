declare module 'paho-mqtt' {
  export class Client {
    constructor(url: string, clientId: string);
    connect(options: {
      useSSL?: boolean;
      userName?: string;
      password?: string;
      onSuccess?: () => void;
      onFailure?: (responseObject: any) => void;
      timeout?: number;
    }): void;
    isConnected(): boolean;
    send(message: Message): void;
    disconnect(): void;
    onConnectionLost: (responseObject: any) => void;
    onMessageArrived: (message: Message) => void;
  }
  export class Message {
    constructor(payload: string);
    destinationName: string;
    payloadString: string;
  }
}
