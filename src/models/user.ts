export interface User {
  id: number;
  username: string;
  password?: string;
}

// TODO: Remove hardcoded user for /get-token
export const demoUser: User = {
  id: 1,
  username: "demo"
};

