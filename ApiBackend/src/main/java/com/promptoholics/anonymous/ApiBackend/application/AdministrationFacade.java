package com.promptoholics.anonymous.ApiBackend.application;

import com.promptoholics.anonymous.ApiBackend.schemas.dtos.AdminReportCreateRequestDto;
import com.promptoholics.anonymous.ApiBackend.services.AdminReportServiceXls;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.time.ZoneOffset;

@Component
@RequiredArgsConstructor
public class AdministrationFacade {

    private final AdminReportServiceXls adminReportService;

    public Resource generateAdminReport(AdminReportCreateRequestDto reportCreateRequestDto) {
        return adminReportService.generateReportInMemory(
            reportCreateRequestDto.getDateFrom().atStartOfDay().atOffset(ZoneOffset.UTC),
            reportCreateRequestDto.getDateTo().atStartOfDay().atOffset(ZoneOffset.UTC)
        );
    }
}
