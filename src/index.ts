import express from "express"
import "reflect-metadata"
import { createConnection } from "typeorm"
import { SETInsiderScraperApplication } from "./SETInsiderScraperApplication"
import { createRouter } from "./router"
import { stockSymbols } from "./stockSymbols"

createConnection()
  .then((_) => {
    const app = express()
    const port = 3000
    const onGoingScrapeLimitCount = 5

    const setInsiderScraperApplication = new SETInsiderScraperApplication(
      stockSymbols,
      onGoingScrapeLimitCount
    )
    const router = createRouter(setInsiderScraperApplication)

    app.use(express.json())
    app.use(router)

    app.listen(port, () =>
      console.log(`SET Insider Scraper Application is on port ${port}!`)
    )
  })
  .catch((error) => console.log(`fail to connect db due to + ${error}`))
