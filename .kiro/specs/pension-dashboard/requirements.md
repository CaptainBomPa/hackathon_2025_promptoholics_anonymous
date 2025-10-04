# Requirements Document

## Introduction

This feature implements the pension simulator dashboard as specified in point 1.4 of the app specification. The dashboard provides advanced pension simulation capabilities with detailed parameter customization, historical and future salary adjustments, sick leave management, and ZUS account growth visualization.

## Requirements

### Requirement 1

**User Story:** As a user who has completed the basic pension simulation, I want to access an advanced dashboard where I can make detailed adjustments to my pension calculation parameters, so that I can explore different scenarios and optimize my retirement planning.

#### Acceptance Criteria

1. WHEN the user completes the basic simulation THEN the system SHALL provide access to the advanced dashboard
2. WHEN the user accesses the dashboard THEN the system SHALL display the current simulation results as a baseline
3. WHEN the user makes changes to parameters THEN the system SHALL recalculate results in real-time
4. WHEN the user wants to reset changes THEN the system SHALL provide an option to return to original simulation parameters

### Requirement 2

**User Story:** As a user planning my retirement, I want to input specific historical and future salary amounts instead of using averaged calculations, so that I can get more accurate pension projections based on my actual career trajectory.

#### Acceptance Criteria

1. WHEN the user accesses salary customization THEN the system SHALL display a timeline of salary inputs from start year to retirement year
2. WHEN the user enters specific salary amounts for different years THEN the system SHALL use these values instead of indexed calculations
3. WHEN the user wants to use different indexation rates THEN the system SHALL provide options to customize wage growth assumptions
4. WHEN salary data is incomplete THEN the system SHALL fill gaps using indexation calculations and clearly indicate estimated vs actual values

### Requirement 3

**User Story:** As a user with specific health considerations, I want to optionally input detailed sick leave periods from my past and plan for future health-related absences, so that I can understand their impact on my pension calculations, with the system using averaged values when I don't provide specific data.

#### Acceptance Criteria

1. WHEN the user accesses sick leave management THEN the system SHALL provide options to use averaged values or input specific sick leave periods
2. WHEN the user chooses averaged values THEN the system SHALL use statistical averages based on gender and age demographics
3. WHEN the user adds specific historical sick leave periods THEN the system SHALL adjust past contribution calculations accordingly
4. WHEN the user plans specific future sick leave periods THEN the system SHALL incorporate these into future pension projections
5. WHEN the user switches between averaged and specific sick leave modes THEN the system SHALL clearly show the impact on final pension amounts
6. WHEN sick leave data is not provided THEN the system SHALL default to averaged values and clearly indicate this assumption

### Requirement 4

**User Story:** As a user interested in my ZUS account growth, I want to visualize how my pension funds accumulate over time, so that I can understand the long-term impact of my contributions and make informed decisions about additional payments.

#### Acceptance Criteria

1. WHEN the user accesses account visualization THEN the system SHALL display a chart showing ZUS account balance growth over time
2. WHEN the user modifies salary or contribution parameters THEN the system SHALL update the account growth projection
3. WHEN the user wants to see detailed breakdowns THEN the system SHALL provide year-by-year account balance information
4. WHEN the user considers additional voluntary contributions THEN the system SHALL show the impact on account growth and final pension

### Requirement 5

**User Story:** As a user exploring different retirement scenarios, I want to save and compare multiple simulation configurations, so that I can evaluate different career and retirement strategies.

#### Acceptance Criteria

1. WHEN the user creates different simulation scenarios THEN the system SHALL allow saving multiple configurations
2. WHEN the user wants to compare scenarios THEN the system SHALL provide side-by-side comparison views
3. WHEN the user switches between scenarios THEN the system SHALL preserve all parameter settings
4. WHEN the user wants to share or export scenarios THEN the system SHALL provide export functionality

### Requirement 6

**User Story:** As a user with accessibility needs, I want the dashboard to be fully accessible and meet WCAG 2.0 standards, so that I can use all features regardless of my abilities.

#### Acceptance Criteria

1. WHEN using screen readers THEN the system SHALL provide proper ARIA labels and descriptions for all interactive elements
2. WHEN navigating with keyboard THEN the system SHALL provide logical tab order and focus management
3. WHEN viewing charts and graphs THEN the system SHALL provide alternative text descriptions and data tables
4. WHEN using high contrast mode THEN the system SHALL maintain readability and functionality