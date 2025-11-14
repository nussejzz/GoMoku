package com.user.vo.request;

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
public class UserRegisterRequest {
    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Invalid email format")
    @Size(max = 128, message = "Email length cannot exceed 128 characters")
    private String email;

    @NotBlank(message = "Nickname cannot be blank")
    @Size(min = 2, max = 64, message = "Nickname length must be between 2 and 64 characters")
    private String nickname;

    @NotBlank(message = "Password cannot be blank")
    private String encryptedPassword;

    @Size(max = 255, message = "Avatar URL length cannot exceed 255 characters")
    private String avatarUrl;

    private String avatarBase64;

    @Size(max = 64, message = "Country length cannot exceed 64 characters")
    private String country;

    private Byte gender;

    @Size(min = 6, max = 6, message = "Verification code must be 6 digits")
    private String verificationCode;
}

