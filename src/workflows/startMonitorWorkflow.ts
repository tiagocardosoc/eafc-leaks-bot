import { MONITORED_ACCOUNTS, MONITORING_CONFIG } from "src/configs/accounts"
import processTweetsWorkflow from "./processTweetsWorkflow"

class StartMonitorWorkflow {
  private countdownInterval: NodeJS.Timeout | null = null

  private startCountdown(totalSeconds: number) {
    let remainingSeconds = totalSeconds

    if (this.countdownInterval) {
      clearInterval(this.countdownInterval)
    }

    this.countdownInterval = setInterval(() => {
      remainingSeconds -= 60

      if (remainingSeconds <= 0) {
        if (this.countdownInterval) {
          clearInterval(this.countdownInterval)
        }
        return
      }

      const minutes = Math.floor(remainingSeconds / 60)
      console.log(
        `⏳ Próxima verificação em: ${minutes} minuto${
          minutes !== 1 ? "s" : ""
        }\n`
      )
    }, 60000)
  }

  private async buildTimer() {
    console.log("\n🔍 Executando verificação de tweets...")
    console.log(`⏰ Horário: ${new Date().toLocaleString("pt-BR")}\n`)

    await processTweetsWorkflow()

    console.log("\n✅ Tweets processados!")

    const intervalSeconds = MONITORING_CONFIG.intervalSeconds
    const minutes = Math.floor(intervalSeconds / 60)

    console.log(
      `⏳ Próxima verificação em: ${minutes} minuto${
        minutes !== 1 ? "s" : ""
      }\n`
    )

    this.startCountdown(intervalSeconds)
  }

  async execute() {
    console.log("🚀 Iniciando monitoramento de tweets...")
    console.log(`👀 Monitorando ${MONITORED_ACCOUNTS.length} contas:`)
    console.log(
      `⏱️  Intervalo de verificação: ${
        MONITORING_CONFIG.intervalSeconds
      }s (${Math.floor(MONITORING_CONFIG.intervalSeconds / 60)} minutos)`
    )

    await this.buildTimer()

    const intervalMs = MONITORING_CONFIG.intervalSeconds * 1000
    setInterval(() => this.buildTimer(), intervalMs)
  }
}

export default StartMonitorWorkflow
