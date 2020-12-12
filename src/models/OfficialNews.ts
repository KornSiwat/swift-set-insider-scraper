import { Entity } from "typeorm"
import { PrimaryGeneratedColumn } from "typeorm"
import { ManyToOne } from "typeorm"
import { Column } from "typeorm"
import { Stock } from "./Stock"

@Entity("official_news")
class OfficialNews {
  @PrimaryGeneratedColumn("increment")
  readonly id: number

  @ManyToOne(() => Stock, (stock) => stock.officialNews)
  readonly stock: Stock

  @Column()
  readonly date: string

  @Column()
  readonly source: string

  @Column()
  readonly name: string

  @Column()
  readonly link: string

  constructor(
    stock: Stock,
    date: string,
    source: string,
    name: string,
    link: string
  ) {
    this.stock = stock
    this.date = date
    this.source = source
    this.name = name
    this.link = link
  }
}

export { OfficialNews }
