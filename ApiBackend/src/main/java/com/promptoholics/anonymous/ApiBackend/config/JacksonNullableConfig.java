package com.promptoholics.anonymous.ApiBackend.config;

import com.fasterxml.jackson.databind.Module;
import org.openapitools.jackson.nullable.JsonNullableModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonNullableConfig {

    @Bean
    public Module jsonNullableModule() {
        // Rejestruje wsparcie dla org.openapitools.jackson.nullable.JsonNullable
        return new JsonNullableModule();
    }
}