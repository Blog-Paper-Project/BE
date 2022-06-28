namespace Types {
  export interface Paper {
    postId: number;
    title: string;
    contents: string;
    category: string[];
    createdAt: Date;
    updatedAt: Date;
    UserId: number;
    Likes: {
      UserId: number;
      PaperId: number;
      createdAt: Date;
      updatedAt: Date;
    }[];
  }

  export interface LikesCount {
    id: number;
    title: string;
    likes: number;
  }

  export interface CustomError extends Error {
    status: number;
    success: boolean;
  }
}
