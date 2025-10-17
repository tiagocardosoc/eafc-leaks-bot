import axios from "axios"

export const telegramAPI = axios.create({
  baseURL: `${process.env.TELEGRAM_BASE_URL}/bot${process.env.TELEGRAM_TOKEN}`,
  headers: {
    "Content-Type": "application/json"
  }
})

export default telegramAPI
