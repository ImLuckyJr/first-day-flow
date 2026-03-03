import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Loan } from './loan.model';
import { LoansService } from './loans.service';
import { LoansController } from './loans.controller';
import { Investment } from '../investments/investment.model';
import { PaymentScheduleInvestor } from '../payment_schedule_investors/payment-schedule-investor.model';
import { PaymentScheduleLoan } from '../payment_schedule_loans/payment-schedule-loan.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Loan,
      Investment,
      PaymentScheduleInvestor,
      PaymentScheduleLoan,
    ]),
  ],
  controllers: [LoansController],
  providers: [LoansService],
})
export class LoansModule {}
