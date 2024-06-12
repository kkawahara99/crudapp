interface Article {
  id: string;
  title: string;
  contents: string;
  isPublished: boolean;
  createdBy?: string;
  createdAt?: Date;
  updatedBy?: string;
  updatedAt?: Date;
}

export default Article;