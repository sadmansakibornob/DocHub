
export type ArticleStatus = "draft" | "review" | "published";

export interface Article {
  id: number;
  title: string;
  content: string;
  category_id: number | null;
  author_id: string;
  author_name: string | null;
  status: ArticleStatus;
  created_at: string | null;
  updated_at: string | null;
}

export interface ArticleCreate {
  title: string;
  content: string;
  category_id: number | null;
}

export interface ArticleUpdate {
  title?: string;
  content?: string;
  category_id?: number | null;
  status?: ArticleStatus;
}
