package com.promptoholics.anonymous.ApiBackend.application;

import com.promptoholics.anonymous.ApiBackend.domain.PensionCalculationEntity;
import com.promptoholics.anonymous.ApiBackend.domain.PensionCalculationRepository;
import com.promptoholics.anonymous.ApiBackend.domain.calc.PensionCalculatorService;
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
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.*;

@Component
@RequiredArgsConstructor
public class CalculationFacade {

    private final PensionCalculationRepository pensionCalculationRepository;
    private final PensionCalculatorService calculator = new PensionCalculatorService();

    public PensionCalculationResponseDto calculatePensions(PensionCalculationRequestDto req) {
        var in = new PensionCalculatorService.Input(
                toBD(req.getExpectedPensionPLN()),
                req.getAge(),
                req.getSex()!=null ? req.getSex().getValue() : "M",
                toBD(req.getGrossSalaryPLN()),
                req.getStartYear(),
                req.getPlannedEndYear(),
                Boolean.TRUE.equals(req.getIncludeSickLeave()),
                toBD(fromJN(req.getZusAccountFundsPLN())),
                BigDecimal.ZERO,
                fromJN(req.getPostalCode())
        );
        var out = calculator.calculate(in);

        UUID id = UUID.randomUUID();
        try {
            PensionCalculationEntity e = new PensionCalculationEntity();
            trySet(e,"id", id);
            trySet(e,"expectedPension", dbl(req.getExpectedPensionPLN()));
            trySet(e,"age", req.getAge());
            trySet(e,"gender", req.getSex()!=null ? req.getSex().getValue() : "M");
            trySet(e,"salaryAmount", dbl(req.getGrossSalaryPLN()));
            trySet(e,"includedSicknessPeriods", Boolean.TRUE.equals(req.getIncludeSickLeave()));
            if (req.getZusAccountFundsPLN()!=null && req.getZusAccountFundsPLN().isPresent())
                trySet(e,"accumulatedFundsTotal", dbl(req.getZusAccountFundsPLN().get()));
            if (req.getPostalCode()!=null && req.getPostalCode().isPresent())
                trySet(e,"postalCode", req.getPostalCode().get());
            trySet(e,"actualPension", scale2(out.actualAnnual()).doubleValue());
            trySet(e,"inflationAdjustedPension", scale2(out.realAnnual2025()).doubleValue());
            pensionCalculationRepository.saveAndFlush(e);
        } catch (Throwable ignore) { /* brak bazy → pomiń */ }

        PensionCalculationResponseDto resp = new PensionCalculationResponseDto();

        if (!tryInvoke(resp, "setId", new Class[]{UUID.class}, new Object[]{id})) {
            tryInvoke(resp, "setId", new Class[]{String.class}, new Object[]{id.toString()});
        }

        tryInvoke(resp, "setRequestedAt", new Class[]{OffsetDateTime.class},
                new Object[]{OffsetDateTime.ofInstant(out.requestedAt(), ZoneOffset.UTC)});

        Object result = tryConstructParamOf(resp, "setResult");
        if (result != null) {
            trySetNumberFlexible(result, "setActualAmountPLN",  scale2(out.actualAnnual()));
            trySetNumberFlexible(result, "setActualAmountPln",  scale2(out.actualAnnual())); // alternatywa

            if (!( trySetNumberFlexible(result, "setRealAmountDeflated",      scale2(out.realAnnual2025()))
                    || trySetNumberFlexible(result, "setRealAmountPLN2025",       scale2(out.realAnnual2025()))
                    || trySetNumberFlexible(result, "setRealAmountPLN_2025",      scale2(out.realAnnual2025()))
                    || trySetNumberFlexible(result, "setRealAmountPln2025",       scale2(out.realAnnual2025()))
                    || trySetNumberFlexible(result, "setRealAmountPln_2025",      scale2(out.realAnnual2025())) )) {
            }

            trySetNumberFlexible(result, "setReplacementRatePct",             scale1(out.replacementPct()));
            if (out.vsAvgPct()!=null) {
                if (!( trySetNumberFlexible(result, "setVsAverageInRetirementYearPct", scale1(out.vsAvgPct()))
                        || trySetNumberFlexible(result, "setVsAveragePct",                  scale1(out.vsAvgPct())) )) {
                }
            }

            trySetNumberFlexible(result, "setWageInclSickLeavePLN",           scale2(out.wageInclSickMonthly()));
            trySetNumberFlexible(result, "setWageInclSickLeavePln",           scale2(out.wageInclSickMonthly()));
            trySetNumberFlexible(result, "setWageExclSickLeavePLN",           scale2(out.wageExclSickMonthly()));
            trySetNumberFlexible(result, "setWageExclSickLeavePln",           scale2(out.wageExclSickMonthly()));

            List<Object> asList = new ArrayList<>();
            out.postponed().forEach((k,v) -> {
                Map<String,Object> item = new LinkedHashMap<>();
                item.put("actualAmountPLN", scale2(v));
                item.put("year", k);
                asList.add(item);
            });
            tryInvoke(result, "setIfPostponedYears", new Class[]{List.class}, new Object[]{asList});

            if (req.getExpectedPensionPLN()!=null && req.getExpectedPensionPLN()>0f) {
                double expected = req.getExpectedPensionPLN();
                double actual   = scale2(out.actualAnnual()).doubleValue();
                boolean met = actual >= expected;
                Integer extra = null;
                var p1 = out.postponed().get("1");
                var p2 = out.postponed().get("2");
                var p5 = out.postponed().get("5");
                if (!met) {
                    if (p1!=null && p1.doubleValue()>=expected) extra=1;
                    else if (p2!=null && p2.doubleValue()>=expected) extra=2;
                    else if (p5!=null && p5.doubleValue()>=expected) extra=5;
                }
                Object meets = tryConstructParamOf(result, "setMeetsExpectation");
                if (meets != null) {
                    tryInvoke(meets, "setIsMet", new Class[]{Boolean.class}, new Object[]{met});
                    if (!met) {
                        trySetNumberFlexible(meets, "setShortfallPLN", scale2(BigDecimal.valueOf(expected-actual)));
                        trySetNumberFlexible(meets, "setShortfallPln", scale2(BigDecimal.valueOf(expected-actual)));
                    }
                    if (extra!=null) tryInvoke(meets, "setExtraYearsRequiredEstimate", new Class[]{Integer.class}, new Object[]{extra});
                    tryInvoke(result, "setMeetsExpectation", new Class[]{meets.getClass()}, new Object[]{meets});
                }
            }

            tryInvoke(resp, "setResult", new Class[]{result.getClass()}, new Object[]{result});
        }

        return resp;
    }

    public void enterPostalCodeForCalculation(String calculationId, PostalCodeUpdateRequestDto body) {
        if (body == null || StringUtils.isBlank(body.getPostalCode())) {
            throw new RuntimeException("Postal code must be provided");
        }
        var calc = pensionCalculationRepository.findById(UUID.fromString(calculationId))
                .orElseThrow(() -> new RuntimeException("Calculation with id = %s not found".formatted(calculationId)));
        calc.setPostalCode(body.getPostalCode());
        pensionCalculationRepository.saveAndFlush(calc);
    }

    /* ===================== helpers ===================== */

    private static BigDecimal toBD(Float f){ return f==null? null : BigDecimal.valueOf(f.doubleValue()); }
    private static <T> T fromJN(JsonNullable<T> jn){ return (jn!=null && jn.isPresent())? jn.get() : null; }
    private static double dbl(Float f){ return f==null?0d:f.doubleValue(); }
    private static BigDecimal scale2(BigDecimal x){ return x.setScale(2, java.math.RoundingMode.HALF_UP); }
    private static BigDecimal scale1(BigDecimal x){ return x.setScale(1, java.math.RoundingMode.HALF_UP); }

    private static void trySet(Object target, String field, Object val){
        try { var f=target.getClass().getDeclaredField(field); f.setAccessible(true); f.set(target, val); } catch (Exception ignore){}
    }

    private static boolean tryInvoke(Object target, String method, Class<?>[] types, Object[] args){
        try { Method m = target.getClass().getMethod(method, types); m.setAccessible(true); m.invoke(target, args); return true; }
        catch (Exception ignore){ return false; }
    }

    private static Object tryConstructParamOf(Object target, String setterName){
        try {
            for (Method m : target.getClass().getMethods()){
                if (m.getName().equals(setterName) && m.getParameterCount()==1){
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
        } catch (Exception ignore){}
        return null;
    }

    /** Elastyczne ustawianie liczb – dopasowuje BigDecimal do parametru settera (BigDecimal/Double/double/Float/float/Integer/int/Long/long). */
    private static boolean trySetNumberFlexible(Object target, String setterName, BigDecimal value){
        Method[] methods = target.getClass().getMethods();
        for (Method m : methods){
            if (!m.getName().equals(setterName) || m.getParameterCount()!=1) continue;
            Class<?> p = m.getParameterTypes()[0];
            Object coerced = coerceNumber(p, value);
            if (coerced == COERCE_UNSUPPORTED) continue;
            try {
                m.setAccessible(true);
                m.invoke(target, coerced);
                return true;
            } catch (Exception ignore) { /* spróbuj kolejny wariant */ }
        }
        return false;
    }

    private static final Object COERCE_UNSUPPORTED = new Object();
    private static Object coerceNumber(Class<?> param, BigDecimal v){
        if (param == BigDecimal.class) return v;
        if (param == Double.class || param == double.class) return v.doubleValue();
        if (param == Float.class  || param == float.class ) return v.floatValue();
        if (param == Integer.class|| param == int.class   ) return v.intValue();
        if (param == Long.class   || param == long.class  ) return v.longValue();
        if (Number.class.isAssignableFrom(param)) return v.doubleValue(); // ogólny fallback
        return COERCE_UNSUPPORTED;
    }
}
