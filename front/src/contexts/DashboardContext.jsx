import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { calculatePensionDebounced, validateParameters } from '../services/pensionCalculationService';

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
      entries: [],
      useCustomValues: false,
      defaultGrowthRate: 3.5,
    },
    sickLeave: {
      mode: 'averaged', // 'averaged' | 'custom'
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
      currentBalance: 85000,
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
    activePanel: 'basic',
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
  ADD_SICK_LEAVE_PERIOD: 'ADD_SICK_LEAVE_PERIOD',
  REMOVE_SICK_LEAVE_PERIOD: 'REMOVE_SICK_LEAVE_PERIOD',
  UPDATE_INDEXATION: 'UPDATE_INDEXATION',
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

  // Auto-calculate when parameters change
  useEffect(() => {
    const validation = validateParameters(state.parameters);
    
    if (validation.isValid) {
      dispatch({ type: DASHBOARD_ACTIONS.SET_CALCULATING, payload: true });
      
      calculatePensionDebounced(state.parameters, (error, results) => {
        dispatch({ type: DASHBOARD_ACTIONS.SET_CALCULATING, payload: false });
        
        if (error) {
          console.error('Calculation error:', error);
          dispatch({ type: DASHBOARD_ACTIONS.SET_ERROR, payload: { field: 'calculation', message: error.message } });
        } else {
          dispatch({ type: DASHBOARD_ACTIONS.CLEAR_ERROR, payload: 'calculation' });
          dispatch({ type: DASHBOARD_ACTIONS.SET_CALCULATION_RESULTS, payload: results });
        }
      });
    } else {
      // Set validation errors
      Object.entries(validation.errors).forEach(([field, message]) => {
        dispatch({ type: DASHBOARD_ACTIONS.SET_ERROR, payload: { field, message } });
      });
    }
  }, [state.parameters]);

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