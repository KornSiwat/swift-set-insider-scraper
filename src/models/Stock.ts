import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm"
import { OfficialNews } from "./OfficialNews"
import { SocialMediaNews } from "./SocialMediaNews"
import { Price } from "./Price"

@Entity("stocks")
class Stock {
  @PrimaryGeneratedColumn("increment")
  readonly id: number

  @Column()
  readonly symbol: string

  @OneToMany(() => Price, (price) => price.stock)
  public prices: Price[]

  @OneToMany(() => OfficialNews, (officialNews) => officialNews.stock)
  public officialNews: Price[]

  @OneToMany(() => SocialMediaNews, (socialMediaNews) => socialMediaNews.stock)
  public socialMediaNews: Price[]

  constructor(symbol: string) {
    this.symbol = symbol
  }
}

export { Stock }
