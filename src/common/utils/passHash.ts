import * as bcrypt from 'bcrypt';

export const passHash = async (password: string) => {
  const saltOrRounds = 10;
  const hash = await bcrypt.hash(password, saltOrRounds);
  return hash;
};

export const compareHash = async (password: string, hash: string) => {
  const compare = await bcrypt.compare(password, hash);
  return compare;
};
