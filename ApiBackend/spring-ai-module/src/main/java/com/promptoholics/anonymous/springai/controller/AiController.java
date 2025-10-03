package com.promptoholics.anonymous.springai.controller;

import com.promptoholics.anonymous.springai.dto.ChatRequest;
import com.promptoholics.anonymous.springai.dto.ChatResponse;
import com.promptoholics.anonymous.springai.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AiController {

    private final AiService aiService;

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@Valid @RequestBody ChatRequest request) {
        ChatResponse response = aiService.chat(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Spring AI module is running");
    }
}
