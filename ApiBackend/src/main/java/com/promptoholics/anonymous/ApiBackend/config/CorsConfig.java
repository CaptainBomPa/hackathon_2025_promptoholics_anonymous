package com.promptoholics.anonymous.ApiBackend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS Configuration for the API Backend
 * Allows frontend applications to make requests to the backend
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Value("${cors.allowed-origins:http://localhost:3000,http://localhost:3001,http://emerytura.fmroz.me}")
    private String allowedOrigins;

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")  // dla wszystkich endpointów
                        .allowedOrigins(allowedOrigins.split(",")) // localhost + produkcja
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(false); // ustaw true jeśli używasz cookies / auth headerów
            }
        };
    }
}