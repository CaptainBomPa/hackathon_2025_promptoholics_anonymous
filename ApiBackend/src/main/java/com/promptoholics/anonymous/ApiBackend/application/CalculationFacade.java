package com.promptoholics.anonymous.ApiBackend.application;

import com.promptoholics.anonymous.ApiBackend.schemas.dtos.*;
import org.springframework.stereotype.Component;

@Component
public class CalculationFacade {
    public PensionCalculationResponseDto calculatePensions(PensionCalculationRequestDto request) {
        return null;
    }

    public void enterPostalCodeForCalculation(
            String calculationId, PostalCodeUpdateRequestDto postalCodeUpdateRequestDto
    ) {

    }

    public ReportJobDto generateCalculationReport(
            String calculationId, UserReportCreateRequestDto userReportCreateRequestDto
    ) {
        return null;
    }
}
