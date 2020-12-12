import { stockSymbols } from "./stockSymbols"
import { getConnection } from "typeorm"
import { Stock } from "./models/Stock"
import { SETFacade } from "./facades/SETFacade"
import { Price } from "./models/Price"
import { Request, Response } from "express"
import { OfficialNews } from "./models/OfficialNews"
import { News } from "./models/News"

type Symbol = string

class SETInsiderScraperApplication {
  private requestPerTimeLimit: number
  private setFacade: SETFacade
  private onGoingScrape: Promise<void>[]

  constructor(requestPerTimeLimit: number) {
    this.requestPerTimeLimit = requestPerTimeLimit
    this.setFacade = new SETFacade()
    this.onGoingScrape = []
    this.scrapeAllStockPrices = this.scrapeAllStockPrices.bind(this)
    this.scrapeAllStockOfficialNews = this.scrapeAllStockOfficialNews.bind(this)
    this.scrapeAllStockNews = this.scrapeAllStockNews.bind(this)
  }

  public async scrapeAllStockNews(req: Request, res: Response) {
    stockSymbols.forEach((symbol) => {
      this.scrapeStockNews(symbol)
        .then(() => console.log(`News Complete: ${symbol}`))
        .catch((error) => console.log(`News Fail: ${symbol} due to ${error}`))
    })

    res.sendStatus(200)
  }

  public async scrapeStockNews(symbol: Symbol) {
    const stock = await this.getStockBySymbol(symbol)
    const newsDataList = await this.setFacade.getNewsDataListByStockSymbol(
      symbol
    )

    newsDataList.forEach(async (newsData) => {
      const name = newsData.name
      const link = newsData.link
      const date = new Date()

      if (!(await this.isNewsWithLinkAndStockExist(link, stock))) {
        this.onGoingScrape.push(
          this.syncNews(new News(stock, date, name, link))
        )
      }

      if (this.onGoingScrape.length >= this.requestPerTimeLimit) {
        await Promise.all(this.onGoingScrape)

        this.onGoingScrape = []
      }
    })
  }

  public async scrapeAllStockOfficialNews(req: Request, res: Response) {
    stockSymbols.forEach((symbol) => {
      this.scrapeStockOfficialNews(symbol)
        .then(() => console.log(`OffificalNews Complete: ${symbol}`))
        .catch((error) =>
          console.log(`OfficialNews Fail: ${symbol} due to ${error}`)
        )
    })

    res.sendStatus(200)
  }

  public async scrapeStockOfficialNews(symbol: Symbol) {
    const stock = await this.getStockBySymbol(symbol)
    const officialNewsDataList = await this.setFacade.getOfficalNewsDataListByStockSymbol(
      symbol
    )

    officialNewsDataList.forEach(async (officialNews) => {
      const date = officialNews.date.trim()
      const source = officialNews.source
      const name = officialNews.name
      const link = officialNews.link

      if (!(await this.isOfficialNewsWithLinkAndStockExist(link, stock))) {
        this.onGoingScrape.push(
          this.syncOfficialNews(
            new OfficialNews(stock, date, source, name, link)
          )
        )
      }

      if (this.onGoingScrape.length >= this.requestPerTimeLimit) {
        await Promise.all(this.onGoingScrape)

        this.onGoingScrape = []
      }
    })
  }

  public async scrapeAllStockPrices(req: Request, res: Response) {
    stockSymbols.forEach((symbol) => {
      this.scrapeStockPrices(symbol)
        .then(() => console.log(`Price Complete: ${symbol}`))
        .catch((error) => console.log(`Price Fail: ${symbol} due to ${error}`))
    })

    res.sendStatus(200)
  }

  public async scrapeStockPrices(symbol: Symbol) {
    const stock = await this.getStockBySymbol(symbol)
    const priceDataList = await this.setFacade.getStockPriceDataListByStockSymbol(
      symbol
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

      if (!(await this.isPriceWithDateAndStockExist(date, stock))) {
        this.onGoingScrape.push(
          this.syncPrice(
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
        )
      }

      if (this.onGoingScrape.length >= this.requestPerTimeLimit) {
        await Promise.all(this.onGoingScrape)

        this.onGoingScrape = []
      }
    })
  }

  private async getStockBySymbol(symbol: Symbol): Promise<Stock> {
    const connection = getConnection()
    const stockRepository = connection.getRepository(Stock)

    const result: Stock | undefined = await stockRepository.findOne({
      where: { symbol: symbol },
    })

    if (!result) {
      const newStock = new Stock(symbol)
      stockRepository.save(newStock)

      return newStock
    }

    const stock = result

    return stock
  }

  private async isPriceWithDateAndStockExist(
    date: string,
    stock: Stock
  ): Promise<boolean> {
    const connection = getConnection()
    const priceRepository = connection.getRepository(Price)

    return (
      (await priceRepository.findOne({
        where: { date: date, stock: stock },
      })) != undefined
    )
  }

  private async isOfficialNewsWithLinkAndStockExist(
    link: string,
    stock: Stock
  ): Promise<boolean> {
    const connection = getConnection()
    const officialNewsRepository = connection.getRepository(OfficialNews)

    return (
      (await officialNewsRepository.findOne({
        where: { link: link, stock: stock },
      })) != undefined
    )
  }

  private async isNewsWithLinkAndStockExist(
    link: string,
    stock: Stock
  ): Promise<boolean> {
    const connection = getConnection()
    const newsRepository = connection.getRepository(News)

    return (
      (await newsRepository.findOne({
        where: { link: link, stock: stock },
      })) != undefined
    )
  }

  private async syncStock(stock: Stock) {
    const connection = getConnection()
    const stockRepository = connection.getRepository(Stock)

    stockRepository.save(stock)
  }

  private async syncPrice(price: Price) {
    const connection = getConnection()
    const priceRepository = connection.getRepository(Price)

    priceRepository.save(price)
  }

  private async syncOfficialNews(officialNews: OfficialNews) {
    const connection = getConnection()
    const officialNewsRepository = connection.getRepository(OfficialNews)

    officialNewsRepository.save(officialNews)
  }

  private async syncNews(news: News) {
    const connection = getConnection()
    const newsRepository = connection.getRepository(News)

    newsRepository.save(news)
  }
}

export { SETInsiderScraperApplication }
