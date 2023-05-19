import { Record } from "pocketbase";

export interface Token extends Record {
  revoked: boolean;
  expires: string;
}
