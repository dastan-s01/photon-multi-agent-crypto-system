declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_API_URL?: string;
      API_URL_SERVER?: string;
      NODE_ENV: 'development' | 'production';
    }
  }
}

// eslint-disable-next-line prettier/prettier
export { };

