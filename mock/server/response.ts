import type { ServerResponse } from 'node:http';

const SUCCESS = { code: 0, message: 'success' };

export function sendJson(res: ServerResponse, payload: unknown) {
  res.statusCode = 200;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

export function sendData(res: ServerResponse, data: unknown) {
  sendJson(res, { data, ...SUCCESS, detail: null });
}

export function sendError(res: ServerResponse, code: string, message: string) {
  sendJson(res, { data: null, code, message, msg: message, detail: null });
}
