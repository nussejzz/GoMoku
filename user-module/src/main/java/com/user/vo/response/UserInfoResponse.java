package com.user.vo.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserInfoResponse {
    private Long userId;
    private String email;
    private String nickname;
    private String avatarUrl;
    private String country;
    private Byte gender;
    private Byte status;
    private LocalDateTime createdAt;
}

