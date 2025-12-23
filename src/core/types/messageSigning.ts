import { TypedDataDefinition } from 'viem';

// Personal sign message - always string
export type PersonalSignMessage = {
  type: 'personal_sign';
  message: string;
};

// Typed data message - always object with viem TypedDataDefinition structure
export type TypedDataMessage<
  TTypedData extends TypedDataDefinition = TypedDataDefinition,
> = {
  type: 'sign_typed_data';
  data: TTypedData;
};

// Discriminated union for all message types
export type SigningMessage<
  TTypedData extends TypedDataDefinition = TypedDataDefinition,
> = PersonalSignMessage | TypedDataMessage<TTypedData>;

// Type guards
export const isPersonalSignMessage = (
  msg: SigningMessage,
): msg is PersonalSignMessage => msg.type === 'personal_sign';

export const isTypedDataMessage = (
  msg: SigningMessage,
): msg is TypedDataMessage => msg.type === 'sign_typed_data';

// Helper to extract message content
export const getMessageContent = (msg: SigningMessage): string => {
  return msg.type === 'personal_sign' ? msg.message : JSON.stringify(msg.data);
};
