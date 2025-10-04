package com.promptoholics.anonymous.ApiBackend.adapters;

import com.promptoholics.anonymous.ApiBackend.api.CalculationApi;
import com.promptoholics.anonymous.ApiBackend.application.CalculationFacade;
import com.promptoholics.anonymous.ApiBackend.schemas.dtos.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RestController;

@Component
@RestController
@RequiredArgsConstructor
public class CalculationController implements CalculationApi {

    private final CalculationFacade calculationFacade;

    @Override
    public ResponseEntity<PensionCalculationResponseDto> calculatePensions(PensionCalculationRequestDto request) {
        var response = calculationFacade.calculatePensions(request);
        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<Void> enterPostalCodeForCalculation(String calculationId, PostalCodeUpdateRequestDto postalCodeUpdateRequestDto) {
        calculationFacade.enterPostalCodeForCalculation(calculationId, postalCodeUpdateRequestDto);
        return ResponseEntity.ok(null);
    }

    @Override
    public ResponseEntity<ReportJobDto> generateCalculationReport(
            String calculationId, UserReportCreateRequestDto userReportCreateRequestDto
    ) {
        var response = calculationFacade.generateCalculationReport(calculationId, userReportCreateRequestDto);
        return ResponseEntity.ok(response);
    }
}
