package com.promptoholics.anonymous.ApiBackend.adapters;

import com.promptoholics.anonymous.ApiBackend.api.AdministrationApi;
import com.promptoholics.anonymous.ApiBackend.application.AdministrationFacade;
import com.promptoholics.anonymous.ApiBackend.schemas.dtos.AdminReportCreateRequestDto;
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
    public ResponseEntity<Resource> generateAdminReport(AdminReportCreateRequestDto reportCreateRequestDto) {
        var response = administrationFacade.generateAdminReport(reportCreateRequestDto);
        return ResponseEntity.ok(response);
    }
}
