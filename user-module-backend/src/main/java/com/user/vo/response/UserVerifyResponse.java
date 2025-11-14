package com.user.vo.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserVerifyResponse {
    private Long userId;
    private String email;
    private String nickname;
    private Boolean valid;
}

