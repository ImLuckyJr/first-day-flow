import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Loan } from '../loans/loan.model';

@Table({
  tableName: 'investments',
  timestamps: false,
})
export class Investment extends Model<Investment> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
  })
  investment_id: string;

  @Column({
    type: DataType.UUID,
  })
  investor_id: string;

  @Column({
    type: DataType.DECIMAL(30, 2),
  })
  investment_amount: number;

  @Column({
    type: DataType.BOOLEAN,
  })
  investment_state: boolean;

  @Column({
    type: DataType.DECIMAL(30, 2),
    comment: 'SUM по колонке investment_amount с группировкой по investor_id, investment_strategy'
  })
  total_amount: number;

  @Column({
    type: DataType.DECIMAL(5, 2),
  })
  investment_strategy: number;

  @ForeignKey(() => Loan)
  @Column({
    type: DataType.UUID,
  })
  loan_id: string;

  @BelongsTo(() => Loan)
  loan: Loan;
}
