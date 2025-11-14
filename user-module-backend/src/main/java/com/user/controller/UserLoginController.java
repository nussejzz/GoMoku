package com.user.controller;

import com.user.service.UserLoginService;
import com.user.vo.request.UserLoginRequest;
import com.user.vo.request.UserRegisterRequest;
import com.user.vo.request.UserResetPasswordRequest;
import com.user.vo.response.ApiResult;
import com.user.vo.response.UserLoginResponse;
import com.user.vo.response.UserRegisterResponse;
import com.user.vo.response.UserVerifyResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping
@RequiredArgsConstructor
@Slf4j
@Tag(name = "用户认证", description = "用户注册、登录、登出等认证相关接口")
public class UserLoginController {
    private final UserLoginService userLoginService;

    @GetMapping("/")
    @Operation(summary = "API信息", description = "获取用户模块API信息")
    public ApiResult<String> index() {
        return ApiResult.success("User Module API is running. Available endpoints: GET /public-key, POST /register, POST /login, GET /verify, POST /reset-password, POST /logout, POST /email/send-verification-code, GET /user/{userId}");
    }

    @GetMapping("/public-key")
    @Operation(summary = "获取RSA公钥", description = "获取用于密码加密的RSA公钥")
    public ApiResult<String> publicKey() throws Exception {
        String publicKey = userLoginService.publicKey();
        return ApiResult.success(publicKey);
    }

    @PostMapping("/register")
    @Operation(summary = "用户注册", description = "新用户注册接口")
    public ApiResult<UserRegisterResponse> register(@Valid @RequestBody UserRegisterRequest request) {
        UserRegisterResponse response = userLoginService.register(request);
        return ApiResult.success(response);
    }

    @PostMapping("/login")
    @Operation(summary = "用户登录", description = "用户登录接口")
    public ApiResult<UserLoginResponse> login(@Valid @RequestBody UserLoginRequest request) {
        UserLoginResponse response = userLoginService.login(request);
        return ApiResult.success(response);
    }

    @GetMapping("/verify")
    @Operation(summary = "验证Token", description = "验证JWT Token是否有效")
    public ApiResult<UserVerifyResponse> verify(@RequestHeader("Authorization") String authorization) {
        UserVerifyResponse response = userLoginService.verify(authorization);
        return ApiResult.success(response);
    }

    @PostMapping("/reset-password")
    @Operation(summary = "重置密码", description = "通过邮箱验证码重置密码（支持已登录用户验证身份）")
    public ApiResult<Void> resetPassword(
            @Valid @RequestBody UserResetPasswordRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        userLoginService.resetPassword(request, authorization);
        return ApiResult.success();
    }

    @PostMapping("/logout")
    @Operation(summary = "用户登出", description = "用户登出接口，清除Token（需要提供有效的Token）")
    public ApiResult<Void> logout(@RequestHeader("Authorization") String authorization) {
        userLoginService.logout(authorization);
        return ApiResult.success();
    }
}

