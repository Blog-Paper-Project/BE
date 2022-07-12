declare namespace DTO {
  interface PaperLike extends Models.Paper {
    Likes: Models.Like[];
  }

  interface PaperTag extends Models.Paper {
    Tags: Models.Tag[];
  }

  interface UserInfo extends Models.User {
    Papers: PaperTag[];
  }
}
