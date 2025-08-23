// BiDi event types for network interception
export interface RequestData {
  request: string;
  url: string;
  method: string;
  headers?: Array<{ name: string; value: { type: string; value: string } }>;
}

export interface ResponseData {
  headers?: Array<{ name?: string; value?: { value?: string } }>;
  content?: {
    value?: string;
    type?: string;
  };
}

export interface BeforeRequestSentEvent {
  request: RequestData;
}

export interface ResponseCompletedEvent {
  request?: RequestData;
  response?: ResponseData;
}

// Types for BiDi protocol parameters
export interface Header {
  name: string;
  value: { type: string; value: string };
}

export interface BytesValue {
  type: 'string' | 'base64';
  value: string;
}
