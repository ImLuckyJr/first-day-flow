import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import type { Optional } from 'sequelize';
import { Loan } from '../loans/loan.model';

export interface PaymentScheduleLoanAttributes {
  ps_id: number;
  loan_id: string | null;
  ps_date_pay: Date | null;
  ps_amount: number | string | null;
  ps_income: number | string | null;
}

export type PaymentScheduleLoanCreationAttributes = Optional<
  PaymentScheduleLoanAttributes,
  'ps_id' | 'loan_id' | 'ps_date_pay' | 'ps_amount' | 'ps_income'
>;

@Table({
  tableName: 'payment_schedule_loan',
  timestamps: false,
})
export class PaymentScheduleLoan
  extends Model<PaymentScheduleLoanAttributes, PaymentScheduleLoanCreationAttributes>
  implements PaymentScheduleLoanAttributes
{
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare ps_id: number;

  @ForeignKey(() => Loan)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare loan_id: string | null;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
  })
  declare ps_date_pay: Date | null;

  @Column({
    type: DataType.DECIMAL(30, 2),
    allowNull: true,
  })
  declare ps_amount: number | string | null;

  @Column({
    type: DataType.DECIMAL(30, 2),
    allowNull: true,
  })
  declare ps_income: number | string | null;

  @BelongsTo(() => Loan)
  declare loan: Loan;
}
