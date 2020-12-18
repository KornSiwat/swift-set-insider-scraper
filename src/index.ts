import express from "express"
import "reflect-metadata"
import { createConnection } from "typeorm"
import { SETInsiderScraperApplication } from "./SETInsiderScraperApplication"
import { createRouter } from "./router"
import { stockSymbols } from "./stockSymbols"
import cors from "cors"
import { getConnectionOptions, ConnectionOptions } from "typeorm"
import dotenv from "dotenv"

dotenv.config()

async function getOptions(): Promise<ConnectionOptions> {
  let connectionOptions: ConnectionOptions
  connectionOptions = {
    type: "postgres",
    synchronize: true,
    logging: false,
    entities: ["dist/entity/*.*"],
  }

  if (process.env.DATABASE_URL) {
    Object.assign(connectionOptions, { url: process.env.DATABASE_URL })
  } else {
    // gets your default configuration
    // you could get a specific config by name getConnectionOptions('production')
    // or getConnectionOptions(process.env.NODE_ENV)
    connectionOptions = await getConnectionOptions()
  }

  return connectionOptions
}

async function main() {
  createConnection(await getOptions())
    .then((_) => {
      const app = express()
      const port = 3000
      const onGoingScrapeLimitCount = 5

      const setInsiderScraperApplication = new SETInsiderScraperApplication(
        stockSymbols,
        onGoingScrapeLimitCount
      )
      const router = createRouter(setInsiderScraperApplication)

      app.use(cors())
      app.use(express.json())
      app.use(router)

      app.listen(port, () =>
        console.log(`SET Insider Scraper Application is on port ${port}!`)
      )
    })
    .catch((error) => console.log(`fail to connect db due to + ${error}`))
}

main()
