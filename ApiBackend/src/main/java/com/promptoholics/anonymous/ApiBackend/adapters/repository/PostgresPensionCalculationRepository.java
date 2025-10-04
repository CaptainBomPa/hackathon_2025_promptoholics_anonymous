package com.promptoholics.anonymous.ApiBackend.adapters.repository;

import com.promptoholics.anonymous.ApiBackend.domain.PensionCalculationEntity;
import com.promptoholics.anonymous.ApiBackend.domain.PensionCalculationRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface PostgresPensionCalculationRepository extends PensionCalculationRepository, JpaRepository<PensionCalculationEntity, UUID> {
    List<PensionCalculationEntity> findAllByCreatedAtBetween(Instant from, Instant to);
}
