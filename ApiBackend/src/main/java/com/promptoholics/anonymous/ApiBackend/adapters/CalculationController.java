package com.promptoholics.anonymous.ApiBackend.adapters;

import com.promptoholics.anonymous.ApiBackend.api.CalculationApi;
import com.promptoholics.anonymous.ApiBackend.schemas.dtos.PensionCalculationRequestDto;
import com.promptoholics.anonymous.ApiBackend.schemas.dtos.PensionCalculationResponseDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RestController;

@Component
@RestController
public class CalculationController implements CalculationApi {

    @Override
    public ResponseEntity<PensionCalculationResponseDto> calculatePensions(PensionCalculationRequestDto pensionCalculationRequestDto) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }
}
