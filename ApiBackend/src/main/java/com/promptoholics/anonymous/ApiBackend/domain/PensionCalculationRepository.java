package com.promptoholics.anonymous.ApiBackend.domain;

public interface PensionCalculationRepository {
    PensionCalculationEntity saveAndFlush(PensionCalculationEntity entity);
}
