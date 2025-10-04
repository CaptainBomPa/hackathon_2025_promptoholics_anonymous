# Requirements Document

## Introduction

This feature integrates the existing pension results display component from the `pension-results-display` folder into the main front application. The integration implements point 1.3 of the app specification, which requires displaying pension simulation results with both real and adjusted amounts, along with comprehensive comparison data and additional insights about the user's projected retirement benefits.

## Requirements

### Requirement 1

**User Story:** As a user who has completed the pension simulation, I want to see my pension results displayed in a comprehensive and visually appealing format, so that I can understand my projected retirement benefits.

#### Acceptance Criteria

1. WHEN the user completes the pension simulation THEN the system SHALL display the SimulationResultPage with integrated pension results display
2. WHEN the results are displayed THEN the system SHALL show both real amount (rzeczywista wysokość) and adjusted amount (urealniona wysokość) as specified in point 1.3
3. WHEN the results are displayed THEN the system SHALL use the ZUS color palette as defined in the specification
4. WHEN the results are loading THEN the system SHALL show appropriate loading states with skeleton components

### Requirement 2

**User Story:** As a user viewing my pension results, I want to see how my projected pension compares to average pensions and my current salary, so that I can understand the context of my retirement benefits.

#### Acceptance Criteria

1. WHEN the results are displayed THEN the system SHALL show how the projected pension relates to the average pension in the retirement year
2. WHEN the results are displayed THEN the system SHALL show the replacement rate (stopa zastąpienia) comparing indexed salary to projected pension
3. WHEN the results are displayed THEN the system SHALL display salary information with and without sick leave periods
4. WHEN the results are displayed THEN the system SHALL show pension amounts with and without sick leave impact

### Requirement 3

**User Story:** As a user viewing my pension results, I want to see the benefits of delaying my retirement, so that I can make informed decisions about when to retire.

#### Acceptance Criteria

1. WHEN the results are displayed THEN the system SHALL show projected pension increases for delaying retirement by 1, 2, and 5 years
2. WHEN the projected pension is lower than expected THEN the system SHALL show how many additional years of work are needed to reach the expected amount
3. WHEN the user interacts with delay benefit information THEN the system SHALL provide clear explanations of the calculations

### Requirement 4

**User Story:** As a user viewing my pension results, I want the interface to be accessible and follow WCAG 2.0 standards, so that all users can access the information regardless of their abilities.

#### Acceptance Criteria

1. WHEN the results are displayed THEN the system SHALL meet WCAG 2.0 accessibility standards
2. WHEN using keyboard navigation THEN the system SHALL provide logical tab order and focus management
3. WHEN using screen readers THEN the system SHALL provide appropriate ARIA labels and live regions for dynamic content
4. WHEN amounts are displayed THEN the system SHALL provide proper currency formatting and screen reader announcements

### Requirement 5

**User Story:** As a user viewing my pension results, I want to navigate to additional details or return to modify my simulation, so that I can explore different scenarios.

#### Acceptance Criteria

1. WHEN viewing results THEN the system SHALL provide navigation options to return to the simulation form
2. WHEN viewing results THEN the system SHALL provide options to navigate to the detailed dashboard
3. WHEN the user wants more information THEN the system SHALL provide info buttons with detailed explanations
4. WHEN the user completes viewing results THEN the system SHALL maintain the simulation data for potential modifications