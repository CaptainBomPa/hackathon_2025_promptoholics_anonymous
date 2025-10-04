package com.promptoholics.anonymous.ApiBackend.adapters;

import com.promptoholics.anonymous.ApiBackend.api.FactsApi;
import com.promptoholics.anonymous.ApiBackend.application.FactsFacade;
import com.promptoholics.anonymous.ApiBackend.schemas.dtos.FactDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RestController;

@Component
@RestController
@RequiredArgsConstructor
@Slf4j
public class FactsController implements FactsApi {

    private final FactsFacade factsFacade;

    @Override
    public ResponseEntity<FactDto> getRandomFact(String locale) {
        log.info("[REQUEST] getRandomFact");
        return ResponseEntity.ok(factsFacade.getRandomFact(locale));
    }
}
