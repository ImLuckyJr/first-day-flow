import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { LoansService } from './loans.service';

@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Get(':loan_id/investments')
  findInvestmentsByLoan(
    @Param('loan_id')
    loanId: string,
  ) {
    return this.loansService.findInvestmentsByLoanId(loanId);
  }

  @Post(':loan_id/issue')
  loanIssue(
    @Param('loan_id')
    loanId: string,
  ) {
    return this.loansService.makeLoanIssued(loanId);
  }

  @Post(':loan_id/schedule')
  getSchedule(
    @Param('loan_id')
    loanId: string,
  ) {
    return this.loansService.getSchedule(loanId);
  }
}
