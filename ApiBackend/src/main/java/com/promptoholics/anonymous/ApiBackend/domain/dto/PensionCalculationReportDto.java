package com.promptoholics.anonymous.ApiBackend.domain.dto;

import com.promptoholics.anonymous.ApiBackend.domain.PensionCalculationEntity;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PensionCalculationReportDto {

    private UUID id;
    @NotNull
    private Instant createdAt;
    private double expectedPension;
    private int age;
    private String gender;
    private double salaryAmount;
    private boolean includedSicknessPeriods;
    private Double accumulatedFundsTotal;
    private Double actualPension;
    private Double inflationAdjustedPension;
    private String postalCode;

    public static PensionCalculationReportDto fromEntity(PensionCalculationEntity entity) {
        return PensionCalculationReportDto.builder()
                .id(entity.getId())
                .createdAt(entity.getCreatedAt())
                .expectedPension(entity.getExpectedPension())
                .age(entity.getAge())
                .gender(entity.getGender())
                .salaryAmount(entity.getSalaryAmount())
                .includedSicknessPeriods(entity.isIncludedSicknessPeriods())
                .accumulatedFundsTotal(entity.getAccumulatedFundsTotal())
                .actualPension(entity.getActualPension())
                .inflationAdjustedPension(entity.getInflationAdjustedPension())
                .postalCode(entity.getPostalCode())
                .build();
    }
}
