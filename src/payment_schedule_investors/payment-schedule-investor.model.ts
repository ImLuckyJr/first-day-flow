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
  tableName: 'payment_schedule_investors',
  timestamps: false,
})
export class PaymentScheduleInvestor extends Model<PaymentScheduleInvestor> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  psi_id: number;

  @ForeignKey(() => Loan)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  loan_id: string;

  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  investor_id: string;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
  })
  psi_date_pay: Date;

  @Column({
    type: DataType.DECIMAL(30, 2),
    allowNull: true,
  })
  psi_amount: number;

  @Column({
    type: DataType.DECIMAL(30, 2),
    allowNull: true,
  })
  psi_income: number;

  @Column({
    type: DataType.DECIMAL(30, 2),
    allowNull: true,
  })
  psi_income_strategy: number;

  @BelongsTo(() => Loan)
  loan: Loan;
}
