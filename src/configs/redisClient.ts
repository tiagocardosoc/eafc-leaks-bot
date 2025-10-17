import { Redis } from "ioredis"

const redisClient = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT || 6379),
  password: process.env.REDIS_PASSWORD || "",
  lazyConnect: false,
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false
})

redisClient.on("error", (err: any) => {
  console.error("💾 REDIS ERROR:", err && err.message ? err.message : err)
})

redisClient.on("connect", () => {
  console.log(
    "💾 REDIS CONNECTED at",
    `${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
  )
})

export default redisClient
