import { EventEmitter } from 'eventemitter3';

export class RPCHub extends EventEmitter {
  addUnapprovedMessage = (event: string) => {
    const messageId = Date.now();
    this.emit(`unapprovedMessage`, {
      messageId,
      event,
    });
  };

  waitUnapprovedMesagges = (event: string) =>
    new Promise((resolve, reject) => {
      const messageId = Date.now();
      this.emit(`unapprovedMessage`, {
        messageId,
        event,
      });

      this.on('unapprovedMessage::approved', (params) => {
        resolve(params);
      });
      this.on('unapprovedMessage::rejected', (params) => {
        reject(params);
      });
    });
}
