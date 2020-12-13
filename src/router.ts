import { Router } from "express"
import { SETInsiderScraperApplication } from "./SETInsiderScraperApplication"

function createRouter(
  setInsiderScraperApplication: SETInsiderScraperApplication
) {
  const router = Router()

  router.get("/", (req, res) => res.send("Hello"))

  router.post(
    "/scrape-all-stock-prices",
    setInsiderScraperApplication.scrapeAllStockPrices
  )

  router.post(
    "/scrape-all-stock-official-news",
    setInsiderScraperApplication.scrapeAllStockOfficialNews
  )
  
  router.post(
    "/scrape-all-stock-socialmedia-news",
    setInsiderScraperApplication.scrapeAllStockSocialMediaNews
  )

  return router
}

export { createRouter }
