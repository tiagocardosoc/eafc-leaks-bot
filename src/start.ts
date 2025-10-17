import * as dotenv from "dotenv"
import rabbitmq from "./configs/rabbitmq"
import StartMonitorWorkflow from "./workflows/startMonitorWorkflow"
import startConsumerWorkflow from "./workflows/startConsumerWorkflow"

dotenv.config()

async function startApplication(): Promise<void> {
  console.log("🚀 Iniciando aplicação EAFC Leaks...\n")
  console.log("=".repeat(60))
  console.log("🎯 Sistema de Monitoramento e Notificação")
  console.log("=".repeat(60))
  console.log("📋 Componentes:")
  console.log("   1. Monitor de Tweets (Producer)")
  console.log("   2. Worker do Telegram (Consumer)")
  console.log("   3. RabbitMQ Message Queue")
  console.log("=".repeat(60) + "\n")

  try {
    await rabbitmq.connect()

    console.log("🔍 Iniciando monitor de tweets...")
    const monitorWorkflow = new StartMonitorWorkflow()
    await monitorWorkflow.execute()

    await new Promise(resolve => setTimeout(resolve, 2000))

    await startConsumerWorkflow()

    console.log("\n✅ Todos os componentes iniciados com sucesso!")
    console.log(
      "💡 O sistema está funcionando. Pressione Ctrl+C para encerrar\n"
    )
  } catch (error) {
    console.error("❌ Erro ao iniciar aplicação:", error)
    await rabbitmq.close()
    process.exit(1)
  }
}

process.on("SIGINT", async () => {
  console.log("\n🛑 Encerrando aplicação...")
  await rabbitmq.close()
  process.exit(0)
})

process.on("SIGTERM", async () => {
  console.log("\n🛑 Encerrando aplicação...")
  await rabbitmq.close()
  process.exit(0)
})

process.on("uncaughtException", async error => {
  console.error("❌ Erro não capturado:", error)
  await rabbitmq.close()
  process.exit(1)
})

process.on("unhandledRejection", async reason => {
  console.error("❌ Promise rejeitada não tratada:", reason)
  await rabbitmq.close()
  process.exit(1)
})

startApplication()
