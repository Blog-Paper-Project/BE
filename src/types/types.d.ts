declare namespace Types {
  interface CustomError extends Error {
    status: number;
    result: boolean;
  }

  interface MulterFile {
    file?: {
      transforms?: { key?: string }[];
    };
  }
}
