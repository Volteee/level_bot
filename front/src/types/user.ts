// types/user.ts
export enum UserRoleEnum {
  INITIATOR = "INITIATOR",
  INSPECTOR = "INSPECTOR",
  UNKNOWN = "UNKNOWN",
  ADMIN = "ADMIN"
}

export interface User {
  id: string;
  tg_username: string;
  role: UserRoleEnum;
  chat_id: number;
}

export interface Relation {
  id?: string;
  initiator_id: string;
  first_inspector_id: string | null;
  second_inspector_id: string | null;
  third_inspector_id: string | null;
  forth_inspector_id: string | null;
  initiator?: User;
  first_inspector?: User;
  second_inspector?: User;
  third_inspector?: User;
  forth_inspector?: User;
}