package com.user.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserToken {
    private Long id;
    private Long userId;
    private String refreshToken;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

