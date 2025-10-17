import amqp, { Channel, ChannelModel } from "amqplib"
import * as dotenv from "dotenv"

dotenv.config()

class RabbitMQConnection {
  private connection: ChannelModel | null = null
  private channel: Channel | null = null
  private readonly url: string

  constructor() {
    const host = process.env.RABBITMQ_HOST || "localhost"
    const port = process.env.RABBITMQ_PORT || "5672"
    const user = process.env.RABBITMQ_USER || "admin"
    const password = process.env.RABBITMQ_PASSWORD || "admin"

    this.url = `amqp://${user}:${password}@${host}:${port}`
  }

  async connect(): Promise<void> {
    try {
      if (this.connection && this.channel) {
        console.log("✅ Já conectado ao RabbitMQ")
        return
      }

      console.log("🔌 Conectando ao RabbitMQ...")

      const connection = await amqp.connect(this.url)
      this.connection = connection

      const channel = await connection.createChannel()
      this.channel = channel

      console.log("✅ Conectado ao RabbitMQ com sucesso!")

      connection.on("error", err => {
        console.error("❌ Erro na conexão RabbitMQ:", err)
      })

      connection.on("close", () => {
        console.log("🔌 Conexão RabbitMQ fechada")
        this.connection = null
        this.channel = null
      })
    } catch (error) {
      console.error("❌ Erro ao conectar no RabbitMQ:", error)
      throw error
    }
  }

  async getChannel(): Promise<Channel> {
    if (!this.channel) {
      await this.connect()
    }
    if (!this.channel) {
      throw new Error("Falha ao criar canal RabbitMQ")
    }
    return this.channel
  }

  async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close()
      }
      if (this.connection) {
        await this.connection.close()
      }
      console.log("✅ Conexão RabbitMQ fechada")
    } catch (error) {
      console.error("❌ Erro ao fechar conexão RabbitMQ:", error)
    }
  }
}

export default new RabbitMQConnection()
