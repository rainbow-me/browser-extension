import { useEffect, useState } from 'react';

import {
  Approval,
  ApprovalSpender,
} from '~/core/resources/approvals/approvals';

import { RevokeApprovalSheet } from './RevokeApprovalSheet';
import { listenRevokeApproval } from './utils';

export const RevokeApproval = () => {
  const [approvalToRevoke, setApprovalToRevoke] = useState<{
    show?: boolean;
    approval: { approval: Approval; spender: ApprovalSpender } | null;
    callback?: () => void;
  } | null>(null);

  useEffect(() => listenRevokeApproval(setApprovalToRevoke), []);

  return (
    <RevokeApprovalSheet
      show={approvalToRevoke?.show || false}
      approval={approvalToRevoke?.approval?.approval}
      spender={approvalToRevoke?.approval?.spender}
      onCancel={() => setApprovalToRevoke({ show: false, approval: null })}
    />
  );
};
