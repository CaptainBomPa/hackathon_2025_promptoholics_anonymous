package com.promptoholics.anonymous.ApiBackend.application;

import com.promptoholics.anonymous.ApiBackend.services.ReportServiceXls;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class AdministrationFacade {
    private final ReportServiceXls reportServiceXls;

    public ByteArrayResource generateAdminReport() {
        try {
            return reportServiceXls.generateReportInMemory();
        } catch (IOException e) {
            throw new RuntimeException("Błąd generowania raportu", e);
        }
    }
}
