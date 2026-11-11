package com.mrworldthemetour.backend.voice;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/voice/products")
public class VoiceSearchController {

    private final VoiceSearchService voiceSearchService;

    public VoiceSearchController(VoiceSearchService voiceSearchService) {
        this.voiceSearchService = voiceSearchService;
    }

    @PostMapping("/search")
    public VoiceSearchDto.Response search(@Valid @RequestBody VoiceSearchDto.Request request) {
        return voiceSearchService.search(request.transcript());
    }
}
