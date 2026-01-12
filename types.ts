
export interface SalaryBreakdown {
  year: number;
  fixedIncrease: number;
  variableIncrease: number;
  totalPercentage: number;
  annualTotal: number;
  monthlyTotal: number;
  differenceAnnual: number;
  differenceMonthly: number;
}

export interface CalculationInputs {
  baseMonthlySalary2025: number;
  numPayments: 12 | 14;
  includeVariable2026: boolean;
}
