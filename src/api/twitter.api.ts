import axios from "axios"
import * as dotenv from "dotenv"

dotenv.config()

const twitterAPI = axios.create({
  baseURL: "https://api.x.com/2",
  headers: { Authorization: `Bearer ${process.env.TWITTER_TOKEN}` }
})

export default twitterAPI
