declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_IS_TEST: string | undefined;
    NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN: string | undefined;
  }
}
