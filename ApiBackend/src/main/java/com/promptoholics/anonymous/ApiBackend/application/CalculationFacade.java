package com.promptoholics.anonymous.ApiBackend.application;

import com.promptoholics.anonymous.ApiBackend.domain.PensionCalculationRepository;
import com.promptoholics.anonymous.ApiBackend.schemas.dtos.PensionCalculationRequestDto;
import com.promptoholics.anonymous.ApiBackend.schemas.dtos.PensionCalculationResponseDto;
import com.promptoholics.anonymous.ApiBackend.schemas.dtos.PostalCodeUpdateRequestDto;
import io.micrometer.common.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CalculationFacade {

    private final PensionCalculationRepository pensionCalculationRepository;

    public PensionCalculationResponseDto calculatePensions(PensionCalculationRequestDto request) {
        return null;
    }

    public void enterPostalCodeForCalculation(
        String calculationId, PostalCodeUpdateRequestDto postalCodeUpdateRequestDto
    ) {
        if (postalCodeUpdateRequestDto == null || StringUtils.isBlank(postalCodeUpdateRequestDto.getPostalCode())) {
            throw new RuntimeException("Postal code must be provided");
        }

        var calculation = pensionCalculationRepository.findById(UUID.fromString(calculationId))
            .orElseThrow(() -> new RuntimeException("Calculation with id = %s not found".formatted(calculationId)));

        calculation.setPostalCode(postalCodeUpdateRequestDto.getPostalCode());
        pensionCalculationRepository.saveAndFlush(calculation);
    }

    public Resource generateCalculationReport(String calculationId) {
        return null;
    }
}
