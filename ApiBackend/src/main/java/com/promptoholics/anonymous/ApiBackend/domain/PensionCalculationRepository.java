package com.promptoholics.anonymous.ApiBackend.domain;

import java.util.Optional;
import java.util.UUID;

public interface PensionCalculationRepository {

    PensionCalculationEntity saveAndFlush(PensionCalculationEntity entity);

    Optional<PensionCalculationEntity> findById(UUID id);
}
