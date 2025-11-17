package com.user.vo.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserResetPasswordRequest {
    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Verification code cannot be blank")
    @Size(min = 6, max = 6, message = "Verification code must be 6 digits")
    @JsonAlias({"verificationCode", "code", "verifyCode"})
    private String verificationCode;

    @NotBlank(message = "New password cannot be blank")
    @JsonProperty("encryptedNewPassword")
    @JsonAlias({"encryptedNewPassword", "newPassword", "password", "encryptedPassword"})
    private String encryptedNewPassword;
}

