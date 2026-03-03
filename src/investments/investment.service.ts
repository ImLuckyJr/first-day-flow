import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Investment } from './investment.model';

@Injectable()
export class InvestmentService {
  constructor(
    @InjectModel(Investment)
    private readonly investmentModel: typeof Investment,
  ) {}

  async findAllInvestmentsByLoanId(loanId: string): Promise<Investment[]> {
    return this.investmentModel.findAll({
      where: {
        loan_id: loanId,
      },
    });
  }

  async findSummaryInvestmentsByLoanId(loanId: string): Promise<Investment[]> {
    return this.investmentModel.findAll({
      where: {
        loan_id: loanId,
      },
    });
  }
}
