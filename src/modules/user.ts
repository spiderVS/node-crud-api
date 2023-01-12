import { UserRecord } from "./models/user-record.model";
import { UserRequest } from "./models/user-request.model";
import { v4 as uuidv4 } from 'uuid';

export class User implements UserRecord {
  public id: string;
  public username: string;
  public age: number;
  public hobbies: string[];
  constructor({ username, age, hobbies }: UserRequest, id?: string) {
    if (username === undefined || age === undefined || hobbies === undefined) {
      const error = new Error("Request body doesn't contain required fields");
      error.name = 'MISSING_REQ_FIELDS';
      throw error;
    } else {
      this.username = username;
      this.age = age;
      this.hobbies = hobbies;
      this.id = id ? id : this._id;
    }
  }

  get _id() {
    return uuidv4();
  }
}
