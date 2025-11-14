package com.user.controller;

import com.user.service.UserInfoService;
import com.user.vo.response.ApiResult;
import com.user.vo.response.UserInfoResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@Tag(name = "用户信息", description = "用户信息查询相关接口")
public class UserInfoController {
    private final UserInfoService userInfoService;

    @GetMapping("/{userId}")
    @Operation(summary = "获取用户信息", description = "根据用户ID获取用户详细信息")
    public ApiResult<UserInfoResponse> getUserInfoById(@PathVariable Long userId) {
        UserInfoResponse response = userInfoService.getUserInfoById(userId);
        return ApiResult.success(response);
    }
}

