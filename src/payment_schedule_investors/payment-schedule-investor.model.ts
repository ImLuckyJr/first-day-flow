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

export interface PaymentScheduleInvestorAttributes {
  psi_id: number;
  loan_id: string | null;
  investor_id: string | null;
  psi_date_pay: Date | null;
  psi_amount: number | string | null;
  psi_income: number | string | null;
  psi_income_strategy: number | string | null;
}

export type PaymentScheduleInvestorCreationAttributes = Optional<
  PaymentScheduleInvestorAttributes,
  | 'psi_id'
  | 'loan_id'
  | 'investor_id'
  | 'psi_date_pay'
  | 'psi_amount'
  | 'psi_income'
  | 'psi_income_strategy'
>;

@Table({
  tableName: 'payment_schedule_investors',
  timestamps: false,
})
export class PaymentScheduleInvestor
  extends Model<
    PaymentScheduleInvestorAttributes,
    PaymentScheduleInvestorCreationAttributes
  >
  implements PaymentScheduleInvestorAttributes
{
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare psi_id: number;

  @ForeignKey(() => Loan)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare loan_id: string | null;

  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare investor_id: string | null;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
  })
  declare psi_date_pay: Date | null;

  @Column({
    type: DataType.DECIMAL(30, 2),
    allowNull: true,
  })
  declare psi_amount: number | string | null;

  @Column({
    type: DataType.DECIMAL(30, 2),
    allowNull: true,
  })
  declare psi_income: number | string | null;

  @Column({
    type: DataType.DECIMAL(30, 2),
    allowNull: true,
  })
  declare psi_income_strategy: number | string | null;

  @BelongsTo(() => Loan)
  declare loan: Loan;
}
