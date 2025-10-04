package com.promptoholics.anonymous.ApiBackend.adapters.inbound;

import com.promptoholics.anonymous.ApiBackend.api.FactsApi;
import com.promptoholics.anonymous.ApiBackend.application.FactsFacade;
import com.promptoholics.anonymous.ApiBackend.schemas.dtos.FactDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RestController;

@Component
@RestController
@RequiredArgsConstructor
public class FactsController implements FactsApi {

    private final FactsFacade factsFacade;

    @Override
    public ResponseEntity<FactDto> getRandomFact(String locale) {
        var response = factsFacade.getRandomFact(locale);
        return ResponseEntity.ok(response);
    }
}
