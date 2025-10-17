import rabbitmqConnection from "../configs/rabbitmq"

export interface TelegramMessage {
  text: string
  image: string
  authorName: string
  timestamp: number
}

class RabbitMQProducer {
  private readonly queueName = "telegram-messages"

  private async ensureQueue(): Promise<void> {
    const channel = await rabbitmqConnection.getChannel()

    await channel.assertQueue(this.queueName, {
      durable: true
    })
  }

  async publishMessage(
    text: string,
    image: string,
    authorName: string
  ): Promise<void> {
    try {
      await this.ensureQueue()

      const channel = await rabbitmqConnection.getChannel()

      const message: TelegramMessage = {
        text,
        image,
        authorName,
        timestamp: Date.now()
      }

      const messageBuffer = Buffer.from(JSON.stringify(message))

      const sent = channel.sendToQueue(this.queueName, messageBuffer, {
        persistent: true
      })

      if (sent) {
        console.log(`📤 Mensagem publicada na fila: ${this.queueName}`)
      } else {
        console.warn(`⚠️ Fila cheia, mensagem bufferizada`)
      }
    } catch (error) {
      console.error("❌ Erro ao publicar mensagem:", error)
      throw error
    }
  }

  async publishBatch(
    messages: Array<{ text: string; image: string; authorName: string }>
  ): Promise<void> {
    await Promise.allSettled(
      messages.map(msg =>
        this.publishMessage(msg.text, msg.image, msg.authorName)
      )
    )
  }

  getQueueName(): string {
    return this.queueName
  }
}

export default new RabbitMQProducer()
