import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize';

import { Loan } from './loan.model';
import { Investment } from '../investments/investment.model';
import { PaymentScheduleLoan } from '../payment_schedule_loans/payment-schedule-loan.model';
import { PaymentScheduleInvestor } from '../payment_schedule_investors/payment-schedule-investor.model';

import { calcDecimalToFixed2, calcDiv, calcDivToFixed2, calcMin, calcMul, calcPlus } from '@helpers/calculations';
import Decimal from 'decimal.js';

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
    
    async makeLoanIssued(loanId: string): Promise<{ status: boolean, message: string }> {
        const result = {
            status:  false,
            message: 'error',
        };
        
        try {
            const loan = await this.get(loanId);
            
            if (!loan) {
                result.message = 'loan not found';
                return result;
            }
            
            console.log('loan');
            
            const loanSum = loan.get('loan_sum');
            const loanPayPeriod = loan.get('loan_pay_period');
            const loanDays = loan.get('loan_days');
            const loanIssueDate = loan.get('loan_issue_date');
            
            // TODO: проверять значения, раз назначаются вручную через базу
            
            const dayAfterIssue = new Date();
            dayAfterIssue.setDate(loanIssueDate.getDate() + 1);
            let loanRate = loan.get('loan_rate');
            
            // вдруг в базу записана ставка в обычных %
            if (loanRate > 1) {
                loanRate = +calcDiv(loanRate, 100);
            }
            
            // сколько в какой период вернется по займу (тело и %)
            const psLoanSums = {};
            
            // сколько периодов возврата
            const timesCount = Math.ceil(loanDays / loanPayPeriod);
            
            // сколько останется дней в последнем периоде возврата
            const daysLeft = loanDays % loanPayPeriod;
            
            // сколько тело займа возвращается в период
            // const loanSumPart = parseFloat((Math.round(loanSum) / timesCount).toFixed(2));
            const loanSumPart = calcDivToFixed2(loanSum, timesCount);
            
            // Сколько тела займа будет выплачено за все периоды без последнего
            const loanSumPartAllPeriods = calcMul(loanSumPart, timesCount);
            
            // сколько тело займа останется на последний период (разница из-за делений на периоды)
            // const loanSumPartLeft = parseFloat((loanSum - loanSumPart * timesCount).toFixed(2));
            const loanSumPartLeft = calcDecimalToFixed2(calcMin(loanSum, loanSumPartAllPeriods));
            
            console.log('loanSum', loanSum);
            console.log('timesCount', timesCount);
            console.log('daysLeft', daysLeft);
            console.log('loanSumPart', loanSumPart);
            console.log('loanSumPartLeft', loanSumPartLeft);
            
            const allInvestments = await this.findSummaryInvestmentsByLoanId(loanId);
            
            if (allInvestments.length === 0) {
                result.message = 'investments of loan not found';
                return result;
            }
            
            for (const invest of allInvestments) {
                // console.log(invest.get('investor_id'));
                // console.log(invest.get('total_amount'));
                
                const investorTotalAmount = invest.get('total_amount');
                const investmentStrategy = invest.get('investment_strategy');
                console.log('investorTotalAmount', investorTotalAmount);
                
                // С какой даты для инвестора начинается начисление (это дата выдачи + 1 день, потом по каждому периоду идет добавление дней периода)
                const psiDate = new Date(dayAfterIssue.getTime());
                
                // сколько тело займа возвращается в период
                // const investorLoanPart = parseFloat((Math.round(investorTotalAmount) / timesCount).toFixed(2));
                const investorLoanPart = calcDivToFixed2(investorTotalAmount, timesCount);
                
                // Сколько тела займа будет выплачено за все периоды без последнего
                const investorLoanPartAllPeriods = calcMul(investorLoanPart, timesCount);
                
                // сколько тело займа останется на последний период (разница из-за делений на периоды)
                // const loanSumPartLeft = parseFloat((investorTotalAmount - investorLoanPart * timesCount).toFixed(2));
                const investorLoanPartLeft = calcDecimalToFixed2(calcMin(investorTotalAmount, investorLoanPartAllPeriods));
                
                // график для инвестора
                for (let period = 0; period < timesCount; period++) {
                    // предыдущая дата платежного периода, до увеличения
                    const previousPsiDate = new Date(psiDate.getTime());
                    
                    // увеличиваем дату периода для инвестора (дата выдачи + след день + размер периода платежей в днях)
                    psiDate.setDate(psiDate.getDate() + loanPayPeriod);
                    
                    // сколько тела займа на период выплаты по инвестору
                    let psi_amount = investorLoanPart;
                    
                    // сколько дохода % на период выплаты по инвестору
                    // let psi_income = (loanRate / 365) * loanPayPeriod * investorTotalAmount;
                    let psi_income: Decimal | string = calcMul(investorTotalAmount, calcMul(loanPayPeriod, calcDiv(loanRate, 365)));
                    psi_income = calcDecimalToFixed2(psi_income);
                    
                    // сколько дохода % по стратегии на период выплаты по инвестору (только если % стратегии больше чем ставка % по займу)
                    let psi_income_strategy = 0;
                    let diffStrategyPercent = calcMin(investmentStrategy, loanRate);
                    
                    if (investmentStrategy > loanRate) {
                        // psi_income_strategy = ((investmentStrategy - loanRate) / 365) * loanPayPeriod * investorTotalAmount;
                        psi_income_strategy = +calcMul(investorTotalAmount, calcMul(loanPayPeriod, calcDiv(diffStrategyPercent, 365)));
                    }
                    
                    if (period + 1 === timesCount) {
                        // в последний месяц закидываем в тело займа то, что остается (сумма за период + остаток)
                        psi_amount = calcPlus(psi_amount, investorLoanPartLeft).toString();
                        
                        // устанавливаем так: дата предыдущего периода + остаток дней
                        psiDate.setDate(previousPsiDate.getDate() + daysLeft);
                        
                        // т.к. последний период может по дням отличаться от других, то и расчет % может отличаться
                        psi_income = calcMul(investorTotalAmount, calcMul(daysLeft, calcDiv(loanRate, 365)));
                        psi_income = calcDecimalToFixed2(psi_income);
                        
                        if (psi_income_strategy > 0) {
                            // комиссия стратегии была посчитана, и для последнего периода также надо пересчитать, в зависимости от кол-ва дней в последнем периоде
                            psi_income_strategy = +calcMul(investorTotalAmount, calcMul(loanRate, calcDiv(diffStrategyPercent, 365)));
                        }
                    }
                    
                    console.log('psiDate', psiDate);
                    console.log('psi_amount', psi_amount);
                    console.log('psi_income', psi_income);
                    
                    await this.paymentScheduleInvestorModel.create({
                        loan_id:             loanId,
                        investor_id:         invest.get('investor_id'),
                        psi_date_pay:        psiDate,
                        psi_amount:          psi_amount,
                        psi_income:          psi_income,
                        psi_income_strategy: psi_income_strategy,
                    });
                    
                    if (!psLoanSums[period]) {
                        psLoanSums[period] = { amount: 0, income: 0, date: new Date(psiDate.getTime()) };
                    }
                    
                    psLoanSums[period].income = calcPlus(psLoanSums[period].income, psi_income);
                    psLoanSums[period].amount = calcPlus(psLoanSums[period].amount, psi_amount);
                }
                // break;
            }
            
            // Создаем запись по графику для займа
            
            // график для займа (делается от инвесторов)
            for (let period = 0; period < timesCount; period++) {
                await this.paymentScheduleLoanModel.create({
                    loan_id:     loanId,
                    ps_date_pay: psLoanSums[period].date,
                    ps_amount:   psLoanSums[period].amount,
                    ps_income:   psLoanSums[period].income,
                });
            }
            
            result.status = true;
        }
        catch (err) {
            console.error(err.message, err.stack);
        }
        finally {
        
        }
        
        return result;
    }
    
    async getSchedule(loanId: string): Promise<{ status: boolean }> {
        const result = {
            status: false,
        };
        //
        // // try {
        // //     await this.sequelize.transaction(async t => {
        //
        // const loan = await this.get(loanId);
        // console.log('loan');
        // console.log(loan?.get('loan_sum'));
        //
        // const loanSum = loan?.get('loan_sum');
        // const loanRate = loan?.get('loan_rate');
        // const loanPayPeriod = loan?.get('loan_pay_period');
        // const loanDays = loan?.get('loan_days');
        // const loanIssueDate = loan?.get('loan_issue_date');
        // const dayAfterIssue = new Date();
        // dayAfterIssue.setDate(loanIssueDate.getDate() + 1);
        //
        // const psLoanSums = {}; // сколько в какой период вернется по займу (тело и %)
        //
        // const timesCount = Math.ceil(loanDays / loanPayPeriod); // сколько периодов возврата
        // const daysLeft = loanDays % loanPayPeriod; // сколько останется дней в последнем периоде возврата
        // const loanSumPart = parseFloat((Math.round(loanSum) / timesCount).toFixed(2)); // сколько тело займа возвращается в период
        // const loanSumPartLeft = parseFloat((loanSum - loanSumPart * timesCount).toFixed(2)); // сколько тело займа останется на последний период (разница из-за делений)
        //
        // console.log('loanSum', loanSum);
        // console.log('timesCount', timesCount);
        // console.log('daysLeft', daysLeft);
        // console.log('loanSumPart', loanSumPart);
        // console.log('loanSumPartLeft', loanSumPartLeft);
        //
        // const allInvestments = await this.findSummaryInvestmentsByLoanId(loanId);
        //
        // for (const invest of allInvestments) {
        //     // console.log(invest.get('investor_id'));
        //     // console.log(invest.get('total_amount'));
        //     const investorTotalAmount = invest.get('total_amount');
        //     console.log('investorTotalAmount', investorTotalAmount);
        //
        //     const psiDate = new Date(dayAfterIssue.getTime());
        //     // @ts-ignore
        //     const investorLoanPart = parseFloat((Math.round(investorTotalAmount) / timesCount).toFixed(2)); // сколько тело займа возвращается в период
        //     // @ts-ignore
        //     const loanSumPartLeft = parseFloat((investorTotalAmount - investorLoanPart * timesCount).toFixed(2)); // сколько тело займа останется на последний период (разница из-за делений)
        //
        //     // график для инвестора
        //     for (let period = 0; period < timesCount; period++) {
        //         let psi_amount = investorLoanPart;
        //         // @ts-ignore
        //         let psi_income = (loanRate / 365) * loanPayPeriod * investorTotalAmount;
        //
        //         if (period + 1 === timesCount) {
        //             psi_amount += loanSumPartLeft;
        //             psiDate.setDate(psiDate.getDate() + daysLeft);
        //         }
        //
        //         console.log('psiDate', psiDate);
        //         console.log('psi_amount', psi_amount);
        //         console.log('psi_income', psi_income);
        //
        //         // @ts-ignore
        //         await this.paymentScheduleInvestorModel.create({
        //             loan_id:      loanId,
        //             investor_id:  invest?.get('investor_id'),
        //             psi_date_pay: psiDate,
        //             psi_amount:   psi_amount,
        //             psi_income:   psi_income,
        //         });
        //
        //         // @ts-ignore
        //         if (!psLoanSums[period]) psLoanSums[period] = { amount: 0, income: 0, date: new Date(psiDate.getTime()) };
        //
        //         // @ts-ignore
        //         psiDate.setDate(psiDate.getDate() + loanPayPeriod); // увеличиваем дату периода для инвестора
        //
        //         psLoanSums[period].income += psi_income;
        //         psLoanSums[period].amount += psi_amount;
        //     }
        //     break;
        // }
        //
        // // Создаем запись по графику для займа
        //
        // // график для инвестора
        // for (let period = 0; period < timesCount; period++) {
        //     // @ts-ignore
        //     await this.paymentScheduleLoanModel.create({
        //         loan_id:     loanId,
        //         ps_date_pay: psLoanSums[period].date,
        //         ps_amount:   psLoanSums[period].amount,
        //         ps_income:   psLoanSums[period].income,
        //     });
        // }
        //
        // result.status = true;
        // // });
        // // }
        // // catch(err) {
        // //
        // // }
        //
        return result;
    }
}
