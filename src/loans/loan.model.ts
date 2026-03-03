import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'loans',
  timestamps: false,
})
export class Loan extends Model<Loan> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
  })
  loan_id: string;

  @Column({
    type: DataType.DECIMAL(30, 2),
  })
  loan_sum: number;

  @Column({
    type: DataType.DECIMAL(30, 2),
  })
  loan_rate: number;

  @Column({
    type: DataType.DATE,
  })
  loan_issue_date: Date;

  @Column({
    type: DataType.INTEGER,
  })
  loan_pay_period: number;

  @Column({
    type: DataType.INTEGER,
  })
  loan_days: number;
}
