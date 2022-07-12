declare namespace Types {
  interface CustomError extends Error {
    status: number;
    success: boolean;
  }

  interface MulterFile {
    file?: {
      transforms?: { key?: string }[];
    };
  }
}
