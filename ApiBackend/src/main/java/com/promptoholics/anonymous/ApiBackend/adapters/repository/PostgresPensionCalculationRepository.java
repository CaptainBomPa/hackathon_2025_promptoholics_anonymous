package com.promptoholics.anonymous.ApiBackend.adapters.repository;

import com.promptoholics.anonymous.ApiBackend.domain.PensionCalculationEntity;
import com.promptoholics.anonymous.ApiBackend.domain.PensionCalculationRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PostgresPensionCalculationRepository extends PensionCalculationRepository, JpaRepository<PensionCalculationEntity, UUID> {
}
