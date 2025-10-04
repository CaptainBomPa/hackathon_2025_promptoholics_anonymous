package com.promptoholics.anonymous.ApiBackend.application;

import com.promptoholics.anonymous.ApiBackend.schemas.dtos.PensionCalculationRequestDto;
import com.promptoholics.anonymous.ApiBackend.schemas.dtos.PensionCalculationResponseDto;
import org.springframework.stereotype.Component;

@Component
public class CalculationFacade {
    public PensionCalculationResponseDto calculatePensions(PensionCalculationRequestDto request) {
        return null;
    }
}
