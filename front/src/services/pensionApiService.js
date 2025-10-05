/**
 * Pension API Service
 * Service layer for pension calculation API calls
 */
import apiClient, { handleApiError } from './apiClient';
import config from '../config/api';

/**
 * Transform frontend form data to API request format
 */
const transformToApiRequest = (formData) => {
  return {
    // Required fields
    age: parseInt(formData.age) || 35,
    sex: formData.gender || 'F',
    grossSalaryPLN: parseFloat(formData.grossSalary) || 0,
    startYear: parseInt(formData.startYear) || 2015,
    plannedEndYear: parseInt(formData.plannedEndYear) || 2055,
    
    // Optional fields
    expectedPensionPLN: formData.expectedPension ? parseFloat(formData.expectedPension) : undefined,
    includeSickLeave: formData.sickLeave?.mode === 'averaged' || false,
    zusAccountFundsPLN: formData.zusAccountBalance ? parseFloat(formData.zusAccountBalance) : undefined,
    postalCode: formData.postalCode || null,
    additionalWorkYears: formData.workAfterRetirement ? parseInt(formData.workAfterRetirement) : undefined,
    additionalSickLeaveDaysPerYear: formData.sickLeave?.customDays ? parseInt(formData.sickLeave.customDays) : undefined,
    contractType: transformContractType(formData.workType),
    
    // Salary timeline changes
    additionalSalaryChanges: transformSalaryChanges(formData.salaryTimeline),
  };
};

/**
 * Transform work type to contract type
 */
const transformContractType = (workType) => {
  const mapping = {
    'employment': 'UMOWA_O_PRACE',
    'mandate': 'UMOWA_ZLECENIE',
    'business': 'B2B',
    'contract': 'UMOWA_O_DZIELO',
  };
  return mapping[workType] || 'EMPLOYMENT_CONTRACT';
};

/**
 * Transform salary timeline to API format
 */
const transformSalaryChanges = (salaryTimeline = []) => {
  return salaryTimeline.map(record => ({
    changeType: record.type === 'salary' ? 'WORK' : 'BREAK',
    startDate: record.startDate ? record.startDate.toISOString() : null,
    endDate: record.endDate ? record.endDate.toISOString() : null,
    salary: record.type === 'salary' && record.grossAmount ? parseFloat(record.grossAmount) : undefined,
  })).filter(change => change.startDate && change.endDate);
};

/**
 * Transform API response to frontend format
 */
const transformApiResponse = (apiResponse) => {
  const result = apiResponse.result || {};
  
  return {
    id: apiResponse.id,
    requestedAt: apiResponse.requestedAt,
    
    // Main results
    actualAmountPLN: result.actualAmountPLN || 0,
    realAmountDeflated: result.realAmountDeflated || 0,
    replacementRatePct: result.replacementRatePct || 0,
    vsAverageInRetirementYearPct: result.vsAverageInRetirementYearPct || 0,
    
    // Additional data
    wageInclSickLeavePLN: result.wageInclSickLeavePLN,
    wageExclSickLeavePLN: result.wageExclSickLeavePLN,
    
    // Expectations
    meetsExpectation: result.meetsExpectation || {
      isMet: false,
      shortfallPLN: null,
      extraYearsRequiredEstimate: null,
    },
    
    // Postponement scenarios
    ifPostponedYears: result.ifPostponedYears || [],
    
    // ZUS account growth projection - transform backend format to frontend format
    accountGrowthProjection: transformZUSAccountData(result.zusAccountFundsByYear || []),
    
    // Generate salary projection (mock for now - could be enhanced)
    salaryProjection: generateSalaryProjection(result),
  };
};

/**
 * Transform ZUS account data from backend format to frontend format
 */
const transformZUSAccountData = (zusAccountFundsByYear) => {
  if (!zusAccountFundsByYear || zusAccountFundsByYear.length === 0) {
    return [];
  }
  
  return zusAccountFundsByYear.map((item, index) => {
    const previousBalance = index > 0 ? zusAccountFundsByYear[index - 1].zusAccountFundsPLN : 0;
    const currentBalance = item.zusAccountFundsPLN || 0;
    const annualContribution = Math.max(0, currentBalance - previousBalance);
    
    return {
      year: item.year,
      balance: Math.round(currentBalance),
      annualContribution: Math.round(annualContribution),
      voluntaryContribution: 0, // Backend doesn't provide this separately
      totalContribution: Math.round(annualContribution),
    };
  });
};

/**
 * Generate salary projection data for charts
 */
const generateSalaryProjection = (result) => {
  // This is a simplified projection - could be enhanced with real data from backend
  const currentYear = new Date().getFullYear();
  const projectionYears = 10;
  const baseWage = result.wageExclSickLeavePLN || 5000;
  
  return Array.from({ length: projectionYears }, (_, index) => ({
    year: currentYear + index,
    salary: baseWage * Math.pow(1.05, index), // 5% annual growth assumption
    realSalary: baseWage * Math.pow(1.02, index), // 2% real growth
  }));
};

/**
 * Pension API Service
 */
export const pensionApiService = {
  /**
   * Calculate pension based on user parameters
   */
  async calculatePension(formData) {
    try {
      const requestData = transformToApiRequest(formData);
      
      if (config.enableDebug) {
        console.log('🧮 Calculating pension with data:', requestData);
      }
      
      const response = await apiClient.post(config.endpoints.calculatePension, requestData);
      
      const transformedResponse = transformApiResponse(response.data);
      
      if (config.enableDebug) {
        console.log('✅ Pension calculation result:', transformedResponse);
      }
      
      return {
        success: true,
        data: transformedResponse,
        duration: response.duration,
      };
      
    } catch (error) {
      const errorInfo = handleApiError(error, 'calculatePension');
      
      return {
        success: false,
        error: errorInfo,
        data: null,
      };
    }
  },
  
  /**
   * Update postal code for existing calculation
   */
  async updatePostalCode(calculationId, postalCode) {
    try {
      const url = config.endpoints.updatePostalCode.replace('{calculationId}', calculationId);
      
      await apiClient.put(url, { postalCode });
      
      return {
        success: true,
        message: 'Kod pocztowy został zaktualizowany',
      };
      
    } catch (error) {
      const errorInfo = handleApiError(error, 'updatePostalCode');
      
      return {
        success: false,
        error: errorInfo,
      };
    }
  },
  
  /**
   * Get random pension fact
   */
  async getRandomFact(locale = 'pl-PL') {
    try {
      const response = await apiClient.get(config.endpoints.randomFact, {
        params: { locale }
      });
      
      return {
        success: true,
        data: response.data,
      };
      
    } catch (error) {
      const errorInfo = handleApiError(error, 'getRandomFact');
      
      return {
        success: false,
        error: errorInfo,
        data: null,
      };
    }
  },

  /**
   * Generate admin usage report (XLS)
   */
  async generateAdminReport(dateFrom, dateTo) {
    try {
      const response = await apiClient.post(config.endpoints.generateReport, {
        dateFrom,
        dateTo,
      }, {
        responseType: 'blob', // Important for binary data
      });
      
      // Create blob URL for download
      const blob = new Blob([response.data], { 
        type: 'application/vnd.ms-excel' 
      });
      const url = window.URL.createObjectURL(blob);
      
      // Generate filename with current date
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const filename = `raport-uzytkownikow_${dateFrom}_${dateTo}_${dateStr}.xls`;
      
      return {
        success: true,
        data: {
          blob,
          url,
          filename,
        },
      };
      
    } catch (error) {
      const errorInfo = handleApiError(error, 'generateAdminReport');
      
      return {
        success: false,
        error: errorInfo,
        data: null,
      };
    }
  },
};

export default pensionApiService;