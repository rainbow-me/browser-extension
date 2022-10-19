import { EventEmitter } from 'eventemitter3';

export class RPCHub extends EventEmitter {
  addUnapprovedMessage = (event: string) => {
    console.log('--- addUnapprovedMessage', event);
    const messageId = Date.now();
    this.emit(`unapprovedMessage`, {
      messageId,
      event,
    });
  };
}
