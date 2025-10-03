package com.promptoholics.anonymous.springai.tools;

import org.springframework.context.annotation.Description;
import org.springframework.stereotype.Component;

import java.util.function.Function;

@Component
@Description("Get weather information for a specific city")
public class WeatherTool implements Function<WeatherTool.Request, WeatherTool.Response> {

    public record Request(
        @Description("The city name to get weather for") String city
    ) {}

    public record Response(
        String city,
        String temperature,
        String condition,
        String humidity,
        String windSpeed
    ) {}

    @Override
    public Response apply(Request request) {
        // Hardcoded weather responses for demo purposes
        return switch (request.city().toLowerCase()) {
            case "kraków", "krakow" -> new Response(
                "Kraków",
                "15°C",
                "Partly cloudy",
                "65%",
                "12 km/h"
            );
            case "warszawa", "warsaw" -> new Response(
                "Warszawa",
                "18°C",
                "Sunny",
                "55%",
                "8 km/h"
            );
            case "gdańsk", "gdansk" -> new Response(
                "Gdańsk",
                "12°C",
                "Rainy",
                "80%",
                "25 km/h"
            );
            default -> new Response(
                request.city(),
                "20°C",
                "Clear sky",
                "60%",
                "10 km/h"
            );
        };
    }
}
