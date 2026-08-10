import { redis } from "../config/redis.js";

const OTP_TTL = 300;
const MAX_ATTEMPTS = 3;

const verifyAndDelete = `
  local key = KEYS[1]
  local input_hash = ARGV[1]
  local max_attempts = tonumber(ARGV[2])

  local stored_hash = redis.call("HGET", key, "otp")
  local attempts = tonumber(redis.call("HGET", key, "attempts")) or 0

  if attempts >= max_attempts then
    redis.call("DEL", key)
    return -1
  end

  if stored_hash == input_hash then
    redis.call("DEL", key)
    return 1
  else
    redis.call("HINCRBY", key, "attempts", 1)
    redis.call("EXPIRE", key, 300)
    return 0
  end
`;

export const saveOtp = async (
  identifier: string,
  hashedOtp: string,
  purpose: "login" | "reset" = "login",
) => {
  const key = `${purpose}_otp:${identifier}`;
  await redis.hset(key, { otp: hashedOtp, attempts: 0 });
  await redis.expire(key, OTP_TTL);
};

export const consumeOtp = async (
  identifier: string,
  hashedOtp: string,
): Promise<boolean> => {
  const key = `login_otp:${identifier}`;

  const result = (await redis.eval(
    verifyAndDelete,
    1,
    key,
    hashedOtp,
    MAX_ATTEMPTS.toString(),
  )) as number;

  if (result === -1) {
    throw new Error("Too many attempts. Please request a new OTP.");
  }

  return result === 1;
};
