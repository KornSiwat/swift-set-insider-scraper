import { Entity } from "typeorm"
import { PrimaryGeneratedColumn } from "typeorm"
import { ManyToOne } from "typeorm"
import { Column } from "typeorm"
import { Stock } from "./Stock"

@Entity("prices")
class Price {
  @PrimaryGeneratedColumn("increment")
  readonly id: number

  @ManyToOne(() => Stock, (stock) => stock.prices)
  readonly stock: Stock

  @Column()
  readonly date: string

  @Column({ type: "float" })
  readonly openPrice: number

  @Column({ type: "float" })
  readonly closePrice: number

  @Column({ type: "float" })
  readonly highestPrice: number

  @Column({ type: "float" })
  readonly lowestPrice: number

  @Column({ type: "float" })
  readonly changeInValue: number

  @Column({ type: "float" })
  readonly changeInPercentage: number

  @Column({ type: "float" })
  readonly totalVolume: number

  @Column({ type: "float" })
  readonly totalValue: number

  constructor(
    stock: Stock,
    date: string,
    openPrice: number,
    closePrice: number,
    highestPrice: number,
    lowestPrice: number,
    changeInValue: number,
    changeInPercentage: number,
    totalVolume: number,
    totalValue: number
  ) {
    this.stock = stock
    this.date = date
    this.openPrice = openPrice
    this.closePrice = closePrice
    this.highestPrice = highestPrice
    this.lowestPrice = lowestPrice
    this.changeInValue = changeInValue
    this.changeInPercentage = changeInPercentage
    this.totalVolume = totalVolume
    this.totalValue = totalValue
  }
}

export { Price }
