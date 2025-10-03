package com.promptoholics.anonymous.springai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {

    private String response;
    private String sessionId;
    private LocalDateTime timestamp;
    private String model;
}
