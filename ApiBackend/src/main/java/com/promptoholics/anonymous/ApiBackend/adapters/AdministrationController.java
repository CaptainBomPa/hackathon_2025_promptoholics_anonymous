package com.promptoholics.anonymous.ApiBackend.adapters;

import com.promptoholics.anonymous.ApiBackend.api.AdministrationApi;
import com.promptoholics.anonymous.ApiBackend.application.AdministrationFacade;
import com.promptoholics.anonymous.ApiBackend.schemas.dtos.ReportCreateRequestDto;
import com.promptoholics.anonymous.ApiBackend.schemas.dtos.ReportJobDto;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RestController;

@Component
@RestController
@RequiredArgsConstructor
public class AdministrationController implements AdministrationApi {

    private final AdministrationFacade administrationFacade;

    @Override
    public ResponseEntity<Resource> downloadAdminReport(String reportId) {
        var response = administrationFacade.downloadAdminReport(reportId);
        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<ReportJobDto> generateAdminReport(ReportCreateRequestDto reportCreateRequestDto) {
        var response = administrationFacade.generateAdminReport(reportCreateRequestDto);
        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<ReportJobDto> getAdminReport(String reportId) {
        var response = administrationFacade.getAdminReport(reportId);
        return ResponseEntity.ok(response);
    }
}
