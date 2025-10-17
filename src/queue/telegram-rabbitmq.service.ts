import * as dotenv from "dotenv"
import rabbitmqProducer from "./rabbitmq-producer.service"
import rabbitmqConsumer from "./rabbitmq-consumer.service"
import type { TelegramMessage } from "./rabbitmq-producer.service"
import TelegramService from "../services/telegram.service"

dotenv.config()

class TelegramRabbitMQService {
  async publishMessage(
    messages: Array<{ text: string; image: string; authorName: string }>
  ): Promise<void> {
    try {
      await rabbitmqProducer.publishBatch(messages)
      console.log("✅ Mensagem adicionada à fila RabbitMQ")
    } catch (error) {
      console.error("❌ Erro ao adicionar mensagem à fila:", error)
      throw error
    }
  }

  async startConsumer(): Promise<void> {
    console.log("🚀 Iniciando consumer do Telegram...\n")

    await rabbitmqConsumer.startConsuming(async (message: TelegramMessage) => {
      await new TelegramService().sendMessage(
        message.text,
        message.image,
        message.authorName
      )
    })
  }
}

export default new TelegramRabbitMQService()
