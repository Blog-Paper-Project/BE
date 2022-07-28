declare namespace Models {
  interface User {
    userId: number;
    blogId: string;
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
    createdAt: string;
    updatedAt: string;
  }

  interface Paper {
    postId: number;
    title: string;
    contents: string;
    thumbnail: string;
    category: string;
    createdAt: string;
    updatedAt: string;
    userId: number;
  }

  interface Like {
    userId: number;
    paperId: number;
    createdAt: string;
    updatedAt: string;
  }

  interface Comment {
    commentId: number;
    text: string;
    createdAt: string;
    updatedAt: string;
    postId: number;
  }

  interface Image {
    imageId: number;
    url: string;
    createdAt: string;
    updatedAt: string;
    postId: number;
  }

  interface Tag {
    tagId: number;
    name: string;
    createdAt: string;
    updatedAt: string;
    postId: number;
  }

  interface Subscription {
    createdAt: string;
    updatedAt: string;
    followeeId: number;
    followerId: number;
  }
}
