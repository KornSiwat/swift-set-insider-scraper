import { EntityTarget, getConnection, Repository } from "typeorm"
import { Stock } from "./models/Stock"
import { SETFacade } from "./facades/SETFacade"
import { Price } from "./models/Price"
import { Request, Response } from "express"
import { OfficialNews } from "./models/OfficialNews"
import { SocialMediaNews } from "./models/SocialMediaNews"

type Symbol = string

class SETInsiderScraperApplication {
  private maxOnGoingScrapeCount: number
  private setFacade: SETFacade
  private onGoingScrape: Promise<void>[]
  private stockSymbols: string[]

  constructor(stockSymbols: string[], maxOnGoingScrapeCount: number) {
    this.setFacade = new SETFacade()
    this.maxOnGoingScrapeCount = maxOnGoingScrapeCount
    this.stockSymbols = stockSymbols
    this.onGoingScrape = []
    this.scrapeAllStockPrices = this.scrapeAllStockPrices.bind(this)
    this.scrapeAllStockOfficialNews = this.scrapeAllStockOfficialNews.bind(this)
    this.scrapeAllStockSocialMediaNews = this.scrapeAllStockSocialMediaNews.bind(
      this
    )
  }

  public async scrapeAllStockSocialMediaNews(req: Request, res: Response) {
    this.scrapeAllStock(this.scrapeSocialMediaNews, "Social Media News")

    res.status(200).send("started all stock social media news scrape")
  }

  public async scrapeAllStockOfficialNews(req: Request, res: Response) {
    this.scrapeAllStock(this.scrapeStockOfficialNews, "Official News")

    res.status(200).send("started all stock official news scrape")
  }

  public async scrapeAllStockPrices(req: Request, res: Response) {
    this.scrapeAllStock(this.scrapeStockPrices, "Price")

    res.status(200).send("started all stock prices scrape")
  }

  private async scrapeAllStock(
    scrapeFunction: (stock: Stock) => Promise<void>,
    scrapeDataName: string
  ) {
    this.stockSymbols.forEach(async (symbol) => {
      const stock: Stock = await this.getStockBySymbol(symbol)

      this.waitForScapeQueueToBeAvailable()

      const scrape = scrapeFunction
        .call(this, stock)
        .then(() => console.log(`${scrapeDataName} for ${symbol} Completed`))
        .catch((error) =>
          console.log(`${scrapeDataName} for ${symbol} Error: ${error}`)
        )

      this.addOnGoingScrape(scrape)
    })
  }

  private async scrapeSocialMediaNews(stock: Stock) {
    const newsDataList = await this.setFacade.getSocialMediaNewsDataListByStockSymbol(
      stock.symbol
    )

    newsDataList.forEach(async (newsData) => {
      const name = newsData.name
      const link = newsData.link
      const date = new Date()

      const isStockNewsDataNotAlreadyExist = !(await this.isNewsWithGivenLinkAndStockExist(
        link,
        stock
      ))

      if (isStockNewsDataNotAlreadyExist) {
        await this.syncNews(new SocialMediaNews(stock, date, name, link))
      }
    })
  }

  private async scrapeStockOfficialNews(stock: Stock) {
    const officialNewsDataList = await this.setFacade.getOfficalNewsDataListByStockSymbol(
      stock.symbol
    )
    officialNewsDataList.forEach(async (officialNews) => {
      const date = officialNews.date.trim()
      const source = officialNews.source
      const name = officialNews.name
      const link = officialNews.link

      const isOfficalNewsDataNotAlreadyExist = !(await this.isOfficialNewsWithGivenNameAndLinkAndStockExist(
        name,
        link,
        stock
      ))

      if (isOfficalNewsDataNotAlreadyExist) {
        await this.syncOfficialNews(
          new OfficialNews(stock, date, source, name, link)
        )
      }
    })
  }

  private async scrapeStockPrices(stock: Stock) {
    const priceDataList = await this.setFacade.getStockPriceDataListByStockSymbol(
      stock.symbol
    )

    priceDataList.forEach(async (priceData) => {
      const date = priceData.date.split("/").reverse().join("/")
      const openPrice = parseFloat(priceData.openPrice)
      const closePrice = parseFloat(priceData.closePrice)
      const highestPrice = parseFloat(priceData.highestPrice)
      const lowestPrice = parseFloat(priceData.lowestPrice)
      const changeInValue = parseFloat(priceData.changeInValue)
      const changeInPercentage = parseFloat(priceData.changeInPercentage)
      const totalVolume = parseFloat(priceData.totalVolume)
      const totalValue = parseFloat(priceData.totalValue)

      const isPriceDataNotAlreadyExist = !(await this.isPriceWithDateAndStockExist(
        date,
        stock
      ))

      if (isPriceDataNotAlreadyExist) {
        await this.syncPrice(
          new Price(
            stock,
            date,
            openPrice,
            closePrice,
            highestPrice,
            lowestPrice,
            changeInValue,
            changeInPercentage,
            totalVolume,
            totalValue
          )
        )
      }
    })
  }

  private async addOnGoingScrape(scrape: Promise<void>) {
    this.onGoingScrape.push(scrape)
    this.checkOnGoingScrapeLimit()
  }

  private async checkOnGoingScrapeLimit() {
    const isOnGoingScrapeExceedLimit =
      this.onGoingScrape.length >= this.maxOnGoingScrapeCount

    if (isOnGoingScrapeExceedLimit) {
      this.waitForAllPromiseToResolve()
      this.clearOnGoingScrapeList()
    }
  }

  private waitForScapeQueueToBeAvailable() {
    do {} while (this.onGoingScrape.length > this.maxOnGoingScrapeCount)
  }

  private async waitForAllPromiseToResolve() {
    await Promise.all(this.onGoingScrape)
  }

  private clearOnGoingScrapeList() {
    this.onGoingScrape = []
  }

  private async isPriceWithDateAndStockExist(
    date: string,
    stock: Stock
  ): Promise<boolean> {
    return await this.isDataWithGivenValueExist(
      { date: date, stock: stock },
      Price
    )
  }

  private async isOfficialNewsWithGivenNameAndLinkAndStockExist(
    name: string,
    link: string,
    stock: Stock
  ): Promise<boolean> {
    return await this.isDataWithGivenValueExist(
      { name, link, stock },
      SocialMediaNews
    )
  }

  private async isNewsWithGivenLinkAndStockExist(
    link: string,
    stock: Stock
  ): Promise<boolean> {
    return await this.isDataWithGivenValueExist(
      { link, stock },
      SocialMediaNews
    )
  }

  private async isDataWithGivenValueExist<T>(
    filter: any,
    entity: EntityTarget<T>
  ): Promise<boolean> {
    const repository = this.getRepositoryForEntity(entity)
    const existedData = await repository.find({ where: filter })
    const isDataExist = existedData.length !== 0

    return isDataExist
  }

  private async getStockBySymbol(symbol: Symbol): Promise<Stock> {
    const stock: Stock =
      (await this.getOneData({ symbol: symbol }, Stock)) || new Stock(symbol)

    await this.syncData(stock, Stock)

    return stock
  }

  private async getOneData<T>(
    filter: any,
    entity: EntityTarget<T>
  ): Promise<T | undefined> {
    const repository: Repository<T> = this.getRepositoryForEntity(entity)

    return repository.findOne({ where: filter })
  }

  private async syncStock(stock: Stock) {
    this.syncData(stock, Stock)
  }

  private async syncPrice(price: Price) {
    this.syncData(price, Price)
  }

  private async syncOfficialNews(officialNews: OfficialNews) {
    this.syncData(officialNews, OfficialNews)
  }

  private async syncNews(socialMediaNews: SocialMediaNews) {
    this.syncData(socialMediaNews, SocialMediaNews)
  }

  private async syncData<T>(data: any, entity: EntityTarget<T>) {
    const repository = this.getRepositoryForEntity(entity)

    repository.save(data)
  }

  private getRepositoryForEntity<T>(entity: EntityTarget<T>): Repository<T> {
    const connection = getConnection()
    const repository = connection.getRepository(entity)

    return repository
  }
}

export { SETInsiderScraperApplication }
