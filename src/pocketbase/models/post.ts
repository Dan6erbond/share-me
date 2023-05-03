import { Record } from "pocketbase";

export interface Post extends Record {
  title: string;
  public: boolean;
  nsfw: boolean;
  files: string[];
  author: string;
}
