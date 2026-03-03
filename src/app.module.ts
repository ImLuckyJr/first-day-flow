import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoansModule } from './loans/loans.module';
import { Loan } from './loans/loan.model';
import { Investment } from './investments/investment.model';
import { PaymentScheduleInvestor } from './payment_schedule_investors/payment-schedule-investor.model';
import { PaymentScheduleLoan } from './payment_schedule_loans/payment-schedule-loan.model';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      models: [Loan, Investment, PaymentScheduleInvestor, PaymentScheduleLoan],
    }),
    LoansModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
