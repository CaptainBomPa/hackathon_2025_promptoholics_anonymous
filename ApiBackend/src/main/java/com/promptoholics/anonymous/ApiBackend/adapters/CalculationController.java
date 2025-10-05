package com.promptoholics.anonymous.ApiBackend.adapters;

import com.promptoholics.anonymous.ApiBackend.api.CalculationApi;
import com.promptoholics.anonymous.ApiBackend.application.CalculationFacadeV2;
import com.promptoholics.anonymous.ApiBackend.schemas.dtos.PensionCalculationRequestDto;
import com.promptoholics.anonymous.ApiBackend.schemas.dtos.PensionCalculationResponseDto;
import com.promptoholics.anonymous.ApiBackend.schemas.dtos.PostalCodeUpdateRequestDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RestController;

@Component
@RestController
@RequiredArgsConstructor
@Slf4j
public class CalculationController implements CalculationApi {

    private final CalculationFacadeV2 calculationFacade;

    @Override
    public ResponseEntity<PensionCalculationResponseDto> calculatePensions(PensionCalculationRequestDto request) {
        log.info("[REQUEST] calculatePensions with: {}", request);
        var response = calculationFacade.calculatePensions(request);
        return ResponseEntity.ok(response);
    }

    public ResponseEntity<Void> enterPostalCodeForCalculation(String calculationId, PostalCodeUpdateRequestDto request) {
        log.info("[REQUEST] enterPostalCodeForCalculation with id: {} and {}", calculationId, request);
        calculationFacade.enterPostalCodeForCalculation(calculationId, request);
        return ResponseEntity.ok(null);
    }
}
