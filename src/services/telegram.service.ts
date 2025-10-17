import telegramAPI from "../api/telegram.api"

export default class TelegramService {
  private api: typeof telegramAPI

  constructor() {
    this.api = telegramAPI
  }

  private formatMessage(authorName: string, tweetText: string): string {
    return `🚨 CONTEÚDO NOVO DO ${authorName.toUpperCase()}

  ${tweetText}

⚠️ ATENÇÃO: CUIDADO COM O HYPE DE CARTAS E VERIFIQUE A VERACIDADE DAS INFORMAÇÕES!`
  }

  async sendMessage(text: string, image: string, authorName: string) {
    const formattedMessage = this.formatMessage(authorName, text)

    if (image) {
      const response = await this.api.post("/sendPhoto", {
        chat_id: process.env.TELEGRAM_CHAT_ID,
        photo: image,
        caption: formattedMessage
      })
      return response.data
    } else {
      const response = await this.api.post("/sendMessage", {
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: formattedMessage
      })
      return response.data
    }
  }
}
