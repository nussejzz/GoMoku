package com.user.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class User {
    private Long id;
    private String email;
    private String nickname;
    private String passwordHash;
    private String passwordSalt;
    private String avatarUrl;
    private String avatarBase64;
    private String country;
    private Byte gender;
    private Byte status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

