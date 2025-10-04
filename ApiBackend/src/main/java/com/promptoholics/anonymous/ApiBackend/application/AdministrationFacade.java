package com.promptoholics.anonymous.ApiBackend.application;

import com.promptoholics.anonymous.ApiBackend.schemas.dtos.ReportCreateRequestDto;
import com.promptoholics.anonymous.ApiBackend.schemas.dtos.ReportJobDto;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

@Component
public class AdministrationFacade {

    public Resource downloadAdminReport(String reportId) {
        return null;
    }

    public ReportJobDto generateAdminReport(ReportCreateRequestDto reportCreateRequestDto) {
        return null;
    }

    public ReportJobDto getAdminReport(String reportId) {
        return null;
    }
}
