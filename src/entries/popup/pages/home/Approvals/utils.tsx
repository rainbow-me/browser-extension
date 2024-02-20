import { EventEmitter } from 'eventemitter3';

import {
  Approval,
  ApprovalSpender,
} from '~/core/resources/approvals/approvals';

const eventEmitter = new EventEmitter();

interface RevokeApprovalProps {
  show: boolean;
  approval: {
    approval: Approval;
    spender: ApprovalSpender;
  } | null;
  callback?: () => void;
}

export const listenRevokeApproval = (
  callback: ({ callback, show, approval }: RevokeApprovalProps) => void,
) => {
  eventEmitter.addListener('rainbow_revoke_approval', callback);
  return () => {
    eventEmitter.removeListener('rainbow_revoke_approval', callback);
  };
};

export const triggerRevokeApproval = ({
  show,
  approval,
  callback,
}: RevokeApprovalProps) => {
  eventEmitter.emit('rainbow_revoke_approval', {
    show,
    approval,
    callback,
  });
};
