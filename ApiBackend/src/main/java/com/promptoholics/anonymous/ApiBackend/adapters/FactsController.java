package com.promptoholics.anonymous.ApiBackend.adapters;

import com.promptoholics.anonymous.ApiBackend.api.FactsApi;
import com.promptoholics.anonymous.ApiBackend.schemas.dtos.FactDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RestController;

@Component
@RestController
public class FactsController implements FactsApi {

    @Override
    public ResponseEntity<FactDto> getRandomFact(String locale) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }
}
