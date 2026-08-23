import { redis } from "../config/redis.js";

const ONLINE_AGENT_TTL = 60;

export const markAgentOnline = async (agentId: string) => {
  await redis.set(
    `agent:online:${agentId}`,
    Date.now().toString(),
    "EX",
    ONLINE_AGENT_TTL,
  );
};

export const refreshAgentPresence = async (agentId: string) => {
  await redis.expire(`agent:online:${agentId}`, ONLINE_AGENT_TTL);
};

export const markAgentOffline = async (agentId: string) => {
  await redis.del(`agent:online:${agentId}`);
};

export const getOnlineAgentCount = async (): Promise<number> => {
  const keys = await redis.keys("agent:online:*");
  return keys.length;
};
