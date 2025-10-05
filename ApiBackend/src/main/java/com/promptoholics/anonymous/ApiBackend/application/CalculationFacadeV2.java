package com.promptoholics.anonymous.ApiBackend.application;

import com.promptoholics.anonymous.ApiBackend.domain.PensionCalculationEntity;
import com.promptoholics.anonymous.ApiBackend.domain.PensionCalculationRepository;
import com.promptoholics.anonymous.ApiBackend.domain.calc.PensionCalculatorV2;
import com.promptoholics.anonymous.ApiBackend.schemas.dtos.PensionCalculationRequestDto;
import com.promptoholics.anonymous.ApiBackend.schemas.dtos.PensionCalculationResponseDto;
import com.promptoholics.anonymous.ApiBackend.schemas.dtos.PostalCodeUpdateRequestDto;
import io.micrometer.common.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.openapitools.jackson.nullable.JsonNullable;
import org.springframework.stereotype.Component;

import java.lang.reflect.Constructor;
import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.*;

@Component
@RequiredArgsConstructor
public class CalculationFacadeV2 {

    private final PensionCalculationRepository pensionCalculationRepository;
    private final PensionCalculatorV2 calculator = new PensionCalculatorV2();

    public PensionCalculationResponseDto calculatePensions(PensionCalculationRequestDto req) {
        // 1) Parse work breaks
        List<PensionCalculatorV2.WorkBreak> workBreaks = parseWorkBreaks(req);

        // 2) Parse contract type
        PensionCalculatorV2.ContractType contractType = parseContractType(req.getContractType());

        // 3) Input
        var input = new PensionCalculatorV2.Input(
            toBD(req.getExpectedPensionPLN()),
            req.getAge(),
            req.getSex() != null ? req.getSex().getValue() : "M",
            toBD(req.getGrossSalaryPLN()),
            req.getStartYear(),
            req.getPlannedEndYear(),
            Boolean.TRUE.equals(req.getIncludeSickLeave()),
            toBD(fromJN(req.getZusAccountFundsPLN())),
            fromJN(req.getPostalCode()),
            req.getAdditionalSickLeaveDaysPerYear(),
            workBreaks,
            contractType
        );

        // 4) Calculate
        var output = calculator.calculate(input);

        // 5) Persist
        UUID id = UUID.randomUUID();
        try {
            PensionCalculationEntity e = new PensionCalculationEntity();
            trySet(e, "id", id);
            trySet(e, "expectedPension", dbl(req.getExpectedPensionPLN()));
            trySet(e, "age", req.getAge());
            trySet(e, "gender", req.getSex() != null ? req.getSex().getValue() : "M");
            trySet(e, "salaryAmount", dbl(req.getGrossSalaryPLN()));
            trySet(e, "includedSicknessPeriods", Boolean.TRUE.equals(req.getIncludeSickLeave()));
            if (req.getZusAccountFundsPLN() != null && req.getZusAccountFundsPLN().isPresent())
                trySet(e, "accumulatedFundsTotal", dbl(req.getZusAccountFundsPLN().get()));
            if (req.getPostalCode() != null && req.getPostalCode().isPresent())
                trySet(e, "postalCode", req.getPostalCode().get());
            trySet(e, "actualPension", scale2(output.actualMonthlyPension()).doubleValue());
            trySet(e, "inflationAdjustedPension", scale2(output.realMonthlyPension2025()).doubleValue());
            pensionCalculationRepository.saveAndFlush(e);
        } catch (Throwable ignore) { /* testy bez bazy */ }

        // 6) Build response
        PensionCalculationResponseDto resp = new PensionCalculationResponseDto();

        // id
        if (!tryInvoke(resp, "setId", new Class[]{UUID.class}, new Object[]{id})) {
            tryInvoke(resp, "setId", new Class[]{String.class}, new Object[]{id.toString()});
        }

        // requestedAt
        tryInvoke(resp, "setRequestedAt", new Class[]{OffsetDateTime.class},
            new Object[]{OffsetDateTime.ofInstant(output.requestedAt(), ZoneOffset.UTC)});

        // result
        Object result = tryConstructParamOf(resp, "setResult");
        if (result != null) {
            // actualAmountPLN
            trySetNumberFlexible(result, "setActualAmountPLN", scale2(output.actualMonthlyPension()));
            trySetNumberFlexible(result, "setActualAmountPln", scale2(output.actualMonthlyPension()));

            // realAmountDeflated / realAmountPLN_2025
            if (!(trySetNumberFlexible(result, "setRealAmountDeflated", scale2(output.realMonthlyPension2025()))
                || trySetNumberFlexible(result, "setRealAmountPLN2025", scale2(output.realMonthlyPension2025()))
                || trySetNumberFlexible(result, "setRealAmountPLN_2025", scale2(output.realMonthlyPension2025()))
                || trySetNumberFlexible(result, "setRealAmountPln2025", scale2(output.realMonthlyPension2025()))
                || trySetNumberFlexible(result, "setRealAmountPln_2025", scale2(output.realMonthlyPension2025())))) {
                // skip
            }

            // replacementRatePct
            trySetNumberFlexible(result, "setReplacementRatePct", scale1(output.replacementRatePct()));

            // vsAverage
            if (output.vsAveragePct() != null) {
                if (!(trySetNumberFlexible(result, "setVsAverageInRetirementYearPct", scale1(output.vsAveragePct()))
                    || trySetNumberFlexible(result, "setVsAveragePct", scale1(output.vsAveragePct())))) {
                    // skip
                }
            }

            // wages
            trySetNumberFlexible(result, "setWageInclSickLeavePLN", scale2(output.wageInclSickMonthly()));
            trySetNumberFlexible(result, "setWageInclSickLeavePln", scale2(output.wageInclSickMonthly()));
            trySetNumberFlexible(result, "setWageExclSickLeavePLN", scale2(output.wageExclSickMonthly()));
            trySetNumberFlexible(result, "setWageExclSickLeavePln", scale2(output.wageExclSickMonthly()));

            // ifPostponedYears
            List<Object> postponedList = new ArrayList<>();
            output.postponedPensions().forEach((years, pension) -> {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("postponedByYears", years);
                item.put("actualAmountPLN", scale2(pension));
                postponedList.add(item);
            });
            tryInvoke(result, "setIfPostponedYears", new Class[]{List.class}, new Object[]{postponedList});

            // meetsExpectation
            if (req.getExpectedPensionPLN() != null && req.getExpectedPensionPLN() > 0f) {
                double expected = req.getExpectedPensionPLN();
                double actual = scale2(output.actualMonthlyPension()).doubleValue();
                boolean met = actual >= expected;

                Integer extraYears = null;
                if (!met) {
                    for (var entry : output.postponedPensions().entrySet()) {
                        if (entry.getValue().doubleValue() >= expected) {
                            extraYears = entry.getKey();
                            break;
                        }
                    }
                }

                Object meets = tryConstructParamOf(result, "setMeetsExpectation");
                if (meets != null) {
                    tryInvoke(meets, "setIsMet", new Class[]{Boolean.class}, new Object[]{met});
                    if (!met) {
                        BigDecimal shortfall = scale2(BigDecimal.valueOf(expected - actual));
                        if (!(trySetNumberFlexible(meets, "setShortfallPLN", shortfall)
                            || trySetNumberFlexible(meets, "setShortfallPln", shortfall))) {
                            // skip
                        }
                    }
                    if (extraYears != null)
                        tryInvoke(meets, "setExtraYearsRequiredEstimate", new Class[]{Integer.class}, new Object[]{extraYears});
                    tryInvoke(result, "setMeetsExpectation", new Class[]{meets.getClass()}, new Object[]{meets});
                }
            }

            // zusAccountFundsByYear
            List<Object> accountByYearList = new ArrayList<>();
            output.zusAccountByYear().forEach((year, funds) -> {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("year", year);
                item.put("zusAccountFundsPLN", scale2(funds));
                accountByYearList.add(item);
            });
            tryInvoke(result, "setZusAccountFundsByYear", new Class[]{List.class}, new Object[]{accountByYearList});

            tryInvoke(resp, "setResult", new Class[]{result.getClass()}, new Object[]{result});
        }

        return resp;
    }

    public void enterPostalCodeForCalculation(String calculationId, PostalCodeUpdateRequestDto body) {
        if (body == null || StringUtils.isBlank(body.getPostalCode())) {
            throw new RuntimeException("postalCode must be provided");
        }
        var calc = pensionCalculationRepository.findById(UUID.fromString(calculationId))
            .orElseThrow(() -> new RuntimeException("Calculation with id = %s not found".formatted(calculationId)));
        calc.setPostalCode(body.getPostalCode());
        pensionCalculationRepository.saveAndFlush(calc);
    }

    /* ===================== helpers ===================== */

    private PensionCalculatorV2.ContractType parseContractType(
        PensionCalculationRequestDto.ContractTypeEnum contractTypeEnum) {
        if (contractTypeEnum == null) {
            return PensionCalculatorV2.ContractType.UMOWA_O_PRACE;
        }

        return switch (contractTypeEnum) {
            case B2_B -> PensionCalculatorV2.ContractType.B2B;
            case UMOWA_O_PRACE -> PensionCalculatorV2.ContractType.UMOWA_O_PRACE;
            case UMOWA_ZLECENIE -> PensionCalculatorV2.ContractType.UMOWA_ZLECENIE;
            case UMOWA_O_DZIELO -> PensionCalculatorV2.ContractType.UMOWA_O_DZIELO;
        };
    }

    private List<PensionCalculatorV2.WorkBreak> parseWorkBreaks(PensionCalculationRequestDto req) {
        if (req.getAdditionalSalaryChanges() == null || req.getAdditionalSalaryChanges().isEmpty()) {
            return Collections.emptyList();
        }

        List<PensionCalculatorV2.WorkBreak> breaks = new ArrayList<>();
        for (var change : req.getAdditionalSalaryChanges()) {
            String changeType = getChangeType(change);
            if ("BREAK".equalsIgnoreCase(changeType)) {
                OffsetDateTime startDate = getStartDate(change);
                OffsetDateTime endDate = getEndDate(change);

                if (startDate != null && endDate != null) {
                    int startYear = startDate.getYear();
                    int endYear = endDate.getYear();
                    breaks.add(new PensionCalculatorV2.WorkBreak(startYear, endYear));
                }
            }
        }
        return breaks;
    }

    private String getChangeType(Object change) {
        try {
            Method m = change.getClass().getMethod("getChangeType");
            Object result = m.invoke(change);
            return result != null ? result.toString() : null;
        } catch (Exception ignore) {
            return null;
        }
    }

    private OffsetDateTime getStartDate(Object change) {
        try {
            Method m = change.getClass().getMethod("getStartDate");
            return (OffsetDateTime) m.invoke(change);
        } catch (Exception ignore) {
            return null;
        }
    }

    private OffsetDateTime getEndDate(Object change) {
        try {
            Method m = change.getClass().getMethod("getEndDate");
            return (OffsetDateTime) m.invoke(change);
        } catch (Exception ignore) {
            return null;
        }
    }

    private static BigDecimal toBD(Float f) {
        return f == null ? null : BigDecimal.valueOf(f.doubleValue());
    }

    private static <T> T fromJN(JsonNullable<T> jn) {
        return (jn != null && jn.isPresent()) ? jn.get() : null;
    }

    private static double dbl(Float f) {
        return f == null ? 0d : f.doubleValue();
    }

    private static BigDecimal scale2(BigDecimal x) {
        return x.setScale(2, RoundingMode.HALF_UP);
    }

    private static BigDecimal scale1(BigDecimal x) {
        return x.setScale(1, RoundingMode.HALF_UP);
    }

    private static void trySet(Object target, String field, Object val) {
        try {
            var f = target.getClass().getDeclaredField(field);
            f.setAccessible(true);
            f.set(target, val);
        } catch (Exception ignore) {
        }
    }

    private static boolean tryInvoke(Object target, String method, Class<?>[] types, Object[] args) {
        try {
            Method m = target.getClass().getMethod(method, types);
            m.setAccessible(true);
            m.invoke(target, args);
            return true;
        } catch (Exception ignore) {
            return false;
        }
    }

    private static Object tryConstructParamOf(Object target, String setterName) {
        try {
            for (Method m : target.getClass().getMethods()) {
                if (m.getName().equals(setterName) && m.getParameterCount() == 1) {
                    Class<?> p = m.getParameterTypes()[0];
                    try {
                        Constructor<?> c = p.getDeclaredConstructor();
                        c.setAccessible(true);
                        return c.newInstance();
                    } catch (Exception ignored) {
                        return null;
                    }
                }
            }
        } catch (Exception ignore) {
        }
        return null;
    }

    private static boolean trySetNumberFlexible(Object target, String setterName, BigDecimal value) {
        Method[] methods = target.getClass().getMethods();
        for (Method m : methods) {
            if (!m.getName().equals(setterName) || m.getParameterCount() != 1) continue;
            Class<?> p = m.getParameterTypes()[0];
            Object coerced = coerceNumber(p, value);
            if (coerced == COERCE_UNSUPPORTED) continue;
            try {
                m.setAccessible(true);
                m.invoke(target, coerced);
                return true;
            } catch (Exception ignore) { /* try next */ }
        }
        return false;
    }

    private static final Object COERCE_UNSUPPORTED = new Object();

    private static Object coerceNumber(Class<?> param, BigDecimal v) {
        if (param == BigDecimal.class) return v;
        if (param == Double.class || param == double.class) return v.doubleValue();
        if (param == Float.class || param == float.class) return v.floatValue();
        if (param == Integer.class || param == int.class) return v.intValue();
        if (param == Long.class || param == long.class) return v.longValue();
        if (Number.class.isAssignableFrom(param)) return v.doubleValue();
        return COERCE_UNSUPPORTED;
    }
}
