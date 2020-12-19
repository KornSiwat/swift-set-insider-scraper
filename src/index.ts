import express from "express"
import "reflect-metadata"
import {
  Connection,
  createConnection,
  getConnectionOptions,
  ConnectionOptions,
} from "typeorm"
import { SETInsiderScraperApplication } from "./SETInsiderScraperApplication"
import { createRouter } from "./router"
import { SET50Symbols } from "./stockSymbols"
import cors from "cors"
import dotenv from "dotenv"

dotenv.config()

async function getDatabaseConnectionOptions(): Promise<ConnectionOptions> {
  let connectionOptions: ConnectionOptions
  connectionOptions = {
    type: "postgres",
    synchronize: true,
    logging: false,
    entities: ["dist/models/*.js"],
    migrations: ["dist/migration/**/*.js"],
    subscribers: ["dist/subscriber/**/*.js"],
  }

  const isDatabaseURLExistInENV = process.env.DATABASE_URL !== undefined

  if (isDatabaseURLExistInENV) {
    Object.assign(connectionOptions, { url: process.env.DATABASE_URL })
  } else {
    connectionOptions = await getConnectionOptions()
  }

  return connectionOptions
}

async function connectToDatabase(
  databaseConnectionOptions: ConnectionOptions
): Promise<Connection> {
  return createConnection(databaseConnectionOptions)
}

async function setupDatabase(connection: Connection) {
  await connection.synchronize()
}

async function startServer() {
  const app = express()
  const port = process.env.PORT || 3000
  const onGoingScrapeLimitCount = 5

  // SET50Symbols is used because free tier database hava small limit size so set50 is enough for demonstration
  const setInsiderScraperApplication = new SETInsiderScraperApplication(
    SET50Symbols,
    onGoingScrapeLimitCount
  )
  const router = createRouter(setInsiderScraperApplication)

  app.use(cors())
  app.use(express.json())
  app.use(router)

  app.listen(port, () =>
    console.log(`SET Insider Scraper Application is on port ${port}!`)
  )
}

async function main() {
  const databaseConnectionOptions = await getDatabaseConnectionOptions()

  try {
    const connection = await connectToDatabase(databaseConnectionOptions)

    await setupDatabase(connection)
  } catch (error) {
    console.log(`fail to connect db due to + ${error}`)
  }

  await startServer()
}

main()
