// types/user.ts
export enum UserRoleEnum {
  INITIATOR = "INITIATOR",
  INSPECTOR = "INSPECTOR",
  ADMIN = "ADMIN",
  UNKNOWN = "UNKNOWN",
  PAYEER = "PAYEER"
}

export interface User {
  id: string;
  tg_username: string;
  chat_id: number;
  roles: UserRoleEnum[];
  relation_id?: string;
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

export interface Order {
  id: string;
  level: number;
  step: number;
  state: OrderStateEnum;
  initiator_id: string;
  description: string;
  reply?: string;
  amount: number;
  currency: OrderCurrencyEnum;
  created_at: string;
  updated_at?: string;
  initiator?: User;
}

export enum OrderStateEnum {
  CREATED = "CREATED",
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  CANCELED = "CANCELED",
  PAID = "PAID"
}

export enum OrderCurrencyEnum {
  RUB = "RUB",
  USD = "USD"
}