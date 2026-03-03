const fs = require('node:fs');
const { add } = require('sinful-math');

try {
  const data = fs.readFileSync('investments.json', 'utf-8');
  const jsonData = JSON.parse(data);
  let projects = {};

  for (let inv of jsonData) {
    if (!projects[inv.loanId]) {
      projects[inv.loanId] = { invests: 0, investors: [], totalAmount: 0 };
    }
    
    projects[inv.loanId]['invests'] += 1;
    projects[inv.loanId]['investors'].push(inv);
    projects[inv.loanId]['totalAmount'] = add(projects[inv.loanId]['totalAmount'], inv.investmentAmount);
  }
  
  for (let projectUuid in projects) {
    const project = projects[projectUuid];
    console.log(`INSERT INTO loans(loan_id, loan_sum) VALUES ('${ projectUuid }', ${ project.totalAmount });`);

    for (let investment of project.investors) {
      const state = investment.state === 'confirmed'
      console.log(`INSERT INTO investments(investor_id, investment_amount, investment_state, loan_id, investment_strategy) VALUES ('${ investment.investorId }', ${ investment.investmentAmount }, ${ state }, '${ projectUuid }', ${ investment.investorStrategyRate });`);
    }
  }
} catch (error) {
  console.error('Error reading JSON file:', error);
}
