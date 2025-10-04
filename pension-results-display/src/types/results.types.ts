/**
 * Core types for pension simulation results display
 * Based on requirements from point 1.3 of the specification
 */

export interface SimulationResults {
  /** Rzeczywista wysokość emerytury */
  realAmount: number;
  /** Urealniona wysokość emerytury */
  adjustedAmount: number;
  /** Średnia wysokość emerytury w roku przejścia na emeryturę */
  averagePensionAtRetirement: number;
  /** Stopa zastąpienia (w procentach) */
  replacementRate: number;
  /** Wysokość wynagrodzenia bez uwzględniania okresów chorobowych */
  salaryWithoutSickLeave: number;
  /** Wysokość wynagrodzenia z uwzględnianiem okresów chorobowych */
  salaryWithSickLeave: number;
  /** Wysokość emerytury bez uwzględniania okresów chorobowych */
  pensionWithoutSickLeave: number;
  /** Wysokość emerytury z uwzględnianiem okresów chorobowych */
  pensionWithSickLeave: number;
  /** Korzyści z odroczenia emerytury */
  delayBenefits: {
    oneYear: number;
    twoYears: number;
    fiveYears: number;
  };
  /** Rok przejścia na emeryturę */
  retirementYear: number;
  /** Obecny wiek użytkownika */
  currentAge: number;
  /** Czy uwzględniono okresy chorobowe w symulacji */
  includedSickLeave: boolean;
}

export interface UserExpectations {
  /** Oczekiwana wysokość emerytury wprowadzona na początku */
  expectedAmount: number;
  /** Liczba dodatkowych lat pracy potrzebnych do osiągnięcia oczekiwanej emerytury */
  additionalWorkYearsNeeded?: number;
}

export interface PensionResultsDisplayProps {
  simulationResults: SimulationResults;
  userExpectations: UserExpectations;
  loading?: boolean;
  onNavigateToDetails?: () => void;
}

// ZUS Color Palette (from specification)
export const zusColors = {
  primary: '#FFB34F',    // R: 255; G:179; B:79
  success: '#009F3F',    // R: 0; G: 153; B: 63
  neutral: '#BEC3CE',    // R: 190; G: 195; B: 206
  info: '#3F84D2',       // R: 63; G: 132; B: 210
  dark: '#00416E',       // R: 0: G: 65; B: 110
  error: '#F05E5E',      // R: 240; G: 94; B: 94
  text: '#000000',       // R: 0; G: 0; B: 0
} as const;

// Animation configuration
export interface AnimationConfig {
  countUp: {
    duration: number;
    easing: string;
  };
  cardEntrance: {
    duration: number;
    delay: (index: number) => number;
    easing: string;
  };
  chartAnimation: {
    duration: number;
    easing: string;
  };
}

export const animations: AnimationConfig = {
  countUp: {
    duration: 2000,
    easing: 'easeOutCubic',
  },
  cardEntrance: {
    duration: 600,
    delay: (index: number) => index * 100,
    easing: 'easeOutBack',
  },
  chartAnimation: {
    duration: 1500,
    easing: 'easeInOutQuart',
  },
};

// Typography scale
export interface TypographyScale {
  mainAmount: {
    fontSize: string;
    fontWeight: number;
    lineHeight: number;
  };
  sectionTitle: {
    fontSize: string;
    fontWeight: number;
    marginBottom: string;
  };
  metricValue: {
    fontSize: string;
    fontWeight: number;
  };
  explanation: {
    fontSize: string;
    lineHeight: number;
    color: string;
  };
}

export const typography: TypographyScale = {
  mainAmount: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.2,
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 600,
    marginBottom: '1rem',
  },
  metricValue: {
    fontSize: '1.8rem',
    fontWeight: 600,
  },
  explanation: {
    fontSize: '0.875rem',
    lineHeight: 1.5,
    color: 'text.secondary',
  },
};

// Accessibility features
export interface AccessibilityFeatures {
  ariaLabels: {
    realAmount: string;
    adjustedAmount: string;
    comparison: string;
    replacementRate: string;
  };
  keyboardNavigation: {
    tabOrder: string;
    focusManagement: string;
    skipLinks: boolean;
  };
  screenReader: {
    liveRegions: boolean;
    descriptiveText: boolean;
    dataAnnouncements: boolean;
  };
}

export const accessibilityFeatures: AccessibilityFeatures = {
  ariaLabels: {
    realAmount: 'Rzeczywista wysokość emerytury',
    adjustedAmount: 'Urealniona wysokość emerytury',
    comparison: 'Porównanie z średnią emeryturą',
    replacementRate: 'Stopa zastąpienia wynagrodzenia',
  },
  keyboardNavigation: {
    tabOrder: 'logical',
    focusManagement: 'automatic',
    skipLinks: true,
  },
  screenReader: {
    liveRegions: true,
    descriptiveText: true,
    dataAnnouncements: true,
  },
};