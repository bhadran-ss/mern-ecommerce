import bcrypt from "bcryptjs";

export const PASSWORD_HASH_ROUNDS = 12;

let dummyHashPromise;

const getDummyHash = () => {
  dummyHashPromise ??= bcrypt.hash(
    "TimingProtectionOnly1!",
    PASSWORD_HASH_ROUNDS,
  );
  return dummyHashPromise;
};

export const hashPassword = (password) =>
  bcrypt.hash(password, PASSWORD_HASH_ROUNDS);

export const verifyPassword = async (password, passwordHash) => {
  const comparisonHash = passwordHash || (await getDummyHash());
  return bcrypt.compare(password, comparisonHash);
};

