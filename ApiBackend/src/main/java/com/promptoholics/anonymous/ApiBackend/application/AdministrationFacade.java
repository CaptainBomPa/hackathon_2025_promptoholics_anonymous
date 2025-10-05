package com.promptoholics.anonymous.ApiBackend.application;

import com.promptoholics.anonymous.ApiBackend.schemas.dtos.PensionCalculationReportJsonDto;
import com.promptoholics.anonymous.ApiBackend.services.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class AdministrationFacade {
    private final ReportService reportService;

    public ByteArrayResource generateAdminReport(LocalDate dateFrom, LocalDate dateTo) {
        try {
            return reportService.generateReportInMemory(dateFrom, dateTo);
        } catch (IOException e) {
            throw new RuntimeException("Błąd generowania raportu", e);
        }
    }

    public List<PensionCalculationReportJsonDto> generateAdminReportJson(LocalDate dateFrom, LocalDate dateTo) {
        return reportService.generateJsonReport(dateFrom, dateTo);
    }
}
