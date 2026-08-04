export type Book = {
  id: string;
  title: string;
  author: string;
  cover: string;
  score: number;
  status: string;
  chapter: string;
  unread: number;
  tags: string[];
  description: string;
};
export type Route =
  | "home"
  | "shorts"
  | "category"
  | "search"
  | "ai"
  | "benefits"
  | "shelf"
  | "filter"
  | "profile"
  | "history"
  | "user"
  | "detail"
  | "reader";
export type Filters = {
  type: string[];
  progress: string[];
  status: string[];
  subject: string[];
};
