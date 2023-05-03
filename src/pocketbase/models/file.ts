import { Record } from "pocketbase";

export interface File extends Record {
  name: string;
  description: string;
  file: string;
  author: string;
  type: string;
}
