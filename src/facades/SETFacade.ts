import { JSDOM } from "jsdom"
import request from "request-promise"

type URL = string
type HTML = string
type PriceData = { [key: string]: string }
type NewsData = { [key: string]: string }
type OfficialNewsData = { [key: string]: string }
type Symbol = string

class SETFacade {
  public async getStockPriceDataListByStockSymbol(
    symbol: Symbol
  ): Promise<PriceData[]> {
    const url = this.getStockPricePageURL(symbol)
    const html = await this.getPageHTMLByURL(url)
    const dom = new JSDOM(html)
    const priceTable = dom.window.document.getElementsByClassName("table")[0]
    const priceTableBody = priceTable.children[1]
    const priceRows: Array<Element> = Array.from(priceTableBody.children)

    const priceDataList: PriceData[] = priceRows.map((row) => {
      const tableData = row.children

      const priceData: PriceData = {
        date: tableData[0].innerHTML,
        openPrice: tableData[1].innerHTML,
        highestPrice: tableData[2].innerHTML,
        lowestPrice: tableData[3].innerHTML,
        closePrice: tableData[4].innerHTML,
        changeInValue: tableData[5].firstElementChild!.innerHTML,
        changeInPercentage: tableData[6].firstElementChild!.innerHTML,
        totalVolume: tableData[7].innerHTML.replace(",", ""),
        totalValue: tableData[8].innerHTML.replace(",", ""),
      }

      return priceData
    })

    return priceDataList
  }

  public async getSocialMediaNewsDataListByStockSymbol(
    symbol: Symbol
  ): Promise<NewsData[]> {
    const url = this.getStockSocialMediaNewsPageURL(symbol)
    const html = await this.getPageHTMLByURL(url)
    const dom = new JSDOM(html)
    const newsRows = Array.from(
      dom.window.document.querySelectorAll("div.talk-row")
    )

    const newsDataList = newsRows.map((row) => {
      const name = row.querySelector("l")!.innerHTML
      const link = row.parentElement!.getAttribute("href")!

      const newsData: NewsData = {
        name: name,
        link: link,
      }

      return newsData
    })

    return newsDataList
  }

  public async getOfficalNewsDataListByStockSymbol(
    symbol: Symbol
  ): Promise<OfficialNewsData[]> {
    const url = this.getStockOfficialNewsPageURL(symbol)
    const html = await this.getPageHTMLByURL(url)
    const dom = new JSDOM(html)
    const newsRows = Array.from(
      dom.window.document.querySelectorAll("tbody")[1].children
    )

    const newsDataList = newsRows.map((row) => {
      const tableData = row.children

      const newsData: OfficialNewsData = {
        date: tableData[0].innerHTML,
        source: tableData[2].innerHTML,
        name: tableData[3].innerHTML,
        link: tableData[4].firstElementChild!.getAttribute("href")!,
      }

      return newsData
    })

    return newsDataList
  }

  private async getPageHTMLByURL(url: URL): Promise<HTML> {
    return request.get(url)
  }

  private getStockPricePageURL(symbol: Symbol): URL {
    return `https://www.set.or.th/set/historicaltrading.do?symbol=${symbol}&ssoPageId=2&language=th&country=TH`
  }

  private getStockOlderPricePageURL(symbol: Symbol): URL {
    return `https://www.set.or.th/set/historicaltrading.do?symbol=${symbol}&page=1&language=th&country=TH&type=trading`
  }

  private getStockOfficialNewsPageURL(symbol: Symbol): URL {
    return `https://www.set.or.th/set/companynews.do?symbol=${symbol}&ssoPageId=8&language=th&country=TH`
  }

  private getStockSocialMediaNewsPageURL(symbol: Symbol): URL {
    return `https://stock.gapfocus.com/detail/${symbol}`
  }
}

export { SETFacade }
