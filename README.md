# Swift SET Insider Scraper

## Members

- Patteera Likitamnuayporn 6110545597
- Siwat Ponpued 6110546640

## Prerequisite

| Name       | version                                                       |
| ---------- | ------------------------------------------------------------- |
| Node       | [10.6.3 or above](https://nodejs.org/en/download/releases/)   |
| Postgresql | [11.10 or above](https://www.postgresql.org/download/macosx/) |

<br/>

## How to run

1. Install all the dependencies

```
npm install
```

2. Config the database information in ormconfig.json  
   <br/>
3. Build

```
npm run-script build
```

4. Start the application

```
npm start
```

## API

- Scrape All Stock Prices

  URL: /scrape-all-stock-prices

  Method: POST

  URL Params: None

  Success:

  - Status Code: 200
  - Content: `started all stock price scrape`

- Scrape All Stock Social Media News

  URL: /scrape-all-stock-prices

  Method: POST

  URL Params: None

  Success:

  - Status Code: 200
  - Content: `started all stock social media news scrape`

- Scrape All Stock Official News

  URL: /scrape-all-stock-official-news/

  Method: POST

  URL Params: None

  Success:

  - Status Code: 200
  - Content: `started all stock official news scrape`
