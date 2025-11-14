package com.user.controller;

import com.user.service.EmailService;
import com.user.vo.response.ApiResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/email")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "邮箱服务", description = "邮箱验证码发送相关接口")
public class EmailController {
    private final EmailService emailService;

    @PostMapping("/send-verification-code")
    @Operation(summary = "发送验证码", description = "向指定邮箱发送验证码")
    public ApiResult<Void> sendVerificationCode(@RequestParam String email) {
        log.info("收到发送验证码请求，邮箱: {}", email);
        emailService.sendVerificationCode(email);
        log.info("验证码发送成功，邮箱: {}", email);
        return ApiResult.success();
    }
}

