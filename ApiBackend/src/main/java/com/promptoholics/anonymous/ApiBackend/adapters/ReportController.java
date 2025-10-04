package com.promptoholics.anonymous.ApiBackend.adapters;

import com.promptoholics.anonymous.ApiBackend.api.ReportApi;
import com.promptoholics.anonymous.ApiBackend.application.ReportFacade;
import com.promptoholics.anonymous.ApiBackend.schemas.dtos.ReportJobDto;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RestController;

@Component
@RestController
@RequiredArgsConstructor
public class ReportController implements ReportApi {

    private final ReportFacade reportFacade;

    @Override
    public ResponseEntity<Resource> downloadReport(String reportId) {
        return ResponseEntity.ok(reportFacade.downoloadReport(reportId));
    }

    @Override
    public ResponseEntity<ReportJobDto> getReport(String reportId) {
        return ResponseEntity.ok(reportFacade.getReport(reportId));
    }
}
