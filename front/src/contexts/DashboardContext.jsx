import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { calculatePension, validateParameters } from '../services/pensionCalculationService';

/**
 * Dashboard state management context
 * Handles all dashboard parameters, calculations, and scenarios
 */

// Initial state structure
const initialState = {
  // Current simulation parameters
  parameters: {
    basic: {
      age: 35,
      gender: 'F',
      grossSalary: 8500,
      startYear: 2015,
      plannedEndYear: 2055,
      expectedPension: 4500,
    },
    salaryTimeline: {
      entries: [
        {
          id: 1,
          type: 'salary',
          startDate: new Date('2015-01-01'),
          endDate: new Date('2024-12-31'),
          grossAmount: 8500,
        },
        {
          id: 2,
          type: 'salary',
          startDate: new Date('2025-01-01'),
          endDate: new Date('2055-12-31'),
          grossAmount: 8500,
        },
      ],
      useCustomValues: false,
      defaultGrowthRate: 3.5,
    },
    sickLeave: {
      mode: 'averaged', // 'averaged' | 'custom' | 'none'
      customDays: 0,
      historicalPeriods: [],
      projectedPeriods: [],
      averagedData: {
        averageDaysPerYear: 7,
        impactOnContributions: 0.05,
      },
    },
    indexation: {
      wageGrowthRate: 3.5,
      inflationRate: 2.5,
      customRates: [],
    },
    zusAccount: {
      accountBalance: 85000,
      currentBalance: 85000, // Keep for backward compatibility
      workAfterRetirement: 0,
      voluntaryContributions: [],
    },
  },
  
  // Current calculation results
  results: {
    actualAmountPLN: 0,
    realAmountDeflated: 0,
    replacementRatePct: 0,
    vsAverageInRetirementYearPct: 0,
    accountGrowthProjection: [],
    salaryProjection: [],
  },
  
  // Saved scenarios for comparison
  scenarios: [],
  
  // UI state
  uiState: {
    isCalculating: false,
    activePanel: null,
    sidebarCollapsed: false,
    errors: {},
    lastCalculation: null,
  },
};

// Action types
const DASHBOARD_ACTIONS = {
  SET_BASIC_PARAMETERS: 'SET_BASIC_PARAMETERS',
  UPDATE_SALARY_TIMELINE: 'UPDATE_SALARY_TIMELINE',
  SET_SICK_LEAVE_MODE: 'SET_SICK_LEAVE_MODE',
  UPDATE_SICK_LEAVE_PARAMETERS: 'UPDATE_SICK_LEAVE_PARAMETERS',
  ADD_SICK_LEAVE_PERIOD: 'ADD_SICK_LEAVE_PERIOD',
  REMOVE_SICK_LEAVE_PERIOD: 'REMOVE_SICK_LEAVE_PERIOD',
  UPDATE_INDEXATION: 'UPDATE_INDEXATION',
  UPDATE_ZUS_ACCOUNT_PARAMETERS: 'UPDATE_ZUS_ACCOUNT_PARAMETERS',
  SET_CALCULATION_RESULTS: 'SET_CALCULATION_RESULTS',
  SET_CALCULATING: 'SET_CALCULATING',
  SET_ACTIVE_PANEL: 'SET_ACTIVE_PANEL',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SAVE_SCENARIO: 'SAVE_SCENARIO',
  LOAD_SCENARIO: 'LOAD_SCENARIO',
  DELETE_SCENARIO: 'DELETE_SCENARIO',
  RESET_TO_INITIAL: 'RESET_TO_INITIAL',
};

// Reducer function
function dashboardReducer(state, action) {
  switch (action.type) {
    case DASHBOARD_ACTIONS.SET_BASIC_PARAMETERS:
      return {
        ...state,
        parameters: {
          ...state.parameters,
          basic: { ...state.parameters.basic, ...action.payload },
        },
      };

    case DASHBOARD_ACTIONS.UPDATE_SALARY_TIMELINE:
      return {
        ...state,
        parameters: {
          ...state.parameters,
          salaryTimeline: { ...state.parameters.salaryTimeline, ...action.payload },
        },
      };

    case DASHBOARD_ACTIONS.SET_SICK_LEAVE_MODE:
      return {
        ...state,
        parameters: {
          ...state.parameters,
          sickLeave: { ...state.parameters.sickLeave, mode: action.payload },
        },
      };

    case DASHBOARD_ACTIONS.UPDATE_SICK_LEAVE_PARAMETERS:
      return {
        ...state,
        parameters: {
          ...state.parameters,
          sickLeave: { ...state.parameters.sickLeave, ...action.payload },
        },
      };

    case DASHBOARD_ACTIONS.ADD_SICK_LEAVE_PERIOD:
      const { period, type } = action.payload;
      const periodsKey = type === 'historical' ? 'historicalPeriods' : 'projectedPeriods';
      return {
        ...state,
        parameters: {
          ...state.parameters,
          sickLeave: {
            ...state.parameters.sickLeave,
            [periodsKey]: [...state.parameters.sickLeave[periodsKey], period],
          },
        },
      };

    case DASHBOARD_ACTIONS.REMOVE_SICK_LEAVE_PERIOD:
      const { index, type: removeType } = action.payload;
      const removePeriodsKey = removeType === 'historical' ? 'historicalPeriods' : 'projectedPeriods';
      return {
        ...state,
        parameters: {
          ...state.parameters,
          sickLeave: {
            ...state.parameters.sickLeave,
            [removePeriodsKey]: state.parameters.sickLeave[removePeriodsKey].filter((_, i) => i !== index),
          },
        },
      };

    case DASHBOARD_ACTIONS.UPDATE_INDEXATION:
      return {
        ...state,
        parameters: {
          ...state.parameters,
          indexation: { ...state.parameters.indexation, ...action.payload },
        },
      };

    case DASHBOARD_ACTIONS.UPDATE_ZUS_ACCOUNT_PARAMETERS:
      return {
        ...state,
        parameters: {
          ...state.parameters,
          zusAccount: { ...state.parameters.zusAccount, ...action.payload },
        },
      };

    case DASHBOARD_ACTIONS.SET_CALCULATION_RESULTS:
      return {
        ...state,
        results: { ...state.results, ...action.payload },
        uiState: { ...state.uiState, lastCalculation: new Date().toISOString() },
      };

    case DASHBOARD_ACTIONS.SET_CALCULATING:
      return {
        ...state,
        uiState: { ...state.uiState, isCalculating: action.payload },
      };

    case DASHBOARD_ACTIONS.SET_ACTIVE_PANEL:
      return {
        ...state,
        uiState: { ...state.uiState, activePanel: action.payload },
      };

    case DASHBOARD_ACTIONS.TOGGLE_SIDEBAR:
      return {
        ...state,
        uiState: { ...state.uiState, sidebarCollapsed: !state.uiState.sidebarCollapsed },
      };

    case DASHBOARD_ACTIONS.SET_ERROR:
      return {
        ...state,
        uiState: {
          ...state.uiState,
          errors: { ...state.uiState.errors, [action.payload.field]: action.payload.message },
        },
      };

    case DASHBOARD_ACTIONS.CLEAR_ERROR:
      const { [action.payload]: removed, ...remainingErrors } = state.uiState.errors;
      return {
        ...state,
        uiState: { ...state.uiState, errors: remainingErrors },
      };

    case DASHBOARD_ACTIONS.SAVE_SCENARIO:
      const newScenario = {
        id: Date.now().toString(),
        name: action.payload.name,
        description: action.payload.description,
        parameters: { ...state.parameters },
        results: { ...state.results },
        createdAt: new Date().toISOString(),
      };
      return {
        ...state,
        scenarios: [...state.scenarios, newScenario],
      };

    case DASHBOARD_ACTIONS.LOAD_SCENARIO:
      const scenario = state.scenarios.find(s => s.id === action.payload);
      if (!scenario) return state;
      return {
        ...state,
        parameters: { ...scenario.parameters },
        results: { ...scenario.results },
      };

    case DASHBOARD_ACTIONS.DELETE_SCENARIO:
      return {
        ...state,
        scenarios: state.scenarios.filter(s => s.id !== action.payload),
      };

    case DASHBOARD_ACTIONS.RESET_TO_INITIAL:
      return {
        ...initialState,
        scenarios: state.scenarios, // Keep saved scenarios
      };

    default:
      return state;
  }
}

// Context creation
const DashboardContext = createContext();

// Provider component
export const DashboardProvider = ({ children, initialData = {} }) => {
  // Initialize state with any provided initial data
  const mergedInitialState = {
    ...initialState,
    parameters: {
      ...initialState.parameters,
      basic: { ...initialState.parameters.basic, ...initialData.basic },
    },
  };

  const [state, dispatch] = useReducer(dashboardReducer, mergedInitialState);

  // Debounce timer ref
  const debounceTimerRef = useRef(null);
  const lastCalculationRef = useRef(null);

  // Auto-calculate when parameters change with debouncing
  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Basic validation
    const validation = validateParameters(state.parameters);
    
    if (!validation.isValid) {
      // Set validation errors immediately
      Object.entries(validation.errors).forEach(([field, message]) => {
        dispatch({ type: DASHBOARD_ACTIONS.SET_ERROR, payload: { field, message } });
      });
      return;
    }

    // Clear validation errors when validation passes
    const validationFields = ['age', 'grossSalary', 'startYear', 'plannedEndYear', 'wageGrowthRate', 'inflationRate'];
    validationFields.forEach(field => {
      dispatch({ type: DASHBOARD_ACTIONS.CLEAR_ERROR, payload: field });
    });

    // Debounced API call
    debounceTimerRef.current = setTimeout(async () => {
      // Check if parameters actually changed
      const currentParams = JSON.stringify(state.parameters);
      if (lastCalculationRef.current === currentParams) {
        return; // No change, skip calculation
      }

      dispatch({ type: DASHBOARD_ACTIONS.SET_CALCULATING, payload: true });
      
      try {
        console.log('🧮 Recalculating pension with new parameters...');
        console.log('📊 Salary timeline entries:', state.parameters.salaryTimeline?.entries);
        
        // Call the calculation service (which now uses real API)
        const result = await calculatePension(state.parameters);
        
        if (result.success) {
          
          // Transform backend data to match frontend expectations
          const transformedData = {
            ...result.data,
            // Transform salary projection data
            salaryProjection: result.data.salaryProjection?.map(item => ({
              year: item.year,
              amount: item.salary || item.amount, // Backend uses 'salary', frontend expects 'amount'
              realAmount: item.realSalary || item.realAmount,
              isProjected: item.year > new Date().getFullYear(),
              isCustom: false, // Backend doesn't provide this info yet
            })) || [],
            // For now, generate mock account growth if backend doesn't provide it
            accountGrowthProjection: result.data.accountGrowthProjection?.length > 0 
              ? result.data.accountGrowthProjection 
              : generateMockAccountGrowth(result.data.salaryProjection, state.parameters.zusAccount)
          };
          
          dispatch({ type: DASHBOARD_ACTIONS.CLEAR_ERROR, payload: 'calculation' });
          dispatch({ type: DASHBOARD_ACTIONS.SET_CALCULATION_RESULTS, payload: transformedData });
          lastCalculationRef.current = currentParams;
          
          console.log('✅ Pension calculation completed:', {
            actualAmount: result.data.actualAmountPLN,
            realAmount: result.data.realAmountDeflated,
            duration: result.duration
          });
        } else {
          console.error('❌ Calculation failed:', result.error);
          dispatch({ type: DASHBOARD_ACTIONS.SET_ERROR, payload: { 
            field: 'calculation', 
            message: result.error?.userMessage || 'Błąd kalkulacji' 
          }});
        }
      } catch (error) {
        console.error('💥 Calculation error:', error);
        dispatch({ type: DASHBOARD_ACTIONS.SET_ERROR, payload: { 
          field: 'calculation', 
          message: 'Wystąpił błąd podczas przeliczania' 
        }});
      } finally {
        dispatch({ type: DASHBOARD_ACTIONS.SET_CALCULATING, payload: false });
      }
    }, 1000); // 1 second debounce

    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [state.parameters]);

  // Helper function to generate mock account growth when backend doesn't provide it
  const generateMockAccountGrowth = (salaryProjection, zusAccount) => {
    if (!salaryProjection || salaryProjection.length === 0) return [];
    
    const growth = [];
    let currentBalance = zusAccount?.accountBalance || zusAccount?.currentBalance || 85000;
    const contributionRate = 0.1976; // 19.76% to pension account
    
    salaryProjection.forEach(salaryEntry => {
      const annualSalary = (salaryEntry.salary || salaryEntry.amount) * 12;
      const annualContribution = annualSalary * contributionRate;
      
      currentBalance += annualContribution;
      currentBalance *= 1.03; // 3% annual growth
      
      growth.push({
        year: salaryEntry.year,
        balance: Math.round(currentBalance),
        annualContribution: Math.round(annualContribution),
        voluntaryContribution: 0,
        totalContribution: Math.round(annualContribution),
      });
    });
    
    return growth;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Action creators
  const actions = {
    setBasicParameters: useCallback((params) => {
      dispatch({ type: DASHBOARD_ACTIONS.SET_BASIC_PARAMETERS, payload: params });
    }, []),

    updateSalaryTimeline: useCallback((timeline) => {
      dispatch({ type: DASHBOARD_ACTIONS.UPDATE_SALARY_TIMELINE, payload: timeline });
    }, []),

    setSickLeaveMode: useCallback((mode) => {
      dispatch({ type: DASHBOARD_ACTIONS.SET_SICK_LEAVE_MODE, payload: mode });
    }, []),

    updateSickLeaveParameters: useCallback((params) => {
      dispatch({ type: DASHBOARD_ACTIONS.UPDATE_SICK_LEAVE_PARAMETERS, payload: params });
    }, []),

    updateZUSAccountParameters: useCallback((params) => {
      dispatch({ type: DASHBOARD_ACTIONS.UPDATE_ZUS_ACCOUNT_PARAMETERS, payload: params });
    }, []),

    addSickLeavePeriod: useCallback((period, type = 'historical') => {
      dispatch({ type: DASHBOARD_ACTIONS.ADD_SICK_LEAVE_PERIOD, payload: { period, type } });
    }, []),

    removeSickLeavePeriod: useCallback((index, type = 'historical') => {
      dispatch({ type: DASHBOARD_ACTIONS.REMOVE_SICK_LEAVE_PERIOD, payload: { index, type } });
    }, []),

    updateIndexation: useCallback((indexation) => {
      dispatch({ type: DASHBOARD_ACTIONS.UPDATE_INDEXATION, payload: indexation });
    }, []),

    setCalculationResults: useCallback((results) => {
      dispatch({ type: DASHBOARD_ACTIONS.SET_CALCULATION_RESULTS, payload: results });
    }, []),

    setCalculating: useCallback((isCalculating) => {
      dispatch({ type: DASHBOARD_ACTIONS.SET_CALCULATING, payload: isCalculating });
    }, []),

    setActivePanel: useCallback((panel) => {
      dispatch({ type: DASHBOARD_ACTIONS.SET_ACTIVE_PANEL, payload: panel });
    }, []),

    toggleSidebar: useCallback(() => {
      dispatch({ type: DASHBOARD_ACTIONS.TOGGLE_SIDEBAR });
    }, []),

    setError: useCallback((field, message) => {
      dispatch({ type: DASHBOARD_ACTIONS.SET_ERROR, payload: { field, message } });
    }, []),

    clearError: useCallback((field) => {
      dispatch({ type: DASHBOARD_ACTIONS.CLEAR_ERROR, payload: field });
    }, []),

    saveScenario: useCallback((name, description) => {
      dispatch({ type: DASHBOARD_ACTIONS.SAVE_SCENARIO, payload: { name, description } });
    }, []),

    loadScenario: useCallback((scenarioId) => {
      dispatch({ type: DASHBOARD_ACTIONS.LOAD_SCENARIO, payload: scenarioId });
    }, []),

    deleteScenario: useCallback((scenarioId) => {
      dispatch({ type: DASHBOARD_ACTIONS.DELETE_SCENARIO, payload: scenarioId });
    }, []),

    resetToInitial: useCallback(() => {
      dispatch({ type: DASHBOARD_ACTIONS.RESET_TO_INITIAL });
    }, []),
  };

  const value = {
    state,
    actions,
    // Computed values for convenience
    computed: {
      hasUnsavedChanges: state.uiState.lastCalculation !== null,
      totalScenarios: state.scenarios.length,
      hasErrors: Object.keys(state.uiState.errors).length > 0,
      currentScenarioName: 'Current Simulation', // Could be enhanced to track current scenario
    },
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

// Hook for using dashboard context
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

export default DashboardContext;