import twitterAPI from "src/api/twitter.api"
import searchQueryWorkflow from "./searchQueryWorkflow"
import { Tweet } from "src/interfaces/tweets"
import RedisService from "src/services/redis.service"
import telegramRabbitmqService from "src/queue/telegram-rabbitmq.service"
import { MONITORING_CONFIG } from "src/configs/accounts"

export default async function processTweetsWorkflow() {
  const redisService = new RedisService()

  try {
    const query = searchQueryWorkflow()

    const response = await twitterAPI.get("/tweets/search/recent", {
      params: {
        query: query,
        max_results: MONITORING_CONFIG.maxResults,
        expansions: "attachments.media_keys,author_id",
        "media.fields": "url,preview_image_url,type,alt_text",
        "tweet.fields": "created_at,author_id",
        "user.fields": "username,name"
      }
    })

    if (!response.data?.data) {
      return
    }

    const tweets = response.data.data.reverse()
    const tweetsToSave: Tweet[] = []

    for (const tweet of tweets) {
      const tweetAuthor = response.data.includes?.users?.find(
        (user: any) => user.id === tweet.author_id
      )

      const mediaKeys = tweet.attachments?.media_keys
      let firstMedia

      if (mediaKeys && response.data.includes?.media) {
        const medias = response.data.includes.media.filter((media: any) =>
          mediaKeys.includes(media.media_key)
        )
        firstMedia = medias[0]
      }

      const tweetObj = {
        tweet_id: String(tweet.id),
        link: `https://twitter.com/${tweetAuthor?.username}/status/${tweet.id}`,
        text: tweet.text,
        author_name:
          tweetAuthor?.name || tweetAuthor?.username || "Usuário Desconhecido",
        media: firstMedia
          ? {
              url: firstMedia.url || firstMedia.preview_image_url,
              altText: firstMedia.alt_text
            }
          : undefined,
        createdAt: tweet.created_at
      } as Tweet

      const redisExists = await redisService.existsTweet(tweetObj.tweet_id)

      if (!redisExists) {
        tweetsToSave.push(tweetObj)
      }
    }

    console.log(
      "✅ Novos Tweets encontrados! Total de itens: ",
      tweetsToSave.length
    )

    if (tweetsToSave.length > 0) {
      // Redis Tweets Saving
      await redisService.saveMultiplesTweets(tweetsToSave)

      // Queue Message Publishing
      const messages = tweetsToSave.map(tweet => ({
        text: tweet.text,
        image: tweet.media?.url ?? "",
        authorName: tweet.author_name
      }))

      await telegramRabbitmqService.publishMessage(messages)

      // Clean Redis old tweets and add new ones
      await redisService.trimToCount(MONITORING_CONFIG.maxResults * 2)
    }
  } catch (error) {
    console.error("❌ Erro ao processar tweets:", error)
    throw error
  }
}
