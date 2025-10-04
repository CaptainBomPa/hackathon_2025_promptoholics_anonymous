package com.promptoholics.anonymous.ApiBackend.adapters;

import com.promptoholics.anonymous.ApiBackend.api.AdministrationApi;
import com.promptoholics.anonymous.ApiBackend.schemas.dtos.ReportCreateRequestDto;
import com.promptoholics.anonymous.ApiBackend.schemas.dtos.ReportJobDto;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RestController;

@Component
@RestController
public class AdministrationController implements AdministrationApi {

    @Override
    public ResponseEntity<Resource> downloadAdminReport(String reportId) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }

    @Override
    public ResponseEntity<ReportJobDto> generateAdminReport(@Valid ReportCreateRequestDto reportCreateRequestDto) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }

    @Override
    public ResponseEntity<ReportJobDto> getAdminReport(String reportId) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }
}
