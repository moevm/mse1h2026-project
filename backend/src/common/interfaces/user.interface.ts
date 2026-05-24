export interface UserPayload {
  user: {
    sub: string;
    email: string;
    role: string;
  };
}
