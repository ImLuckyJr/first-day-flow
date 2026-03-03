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
  tableName: 'payment_schedule_loan',
  timestamps: false,
})
export class PaymentScheduleLoan extends Model<PaymentScheduleLoan> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  ps_id: number;

  @ForeignKey(() => Loan)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  loan_id: string;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
  })
  ps_date_pay: Date;

  @Column({
    type: DataType.DECIMAL(30, 2),
    allowNull: true,
  })
  ps_amount: number;

  @Column({
    type: DataType.DECIMAL(30, 2),
    allowNull: true,
  })
  ps_income: number;

  @BelongsTo(() => Loan)
  loan: Loan;
}
