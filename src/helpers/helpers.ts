import { HttpErrorMessageObject } from "../models/http-error-message";
import { UserRecord } from "../models/user.model";

export const stringifyBody = (body: HttpErrorMessageObject | UserRecord | UserRecord[] | string): string => {
  return JSON.stringify(body);
}

export const getIdString = (url: string, baseUrl: string): string | null => {
  return url.slice(baseUrl.length) || null;
}

export const findUserById = (users: UserRecord[], id: string): UserRecord | null => {
  return users.find((user: UserRecord) => user.id === id) ?? null;
}
