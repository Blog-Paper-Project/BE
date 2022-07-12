declare namespace Models {
  interface User {
    userId: number;
    email: string;
    nickname: string;
    profileImage: string;
    password: string;
    introduction: string;
    point: number;
    popularity: number;
    snsId: string;
    provider: string;
    emailAuth: number;
    refreshToken: string;
    deletedAt: string;
    createdAt: Date;
    updatedAt: Date;
  }

  interface Paper {
    postId: number;
    title: string;
    contents: string;
    thumbnail: string;
    category: string;
    createdAt: Date;
    updatedAt: Date;
    userId: number;
  }

  interface Like {
    userId: number;
    paperId: number;
    createdAt: Date;
    updatedAt: Date;
  }

  interface Comment {
    commentId: number;
    text: string;
    createdAt: Date;
    updatedAt: Date;
    postId: number;
  }

  interface Image {
    imageId: number;
    url: string;
    createdAt: Date;
    updatedAt: Date;
    postId: number;
  }

  interface Tag {
    tagId: number;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    postId: number;
  }

  interface Subscription {
    createdAt: Date;
    updatedAt: Date;
    followeeId: number;
    followerId: number;
  }
}
