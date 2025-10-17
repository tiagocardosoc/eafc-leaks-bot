import telegramRabbitmqService from "src/queue/telegram-rabbitmq.service"

async function startConsumerWorkflow(): Promise<void> {
  console.log("👷 Iniciando worker do Telegram...\n")
  console.log("=".repeat(60))
  console.log("🎯 WORKER - Processador de Mensagens do Telegram")
  console.log("=".repeat(60))
  console.log("📋 Funções:")
  console.log("   1. Escuta fila RabbitMQ")
  console.log("   2. Processa mensagens sequencialmente")
  console.log("   3. Rate limiting: 1 segundo entre envios")
  console.log("   4. Confirma processamento (ACK)")
  console.log("=".repeat(60) + "\n")

  try {
    await telegramRabbitmqService.startConsumer()

    console.log("✅ Worker iniciado com sucesso!")
    console.log("💡 Pressione Ctrl+C para encerrar\n")
  } catch (error) {
    console.error("❌ Erro ao iniciar worker:", error)
    throw error
  }
}

export default startConsumerWorkflow
