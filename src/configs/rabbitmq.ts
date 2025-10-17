import amqp, { Channel, ChannelModel } from "amqplib"
import * as dotenv from "dotenv"

dotenv.config()

/**
 * 🐰 RabbitMQ Connection Manager
 *
 * Este serviço gerencia a conexão com o RabbitMQ usando o padrão Singleton.
 * Garante que apenas uma conexão seja criada e reutilizada em toda a aplicação.
 */
class RabbitMQConnection {
  private connection: ChannelModel | null = null
  private channel: Channel | null = null
  private readonly url: string

  constructor() {
    // Monta a URL de conexão do RabbitMQ
    const host = process.env.RABBITMQ_HOST || "localhost"
    const port = process.env.RABBITMQ_PORT || "5672"
    const user = process.env.RABBITMQ_USER || "admin"
    const password = process.env.RABBITMQ_PASSWORD || "admin"

    this.url = `amqp://${user}:${password}@${host}:${port}`
  }

  /**
   * Conecta ao RabbitMQ e cria um canal de comunicação
   *
   * CONCEITO: Canal (Channel)
   * - É como uma "linha telefônica virtual" dentro da conexão
   * - Usamos canais para enviar e receber mensagens
   * - Múltiplos canais podem compartilhar uma conexão
   */
  async connect(): Promise<void> {
    try {
      if (this.connection && this.channel) {
        console.log("✅ Já conectado ao RabbitMQ")
        return
      }

      console.log("🔌 Conectando ao RabbitMQ...")

      // Cria a conexão
      const connection = await amqp.connect(this.url)
      this.connection = connection

      // Cria o canal
      const channel = await connection.createChannel()
      this.channel = channel

      console.log("✅ Conectado ao RabbitMQ com sucesso!")

      // Handlers para reconexão em caso de erro
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

  /**
   * Retorna o canal de comunicação
   * Se não estiver conectado, conecta automaticamente
   */
  async getChannel(): Promise<Channel> {
    if (!this.channel) {
      await this.connect()
    }
    if (!this.channel) {
      throw new Error("Falha ao criar canal RabbitMQ")
    }
    return this.channel
  }

  /**
   * Fecha a conexão com o RabbitMQ
   */
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

// Exporta uma instância única (Singleton)
export default new RabbitMQConnection()
