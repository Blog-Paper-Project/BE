declare namespace DTO {
  interface PaperLike extends Models.Paper {
    Likes: Models.Like[];
    Users: Models.User;
  }

  interface PaperByLike {
    postId: number;
    blogId: string;
    nickname: string;
    title: string;
    contents: string;
    thumbnail: string;
    likes: number;
  }

  interface PaperTag extends Models.Paper {
    Tags: Models.Tag[];
  }

  interface UserInfo extends Models.User {
    Papers: PaperTag[];
  }

  interface FolloweePaper extends Models.Subscription {
    Papers: Models.Paper[];
  }

  interface MyFeed extends Models.User {
    Followees: FolloweePaper[];
  }
}
