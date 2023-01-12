import { ErrorMessageObject } from "../modules/models/error-message.model";
import { UserRecord } from "../modules/models/user-record.model";
import { validate as uuidValidate } from 'uuid';
import { BASE_URL } from "../constants/config";
import { IncomingMessage } from "node:http";

export const stringifyBody = (body: ErrorMessageObject | UserRecord | UserRecord[]): string => {
  return JSON.stringify(body);
}

export const parseBody = (request: IncomingMessage): Promise<any> => new Promise((resolve, reject) => {
  let body = '';
  request.setEncoding('utf8');
  request.on('data', chunk => {
    body += chunk;
  });
  request.on('end', () => {
    try {
      const parsed = JSON.parse(body);
      resolve(parsed);
    } catch (error) {
      reject(error);
    }
  });
  request.on('error', (error) => {
    reject(error);
  });
});

const matchUrl = (url: string): RegExpMatchArray | null => {
  const regexp = new RegExp('^' + BASE_URL + '\/([a-z0-9_\\-\\?\\&]+$)');
  return url.match(regexp);
}

export const isBaseUrl = (url: string): boolean => {
  return url === BASE_URL || url === `${BASE_URL}/`;
}
export const isBaseUrlWithId = (url: string): boolean => {
  return !!matchUrl(url);
}


export const isValidUrl = (url: string): boolean => {
  return isBaseUrl(url) || isBaseUrlWithId(url);
}

export const getIdString = (url: string): string => {
  const match = matchUrl(url);
  return match ? match[1] : '';
}

export const isValidId = (id: string): boolean => {
  return uuidValidate(id);
}
