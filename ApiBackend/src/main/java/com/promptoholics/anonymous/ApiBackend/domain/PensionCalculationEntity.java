package com.promptoholics.anonymous.ApiBackend.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "pension_calculation",
        indexes = {
                @Index(name = "idx_pension_usage_date", columnList = "created_at")
        }
)
@EntityListeners(AuditingEntityListener.class)
@Data
public class PensionCalculationEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "expected_pension", nullable = false)
    private double expectedPension;

    @Min(0)
    @Max(120)
    @Column(name = "age", nullable = false)
    private int age;

    @Column(name = "gender", length = 20, nullable = false)
    private String gender;

    @Column(name = "salary_amount", nullable = false)
    private double salaryAmount;

    @Column(name = "included_sickness_periods", nullable = false)
    private boolean includedSicknessPeriods;

    @Column(name = "accumulated_funds_total")
    private Double accumulatedFundsTotal;

    @Column(name = "actual_pension")
    private Double actualPension;

    @Column(name = "inflation_adjusted_pension")
    private Double inflationAdjustedPension;

    @Column(name = "postal_code")
    private String postalCode;

    @Version
    @Column(name = "version")
    private Integer version;
}
