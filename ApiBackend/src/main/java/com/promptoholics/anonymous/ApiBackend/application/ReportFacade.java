package com.promptoholics.anonymous.ApiBackend.application;

import com.promptoholics.anonymous.ApiBackend.schemas.dtos.ReportJobDto;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ReportFacade {

    public Resource downoloadReport(String reportId) {
        return null;
    }

    public ReportJobDto getReport(String reportId) {
        return null;
    }
}
