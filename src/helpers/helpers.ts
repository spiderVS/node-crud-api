import { ErrorMessageObject } from "../modules/models/error-message-object";
import { UserRecord } from "../modules/models/user.model";
import { validate as uuidValidate } from 'uuid';
import { BASE_URL } from "../constants/config";

export const stringifyBody = (body: ErrorMessageObject | UserRecord | UserRecord[]): string => {
  return JSON.stringify(body);
}

const matchUrl = (url: string): RegExpMatchArray | null => {
  const regexp = new RegExp('^' + BASE_URL + '\/([a-z0-9_\\-\\?\\&]+$)');
  console.log('🚀 regexp:', regexp);
  console.log('🚀 url.match(regexp):', url.match(regexp));
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
  console.log('🚀 matchUrl(url):', matchUrl(url));
  const match = matchUrl(url);
  return match ? match[1] : '';
}

export const isValidId = (id: string): boolean => {
  return uuidValidate(id);
}

export const findUserById = (users: UserRecord[], id: string): UserRecord | null => {
  return users.find((user: UserRecord) => user.id === id) ?? null;
}

export const getIndexById = (users: UserRecord[], id: string): number => {
  return users.findIndex((user: UserRecord) => user.id === id);
}
