import twitterAPI from "src/api/twitter.api"

export default class TwitterService {
  private api: typeof twitterAPI

  constructor() {
    this.api = twitterAPI
  }

  searchRecentTweets(query: string) {
    return this.api.get("/tweets/search/recent", {
      params: {
        query: query,
        max_results: 10,
        expansions: "attachments.media_keys,author_id",
        "media.fields": "url,preview_image_url,type,alt_text",
        "tweet.fields": "created_at,author_id",
        "user.fields": "username,name"
      }
    })
  }
}
