import { Entity } from "typeorm"
import { PrimaryGeneratedColumn } from "typeorm"
import { ManyToOne } from "typeorm"
import { Column } from "typeorm"
import { Stock } from "./Stock"

@Entity("socialmedia-news")
class SocialMediaNews {
  @PrimaryGeneratedColumn("increment")
  readonly id: number

  @ManyToOne(() => Stock, (stock) => stock.socialMediaNews)
  readonly stock: Stock

  @Column({ type: "date" })
  readonly date: Date

  @Column()
  readonly name: string

  @Column()
  readonly link: string

  constructor(stock: Stock, date: Date, name: string, link: string) {
    this.stock = stock
    this.date = date
    this.name = name
    this.link = link
  }
}

export { SocialMediaNews }
