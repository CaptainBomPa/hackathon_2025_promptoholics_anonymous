package com.promptoholics.anonymous.ApiBackend.application;

import com.promptoholics.anonymous.ApiBackend.schemas.dtos.AdminReportCreateRequestDto;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

@Component
public class AdministrationFacade {

    public Resource generateAdminReport(AdminReportCreateRequestDto reportCreateRequestDto) {
        return null;
    }
}
