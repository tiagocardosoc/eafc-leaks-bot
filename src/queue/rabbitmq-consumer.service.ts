import rabbitmqConnection from "../configs/rabbitmq"
import type { TelegramMessage } from "../queue/rabbitmq-producer.service"
import * as dotenv from "dotenv"

dotenv.config()

type MessageHandler = (message: TelegramMessage) => Promise<void>

class RabbitMQConsumer {
  private readonly queueName = "telegram-messages"
  private readonly RATE_LIMIT_MS = 1000 // 1 segundo entre mensagens
  private lastProcessedTime = 0

  private async waitForRateLimit(): Promise<void> {
    const now = Date.now()
    const timeSinceLastProcessed = now - this.lastProcessedTime
    const waitTime = Math.max(0, this.RATE_LIMIT_MS - timeSinceLastProcessed)

    if (waitTime > 0) {
      console.log(`⏳ Aguardando ${waitTime}ms para respeitar rate limit...`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }

  getQueueName(): string {
    return this.queueName
  }

  async startConsuming(handler: MessageHandler): Promise<void> {
    try {
      const channel = await rabbitmqConnection.getChannel()

      await channel.assertQueue(this.queueName, {
        durable: true
      })

      channel.prefetch(1)

      console.log(`🎧 Aguardando mensagens na fila: ${this.queueName}`)
      console.log(`⏱️  Rate limit: ${this.RATE_LIMIT_MS}ms entre mensagens\n`)

      channel.consume(
        this.queueName,
        async msg => {
          if (!msg) return

          try {
            await this.waitForRateLimit()

            const content = msg.content.toString()
            const message: TelegramMessage = JSON.parse(content)

            await handler(message)

            channel.ack(msg)
            this.lastProcessedTime = Date.now()
          } catch (error) {
            channel.nack(msg, false, true)
          }
        },
        {
          noAck: false
        }
      )
    } catch (error) {
      console.error("❌ Erro ao iniciar consumer:", error)
      throw error
    }
  }
}

export default new RabbitMQConsumer()
