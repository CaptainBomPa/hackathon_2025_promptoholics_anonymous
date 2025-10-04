package com.promptoholics.anonymous.ApiBackend.adapters;

import com.promptoholics.anonymous.ApiBackend.api.AdministrationApi;
import com.promptoholics.anonymous.ApiBackend.application.AdministrationFacade;
import com.promptoholics.anonymous.ApiBackend.schemas.dtos.AdminReportCreateRequestDto;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RestController;

@Component
@RestController
@RequiredArgsConstructor
public class AdministrationController implements AdministrationApi {

    private final AdministrationFacade administrationFacade;

    @Override
    public ResponseEntity<Resource> generateAdminReport(AdminReportCreateRequestDto reportCreateRequestDto) {
        ByteArrayResource resource = administrationFacade.generateAdminReport();

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"admin-report.xls\"")
                .contentType(MediaType.parseMediaType("application/vnd.ms-excel"))
                .contentLength(resource.contentLength())
                .body(resource);
    }
}
