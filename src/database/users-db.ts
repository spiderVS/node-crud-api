import { UserRecord } from "../modules/models/user-record.model";

class UsersDB {
  private _users: UserRecord[];
  constructor() {
    this._users = [];
  }

  get users(): UserRecord[] {
    return this._users;
  }

  add(user: UserRecord): void {
    this._users.push(user);
  }

  update(updatedUser: UserRecord): void {
    const index = this.getIndexById(updatedUser.id);
    this._users.splice(index, 1, updatedUser);
  }

  remove(user: UserRecord) {
    const index = this.getIndexById(user.id);
    this._users.splice(index, 1);
  }

  findUserById(id: string): UserRecord | null {
    return this._users.find((user: UserRecord) => user.id === id) ?? null;
  }

  private getIndexById(id: string): number {
    return this._users.findIndex((user: UserRecord) => user.id === id);
  }
}

export const DB = new UsersDB();
