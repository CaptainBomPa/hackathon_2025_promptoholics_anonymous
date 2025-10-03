package com.promptoholics.anonymous.springai.service;

import com.promptoholics.anonymous.springai.dto.ChatRequest;
import com.promptoholics.anonymous.springai.dto.ChatResponse;
import com.promptoholics.anonymous.springai.tools.WeatherTool;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.model.function.FunctionCallback;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AiService {

    private final ChatModel chatModel;
    private final WeatherTool weatherTool;

    @Value("${spring.ai.openai.chat.options.model}")
    private String modelName;

    public ChatResponse chat(ChatRequest request) {
        // Generate session ID if not provided
        String sessionId = request.getSessionId() != null
            ? request.getSessionId()
            : UUID.randomUUID().toString();

        // Create prompt with function calling enabled
        var options = org.springframework.ai.openai.OpenAiChatOptions.builder()
                .withFunctionCallbacks(List.of(
                    FunctionCallback.builder()
                        .function("getWeather", weatherTool)
                        .inputType(WeatherTool.Request.class)
                        .build()
                ))
                .build();

        Prompt prompt = new Prompt(request.getMessage(), options);
        String aiResponse = chatModel.call(prompt).getResult().getOutput().getContent();

        // Build and return response
        return ChatResponse.builder()
                .response(aiResponse)
                .sessionId(sessionId)
                .timestamp(LocalDateTime.now())
                .model(modelName)
                .build();
    }
}
