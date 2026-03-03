import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize';
import { Loan } from './loan.model';
import { Investment } from '../investments/investment.model';
import { PaymentScheduleLoan } from '../payment_schedule_loans/payment-schedule-loan.model';
import { PaymentScheduleInvestor } from '../payment_schedule_investors/payment-schedule-investor.model';

@Injectable()
export class LoansService {
    constructor(
        // private sequelize: Sequelize,
        @InjectModel(Loan)
        private readonly loanModel: typeof Loan,
        @InjectModel(Investment)
        private readonly investmentModel: typeof Investment,
        @InjectModel(PaymentScheduleLoan)
        private readonly paymentScheduleLoanModel: typeof PaymentScheduleLoan,
        @InjectModel(PaymentScheduleInvestor)
        private readonly paymentScheduleInvestorModel: typeof PaymentScheduleInvestor,
    ) {
    }
    
    async get(loanId: string): Promise<Loan | null> {
        return this.loanModel.findOne({
            where: {
                loan_id: loanId,
            },
        });
    }
    
    async findSummaryInvestmentsByLoanId(loanId: string): Promise<Investment[]> {
        return this.investmentModel.findAll({
            where:      {
                loan_id: loanId,
            },
            attributes: [
                'investor_id',
                'investment_strategy',
                [
                    Sequelize.fn('SUM', Sequelize.col('investment_amount')),
                    'total_amount',
                ],
            ],
            group:      [ 'investor_id', 'investment_strategy' ],
        });
    }
    
    async findInvestmentsByLoanId(loanId: string): Promise<Investment[]> {
        return this.investmentModel.findAll({
            where: {
                loan_id: loanId,
            },
        });
    }
    
    async makeLoanIssued(loanId: string): Promise<{ status: boolean }> {
        const result = {
            status: false,
        };
        
        const loan = await this.get(loanId);
        console.log('loan');
        console.log(loan?.get('loan_sum'));
        
        const loanSum = loan?.get('loan_sum');
        const loanRate = loan?.get('loan_rate');
        const loanPayPeriod = loan?.get('loan_pay_period');
        const loanDays = loan?.get('loan_days');
        const loanIssueDate = loan?.get('loan_issue_date');
        const dayAfterIssue = new Date();
        // @ts-ignore
        dayAfterIssue.setDate(loanIssueDate.getDate() + 1);
        
        const psLoanSums = {}; // сколько в какой период вернется по займу (тело и %)
        
        // @ts-ignore
        const timesCount = Math.ceil(loanDays / loanPayPeriod); // сколько периодов возврата
        // @ts-ignore
        const daysLeft = loanDays % loanPayPeriod; // сколько останется дней в последнем периоде возврата
        // @ts-ignore
        const loanSumPart = parseFloat((Math.round(loanSum) / timesCount).toFixed(2)); // сколько тело займа возвращается в период
        // @ts-ignore
        const loanSumPartLeft = parseFloat((loanSum - loanSumPart * timesCount).toFixed(2)); // сколько тело займа останется на последний период (разница из-за делений)
        
        console.log('loanSum', loanSum);
        console.log('timesCount', timesCount);
        console.log('daysLeft', daysLeft);
        console.log('loanSumPart', loanSumPart);
        console.log('loanSumPartLeft', loanSumPartLeft);
        
        const allInvestments = await this.findSummaryInvestmentsByLoanId(loanId);
        
        for (const invest of allInvestments) {
            // console.log(invest.get('investor_id'));
            // console.log(invest.get('total_amount'));
            const investorTotalAmount = invest.get('total_amount');
            const investmentStrategy = invest.get('investment_strategy');
            console.log('investorTotalAmount', investorTotalAmount);
            
            const psiDate = new Date(dayAfterIssue.getTime());
            // @ts-ignore
            const investorLoanPart = parseFloat((Math.round(investorTotalAmount) / timesCount).toFixed(2)); // сколько тело займа возвращается в период
            // @ts-ignore
            const loanSumPartLeft = parseFloat((investorTotalAmount - investorLoanPart * timesCount).toFixed(2)); // сколько тело займа останется на последний период (разница из-за делений)
            
            // график для инвестора
            for (let period = 0; period < timesCount; period++) {
                let psi_amount = investorLoanPart;
                // @ts-ignore
                let psi_income = (loanRate / 365) * loanPayPeriod * investorTotalAmount;
                let psi_income_strategy = 0;
                
                // @ts-ignore
                if (investmentStrategy > loanRate) {
                    // @ts-ignore
                    psi_income_strategy = ((investmentStrategy - loanRate) / 365) * loanPayPeriod * investorTotalAmount;
                }
                
                if (period + 1 === timesCount) {
                    psi_amount += loanSumPartLeft;
                    psiDate.setDate(psiDate.getDate() + daysLeft);
                }
                
                console.log('psiDate', psiDate);
                console.log('psi_amount', psi_amount);
                console.log('psi_income', psi_income);
                
                // @ts-ignore
                await this.paymentScheduleInvestorModel.create({
                    loan_id:             loanId,
                    investor_id:         invest?.get('investor_id'),
                    psi_date_pay:        psiDate,
                    psi_amount:          psi_amount,
                    psi_income:          psi_income,
                    psi_income_strategy: psi_income_strategy,
                });
                
                // @ts-ignore
                if (!psLoanSums[period]) psLoanSums[period] = { amount: 0, income: 0, date: new Date(psiDate.getTime()) };
                
                // @ts-ignore
                psiDate.setDate(psiDate.getDate() + loanPayPeriod); // увеличиваем дату периода для инвестора
                
                psLoanSums[period].income += psi_income;
                psLoanSums[period].amount += psi_amount;
            }
            // break;
        }
        
        // Создаем запись по графику для займа
        
        // график для инвестора
        for (let period = 0; period < timesCount; period++) {
            // @ts-ignore
            await this.paymentScheduleLoanModel.create({
                loan_id:     loanId,
                ps_date_pay: psLoanSums[period].date,
                ps_amount:   psLoanSums[period].amount,
                ps_income:   psLoanSums[period].income,
            });
        }
        
        result.status = true;
        
        return result;
    }
    
    async getSchedule(loanId: string): Promise<{ status: boolean }> {
        const result = {
            status: false,
        };
        
        // try {
        //     await this.sequelize.transaction(async t => {
        
        const loan = await this.get(loanId);
        console.log('loan');
        console.log(loan?.get('loan_sum'));
        
        const loanSum = loan?.get('loan_sum');
        const loanRate = loan?.get('loan_rate');
        const loanPayPeriod = loan?.get('loan_pay_period');
        const loanDays = loan?.get('loan_days');
        const loanIssueDate = loan?.get('loan_issue_date');
        const dayAfterIssue = new Date();
        // @ts-ignore
        dayAfterIssue.setDate(loanIssueDate.getDate() + 1);
        
        const psLoanSums = {}; // сколько в какой период вернется по займу (тело и %)
        
        // @ts-ignore
        const timesCount = Math.ceil(loanDays / loanPayPeriod); // сколько периодов возврата
        // @ts-ignore
        const daysLeft = loanDays % loanPayPeriod; // сколько останется дней в последнем периоде возврата
        // @ts-ignore
        const loanSumPart = parseFloat((Math.round(loanSum) / timesCount).toFixed(2)); // сколько тело займа возвращается в период
        // @ts-ignore
        const loanSumPartLeft = parseFloat((loanSum - loanSumPart * timesCount).toFixed(2)); // сколько тело займа останется на последний период (разница из-за делений)
        
        console.log('loanSum', loanSum);
        console.log('timesCount', timesCount);
        console.log('daysLeft', daysLeft);
        console.log('loanSumPart', loanSumPart);
        console.log('loanSumPartLeft', loanSumPartLeft);
        
        const allInvestments = await this.findSummaryInvestmentsByLoanId(loanId);
        
        for (const invest of allInvestments) {
            // console.log(invest.get('investor_id'));
            // console.log(invest.get('total_amount'));
            const investorTotalAmount = invest.get('total_amount');
            console.log('investorTotalAmount', investorTotalAmount);
            
            const psiDate = new Date(dayAfterIssue.getTime());
            // @ts-ignore
            const investorLoanPart = parseFloat((Math.round(investorTotalAmount) / timesCount).toFixed(2)); // сколько тело займа возвращается в период
            // @ts-ignore
            const loanSumPartLeft = parseFloat((investorTotalAmount - investorLoanPart * timesCount).toFixed(2)); // сколько тело займа останется на последний период (разница из-за делений)
            
            // график для инвестора
            for (let period = 0; period < timesCount; period++) {
                let psi_amount = investorLoanPart;
                // @ts-ignore
                let psi_income = (loanRate / 365) * loanPayPeriod * investorTotalAmount;
                
                if (period + 1 === timesCount) {
                    psi_amount += loanSumPartLeft;
                    psiDate.setDate(psiDate.getDate() + daysLeft);
                }
                
                console.log('psiDate', psiDate);
                console.log('psi_amount', psi_amount);
                console.log('psi_income', psi_income);
                
                // @ts-ignore
                await this.paymentScheduleInvestorModel.create({
                    loan_id:      loanId,
                    investor_id:  invest?.get('investor_id'),
                    psi_date_pay: psiDate,
                    psi_amount:   psi_amount,
                    psi_income:   psi_income,
                });
                
                // @ts-ignore
                if (!psLoanSums[period]) psLoanSums[period] = { amount: 0, income: 0, date: new Date(psiDate.getTime()) };
                
                // @ts-ignore
                psiDate.setDate(psiDate.getDate() + loanPayPeriod); // увеличиваем дату периода для инвестора
                
                psLoanSums[period].income += psi_income;
                psLoanSums[period].amount += psi_amount;
            }
            break;
        }
        
        // Создаем запись по графику для займа
        
        // график для инвестора
        for (let period = 0; period < timesCount; period++) {
            // @ts-ignore
            await this.paymentScheduleLoanModel.create({
                loan_id:     loanId,
                ps_date_pay: psLoanSums[period].date,
                ps_amount:   psLoanSums[period].amount,
                ps_income:   psLoanSums[period].income,
            });
        }
        
        result.status = true;
        // });
        // }
        // catch(err) {
        //
        // }
        
        return result;
    }
}
