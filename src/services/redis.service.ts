import { Redis } from "ioredis"
import redisClient from "../configs/redisClient"
import type { Tweet } from "../interfaces/tweets"

export default class RedisService {
  private redis: Redis
  private TWEETS_LIST_KEY = "eafc:tweets"

  constructor() {
    this.redis = redisClient
  }

  async saveSingleTweet(tweet: Tweet) {
    await this.redis.lpush(this.TWEETS_LIST_KEY, JSON.stringify(tweet))
  }

  async saveMultiplesTweets(tweets: Tweet[]): Promise<void> {
    const serializedTweets = tweets.map(tweet => JSON.stringify(tweet))

    await this.redis.lpush(this.TWEETS_LIST_KEY, ...serializedTweets)
  }

  async existsTweet(tweetId: string): Promise<boolean> {
    const items: string[] = await this.redis.lrange(this.TWEETS_LIST_KEY, 0, -1)

    return items.some((tweet: string) => {
      const obj = JSON.parse(tweet) as Tweet
      return obj.tweet_id === tweetId
    })
  }

  async trimToCount(maxCount: number): Promise<void> {
    await this.redis.ltrim(this.TWEETS_LIST_KEY, 0, maxCount - 1)
  }

  async removeOldest(count: number): Promise<void> {
    const listLength = await this.redis.llen(this.TWEETS_LIST_KEY)

    if (listLength <= 0) {
      return
    }

    const keep = Math.max(0, listLength - count)

    if (keep <= 0) {
      await this.redis.del(this.TWEETS_LIST_KEY)
    } else {
      await this.redis.ltrim(this.TWEETS_LIST_KEY, 0, keep - 1)
    }
  }

  async closeRedis(): Promise<void> {
    await this.redis.quit()
  }
}
