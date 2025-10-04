/**
 * Pension Calculation Service
 * Provides real-time pension calculations for the dashboard
 */

/**
 * Calculate pension based on dashboard parameters
 * @param {Object} parameters - Dashboard parameters
 * @returns {Object} Calculation results
 */
export const calculatePension = (parameters) => {
  const { basic, salaryTimeline, sickLeave, indexation, zusAccount } = parameters;
  
  // Basic validation
  if (!basic.age || !basic.grossSalary || !basic.startYear || !basic.plannedEndYear) {
    throw new Error('Missing required basic parameters');
  }

  const currentYear = new Date().getFullYear();
  const workingYears = basic.plannedEndYear - basic.startYear;
  const yearsToRetirement = basic.plannedEndYear - currentYear;

  // Calculate salary progression
  const salaryProgression = calculateSalaryProgression(basic, salaryTimeline, indexation);
  
  // Calculate sick leave impact
  const sickLeaveImpact = calculateSickLeaveImpact(sickLeave, basic.gender);
  
  // Calculate ZUS account growth
  const accountGrowth = calculateZUSAccountGrowth(
    salaryProgression, 
    zusAccount, 
    basic.startYear, 
    basic.plannedEndYear
  );

  // Calculate base pension amount
  const basePensionAmount = calculateBasePension(
    salaryProgression,
    workingYears,
    sickLeaveImpact
  );

  // Apply indexation and inflation
  const actualAmountPLN = basePensionAmount;
  const realAmountDeflated = actualAmountPLN * Math.pow(1 - indexation.inflationRate / 100, yearsToRetirement);
  
  // Calculate replacement rate
  const finalSalary = salaryProgression[salaryProgression.length - 1]?.amount || basic.grossSalary;
  const replacementRatePct = (actualAmountPLN / finalSalary) * 100;

  // Calculate vs average pension (mock calculation)
  const averagePensionInRetirementYear = 3200; // Mock average
  const vsAverageInRetirementYearPct = ((actualAmountPLN - averagePensionInRetirementYear) / averagePensionInRetirementYear) * 100;

  // Calculate delay benefits
  const delayBenefits = calculateDelayBenefits(actualAmountPLN);

  return {
    actualAmountPLN: Math.round(actualAmountPLN),
    realAmountDeflated: Math.round(realAmountDeflated),
    replacementRatePct: Math.round(replacementRatePct * 10) / 10,
    vsAverageInRetirementYearPct: Math.round(vsAverageInRetirementYearPct * 10) / 10,
    accountGrowthProjection: accountGrowth,
    salaryProjection: salaryProgression,
    sickLeaveImpact,
    delayBenefits,
    workingYears,
    finalSalary: Math.round(finalSalary),
  };
};

/**
 * Calculate salary progression over time
 */
function calculateSalaryProgression(basic, salaryTimeline, indexation) {
  const progression = [];
  const currentYear = new Date().getFullYear();
  
  for (let year = basic.startYear; year <= basic.plannedEndYear; year++) {
    // Check if user provided custom salary for this year
    const customEntry = salaryTimeline.entries.find(entry => entry.year === year);
    
    let amount;
    if (customEntry && salaryTimeline.useCustomValues) {
      amount = customEntry.amount;
    } else {
      // Calculate indexed salary
      const yearsFromStart = year - basic.startYear;
      const growthRate = indexation.wageGrowthRate / 100;
      amount = basic.grossSalary * Math.pow(1 + growthRate, yearsFromStart);
    }

    progression.push({
      year,
      amount: Math.round(amount),
      isCustom: customEntry && salaryTimeline.useCustomValues,
      isProjected: year > currentYear,
    });
  }

  return progression;
}

/**
 * Calculate sick leave impact on pension
 */
function calculateSickLeaveImpact(sickLeave, gender) {
  if (sickLeave.mode === 'averaged') {
    // Use statistical averages
    const averageDaysPerYear = gender === 'F' ? 8.5 : 6.2; // Mock gender-based averages
    const impactOnContributions = averageDaysPerYear * 0.006; // Rough calculation
    
    return {
      mode: 'averaged',
      averageDaysPerYear,
      totalImpactPercent: Math.round(impactOnContributions * 100 * 10) / 10,
      estimatedPensionReduction: impactOnContributions,
    };
  } else {
    // Calculate based on custom periods
    const totalSickDays = [
      ...sickLeave.historicalPeriods,
      ...sickLeave.projectedPeriods
    ].reduce((total, period) => total + period.daysCount, 0);

    const impactOnContributions = totalSickDays * 0.002; // Rough calculation
    
    return {
      mode: 'custom',
      totalSickDays,
      totalImpactPercent: Math.round(impactOnContributions * 100 * 10) / 10,
      estimatedPensionReduction: impactOnContributions,
    };
  }
}

/**
 * Calculate ZUS account growth over time
 */
function calculateZUSAccountGrowth(salaryProgression, zusAccount, startYear, endYear) {
  const growth = [];
  let currentBalance = zusAccount.currentBalance || 0;
  
  // Contribution rate (simplified)
  const contributionRate = 0.1976; // 19.76% to pension account
  
  for (let year = startYear; year <= endYear; year++) {
    const salaryEntry = salaryProgression.find(s => s.year === year);
    const annualSalary = salaryEntry ? salaryEntry.amount * 12 : 0;
    const annualContribution = annualSalary * contributionRate;
    
    // Add voluntary contributions if any
    const voluntaryContribution = zusAccount.voluntaryContributions
      ?.find(vc => vc.year === year)?.amount || 0;
    
    currentBalance += annualContribution + voluntaryContribution;
    
    // Apply interest/growth (simplified)
    currentBalance *= 1.03; // 3% annual growth
    
    growth.push({
      year,
      balance: Math.round(currentBalance),
      annualContribution: Math.round(annualContribution),
      voluntaryContribution: Math.round(voluntaryContribution),
      totalContribution: Math.round(annualContribution + voluntaryContribution),
    });
  }

  return growth;
}

/**
 * Calculate base pension amount
 */
function calculateBasePension(salaryProgression, workingYears, sickLeaveImpact) {
  // Simplified pension calculation
  const averageSalary = salaryProgression.reduce((sum, entry) => sum + entry.amount, 0) / salaryProgression.length;
  
  // Base calculation: ~45% of average salary for full career
  let basePension = averageSalary * 0.45;
  
  // Adjust for working years (minimum 25 years for full pension)
  if (workingYears < 25) {
    basePension *= (workingYears / 25);
  } else if (workingYears > 35) {
    // Bonus for longer career
    basePension *= (1 + (workingYears - 35) * 0.01);
  }
  
  // Apply sick leave impact
  basePension *= (1 - sickLeaveImpact.estimatedPensionReduction);
  
  return basePension;
}

/**
 * Calculate benefits of delaying retirement
 */
function calculateDelayBenefits(basePension) {
  return {
    oneYear: Math.round(basePension * 1.08),
    twoYears: Math.round(basePension * 1.16),
    fiveYears: Math.round(basePension * 1.35),
  };
}

/**
 * Debounced calculation function for real-time updates
 */
let calculationTimeout;

export const calculatePensionDebounced = (parameters, callback, delay = 300) => {
  clearTimeout(calculationTimeout);
  
  calculationTimeout = setTimeout(() => {
    try {
      const results = calculatePension(parameters);
      callback(null, results);
    } catch (error) {
      callback(error, null);
    }
  }, delay);
};

/**
 * Validate parameters before calculation
 */
export const validateParameters = (parameters) => {
  const errors = {};
  
  // Basic parameters validation
  if (!parameters.basic.age || parameters.basic.age < 16 || parameters.basic.age > 80) {
    errors.age = 'Wiek musi być między 16 a 80 lat';
  }
  
  if (!parameters.basic.grossSalary || parameters.basic.grossSalary <= 0) {
    errors.grossSalary = 'Wynagrodzenie musi być większe od 0';
  }
  
  if (!parameters.basic.startYear || parameters.basic.startYear < 1960) {
    errors.startYear = 'Rok rozpoczęcia pracy nie może być wcześniejszy niż 1960';
  }
  
  if (!parameters.basic.plannedEndYear || parameters.basic.plannedEndYear <= parameters.basic.startYear) {
    errors.plannedEndYear = 'Rok zakończenia pracy musi być późniejszy niż rok rozpoczęcia';
  }
  
  // Indexation validation
  if (parameters.indexation.wageGrowthRate < 0 || parameters.indexation.wageGrowthRate > 20) {
    errors.wageGrowthRate = 'Wzrost płac musi być między 0% a 20%';
  }
  
  if (parameters.indexation.inflationRate < 0 || parameters.indexation.inflationRate > 15) {
    errors.inflationRate = 'Inflacja musi być między 0% a 15%';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export default {
  calculatePension,
  calculatePensionDebounced,
  validateParameters,
};