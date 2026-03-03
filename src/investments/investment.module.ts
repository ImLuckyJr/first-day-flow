import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Investment } from './investment.model';
import { InvestmentService } from './investment.service';

@Module({
  imports: [SequelizeModule.forFeature([Investment])],
  // controllers: [LoansController],
  providers: [InvestmentService],
})
export class LoansModule {}
