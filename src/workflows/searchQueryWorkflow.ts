import { MONITORED_ACCOUNTS } from "src/configs/accounts"

export default function searchQueryWorkflow() {
  const accountsQuery = MONITORED_ACCOUNTS.map(
    account => `from:${account}`
  ).join(" OR ")

  const filters = ["-is:reply", "-is:retweet", "-is:quote"]

  return `(${accountsQuery}) ${filters.join(" ")}`.trim()

  // output is something like this:
  // (from:FutSheriff OR from:FutPoliceLeaks OR from:FUTWIZ OR from:DetectiveFUT OR from:TEDDY127_ OR from:DonkTrading OR from:BPMnerd) -is:reply -is:retweet -is:quote
}
