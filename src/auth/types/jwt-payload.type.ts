export type JwtPayload = {
  sub: string; // geralmente o id do usuário
  email: string;
  role: string;
};
