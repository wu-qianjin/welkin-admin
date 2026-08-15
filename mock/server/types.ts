import type { IncomingMessage, ServerResponse } from 'node:http';

export type MockContext = {
  req: IncomingMessage;
  res: ServerResponse;
  query: URLSearchParams;
  body: any;
  url: URL;
};

export type MockHandler = (context: MockContext) => Promise<void> | void;

export type MockRoute = {
  method: string;
  path: string;
  handler: MockHandler;
};
