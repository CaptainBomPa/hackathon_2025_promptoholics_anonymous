export function simulatePension(req) {
    const now = new Date()
    const currentYear = now.getFullYear()
    const retirementAge = req.sex === 'F' ? 60 : 65

    // Rok emerytury: bierzemy plannedEndYear (jeśli podany) – inaczej z wieku
    const yearsLeft = Math.max(0, retirementAge - Number(req.age || 0))
    const retirementYear = Number(req.plannedEndYear) || currentYear + yearsLeft

    const yearsWorked = Math.max(0, retirementYear - Number(req.startYear || currentYear))
    // Prosty model stopy zastąpienia (tylko mock, ~30–65%)
    const replacement = Math.min(0.65, 0.25 + yearsWorked * 0.009)

    const wageExcl = Number(req.grossSalaryPLN || 0)
    const sickPenalty = req.sex === 'F' ? 0.95 : 0.96 // mock wpływu absencji
    const wageIncl = wageExcl * sickPenalty

    // Kwota nominalna w roku przejścia na emeryturę (mock)
    const actualAmountPLN = wageExcl * replacement

    // Urealnienie do 2025 (mock CPI 2.5%/rok)
    const cpi = 0.025
    const deflatorYears = retirementYear - 2025
    const realAmountPLN_2025 = actualAmountPLN / Math.pow(1 + cpi, deflatorYears)

    // Porównanie do "średniej" (mock: wzrost płac 3%/rok)
    const avgWageRetYear = wageExcl * Math.pow(1.03, Math.max(0, retirementYear - currentYear))
    const vsAvg = (actualAmountPLN / avgWageRetYear) * 100 - 100

    // Czy spełnia oczekiwania? Porównujemy do realAmount_2025 (dzisiejsza siła nabywcza)
    const expected = Number.isFinite(Number(req.expectedPensionPLN)) ? Number(req.expectedPensionPLN) : null
    const isMet = expected == null ? null : realAmountPLN_2025 >= expected
    const shortfall = expected != null && !isMet ? Math.max(0, Math.round(expected - realAmountPLN_2025)) : null

    // +1…+5 lat pracy – wzrost 6%/rok (mock)
    const step = 0.06
    const ifPostponedYears = {}
    for (let y = 1; y <= 5; y++) {
        ifPostponedYears[`+${y}`] = { actualAmountPLN: Math.round(actualAmountPLN * Math.pow(1 + step, y)) }
    }

    // Szac. liczba dodatkowych lat aby osiągnąć oczekiwania (limit 10)
    let extraYearsRequiredEstimate = null
    if (expected != null) {
        let testNominal = actualAmountPLN
        let years = 0
        while (years < 10) {
            const testReal2025 = testNominal / Math.pow(1 + cpi, deflatorYears)
            if (testReal2025 >= expected) break
            years++
            testNominal *= 1 + step
        }
        extraYearsRequiredEstimate = years === 0 ? 0 : (years < 10 ? years : null)
    }

    return {
        requestedAt: now.toISOString(),
        assumptions: {
            retirementAgeYear: retirementYear,
            inflationModel: `CPI ${ (cpi*100).toFixed(1) }% rocznie (mock)`,
            wageIndexationSource: 'Mock GUS index',
            sickLeaveAssumption: 'Uwzględniono wpływ absencji na płace (mock)'
        },
        result: {
            actualAmountPLN: Math.round(actualAmountPLN),
            realAmountPLN_2025: Math.round(realAmountPLN_2025),
            replacementRatePct: +(replacement * 100).toFixed(1),
            vsAverageInRetirementYearPct: +vsAvg.toFixed(1),
            wageInclSickLeavePLN: Math.round(wageIncl),
            wageExclSickLeavePLN: Math.round(wageExcl),
            ifPostponedYears,
            meetsExpectation: {
                isMet,
                shortfallPLN: shortfall,
                extraYearsRequiredEstimate
            }
        },
        traceId: `mock-${now.getTime().toString(36)}-${Math.random().toString(36).slice(2,8)}`
    }
}
