package com.promptoholics.anonymous.ApiBackend.application;

import com.promptoholics.anonymous.ApiBackend.schemas.dtos.AdminReportCreateRequestDto;
import com.promptoholics.anonymous.ApiBackend.schemas.dtos.ReportJobDto;
import org.springframework.stereotype.Component;

@Component
public class AdministrationFacade {

    public ReportJobDto generateAdminReport(AdminReportCreateRequestDto reportCreateRequestDto) {
        return null;
    }
}
