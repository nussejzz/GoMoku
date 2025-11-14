package com.user.service;

import com.user.entity.User;
import com.user.vo.response.UserInfoResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserInfoService {
    private final UserService userService;

    public UserInfoResponse getUserInfoById(Long userId) {
        User user = userService.findById(userId);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        return UserInfoResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .avatarUrl(user.getAvatarUrl())
                .country(user.getCountry())
                .gender(user.getGender())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .build();
    }
}

