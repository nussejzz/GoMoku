package com.user.service;

import com.user.entity.User;
import com.user.entity.UserToken;
import com.user.exception.BusinessException;
import com.user.util.JwtTokenUtil;
import com.user.util.PasswordHashUtil;
import com.user.util.RsaCryptoUtil;
import com.user.vo.request.UserLoginRequest;
import com.user.vo.request.UserRegisterRequest;
import com.user.vo.request.UserResetPasswordRequest;
import com.user.vo.response.UserLoginResponse;
import com.user.vo.response.UserRegisterResponse;
import com.user.vo.response.UserVerifyResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserLoginService {
    private final UserService userService;
    private final UserTokenService userTokenService;
    private final EmailService emailService;

    @Value("${jwt.expiration:86400000}")
    private Long jwtExpiration;

    public String publicKey() {
        try {
            return RsaCryptoUtil.getPublicKeyPem();
        } catch (Exception e) {
            log.error("Failed to get public key", e);
            throw new BusinessException(500, "获取公钥失败");
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public UserRegisterResponse register(UserRegisterRequest request) {
        log.info("User registration started: email={}, nickname={}", request.getEmail(), request.getNickname());

        // Verify email code
        if (!emailService.verifyCode(request.getEmail(), request.getVerificationCode())) {
            log.warn("Email verification failed for email={}", request.getEmail());
            throw new BusinessException(400, "验证码无效或已过期");
        }

        // Check email uniqueness
        if (userService.existsByEmail(request.getEmail())) {
            throw new BusinessException(400, "邮箱已被注册");
        }

        // Check nickname uniqueness
        if (userService.existsByNickname(request.getNickname())) {
            throw new BusinessException(400, "昵称已被使用");
        }

        // Decrypt password
        String plainPassword;
        try {
            plainPassword = PasswordHashUtil.decryptPassword(request.getEncryptedPassword());
        } catch (Exception e) {
            log.warn("Failed to decrypt password during registration: email={}", request.getEmail());
            throw new BusinessException(400, "密码解密失败");
        }

        // Generate salt and hash password
        String salt = PasswordHashUtil.generateSalt();
        String passwordHash = PasswordHashUtil.hashPassword(plainPassword, salt);

        // Create user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setNickname(request.getNickname());
        user.setPasswordHash(passwordHash);
        user.setPasswordSalt(salt);
        user.setAvatarUrl(request.getAvatarUrl() != null ? request.getAvatarUrl() : "");
        user.setAvatarBase64(request.getAvatarBase64() != null ? request.getAvatarBase64() : "");
        user.setCountry(request.getCountry() != null ? request.getCountry() : "");
        user.setGender(request.getGender() != null ? request.getGender() : (byte) 0);
        user.setStatus((byte) 1);

        Long userId = userService.save(user);
        if (userId == null) {
            throw new BusinessException(500, "用户保存失败");
        }

        // Get saved user
        User savedUser = userService.findById(userId);
        if (savedUser == null) {
            throw new BusinessException(500, "获取用户信息失败");
        }

        // Generate tokens
        String refreshToken = UUID.randomUUID().toString();
        UserToken userToken = new UserToken();
        userToken.setUserId(savedUser.getId());
        userToken.setRefreshToken(refreshToken);
        userToken.setExpiresAt(LocalDateTime.now().plusDays(7));
        userTokenService.saveOrUpdate(userToken);

        String token = JwtTokenUtil.generateToken(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getNickname(),
                refreshToken,
                jwtExpiration
        );

        log.info("User registration completed successfully: userId={}, email={}", savedUser.getId(), savedUser.getEmail());

        return UserRegisterResponse.builder()
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .nickname(savedUser.getNickname())
                .avatarUrl(savedUser.getAvatarUrl())
                .country(savedUser.getCountry())
                .gender(savedUser.getGender())
                .status(savedUser.getStatus())
                .createdAt(savedUser.getCreatedAt())
                .token(token)
                .build();
    }

    public UserLoginResponse login(UserLoginRequest request) {
        log.info("User login started: username={}", request.getUsername());

        // Find user by email or nickname
        User user = userService.findByEmail(request.getUsername());
        if (user == null) {
            user = userService.findByNickname(request.getUsername());
        }

        if (user == null) {
            throw new BusinessException(404, "用户不存在");
        }

        // Check account status
        if (user.getStatus() != 1) {
            throw new BusinessException(403, "账户未激活");
        }

        // Decrypt password
        String plainPassword;
        try {
            plainPassword = PasswordHashUtil.decryptPassword(request.getEncryptedPassword());
        } catch (Exception e) {
            log.warn("Failed to decrypt password during login: username={}", request.getUsername());
            throw new BusinessException(400, "密码解密失败");
        }

        // Verify password
        boolean passwordMatches = PasswordHashUtil.verifyPassword(
                plainPassword,
                user.getPasswordHash(),
                user.getPasswordSalt()
        );

        if (!passwordMatches) {
            log.warn("Invalid password for userId={}", user.getId());
            throw new BusinessException(401, "密码错误");
        }

        // Generate tokens
        String refreshToken = UUID.randomUUID().toString();
        UserToken userToken = new UserToken();
        userToken.setUserId(user.getId());
        userToken.setRefreshToken(refreshToken);
        userToken.setExpiresAt(LocalDateTime.now().plusDays(7));
        userTokenService.saveOrUpdate(userToken);

        String token = JwtTokenUtil.generateToken(
                user.getId(),
                user.getEmail(),
                user.getNickname(),
                refreshToken,
                jwtExpiration
        );

        log.info("User login completed successfully: userId={}, email={}", user.getId(), user.getEmail());

        return UserLoginResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .avatarUrl(user.getAvatarUrl())
                .token(token)
                .build();
    }

    public UserVerifyResponse verify(String authorization) {
        if (authorization == null || authorization.isEmpty()) {
            return UserVerifyResponse.builder().valid(false).build();
        }

        // Remove "Bearer " prefix if present
        String token = authorization;
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        // Extract userId from JWT
        Long userId = JwtTokenUtil.extractUserId(token);
        if (userId == null) {
            return UserVerifyResponse.builder().valid(false).build();
        }

        // Get refresh token from database
        UserToken userToken = userTokenService.findByUserId(userId);
        if (userToken == null) {
            return UserVerifyResponse.builder().valid(false).build();
        }

        // Check expiration
        if (userToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            return UserVerifyResponse.builder().valid(false).build();
        }

        // Verify JWT signature
        Long verifiedUserId = JwtTokenUtil.verifyToken(token, userToken.getRefreshToken());
        if (verifiedUserId == null || !verifiedUserId.equals(userId)) {
            return UserVerifyResponse.builder().valid(false).build();
        }

        // Get user info
        User user = userService.findById(userId);
        if (user == null) {
            return UserVerifyResponse.builder().valid(false).build();
        }

        return UserVerifyResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .valid(true)
                .build();
    }

    @Transactional(rollbackFor = Exception.class)
    public void resetPassword(UserResetPasswordRequest request) {
        log.info("Password reset started for email={}", request.getEmail());

        User user = userService.findByEmail(request.getEmail());
        if (user == null) {
            throw new BusinessException(404, "用户不存在");
        }

        // Verify email code
        if (!emailService.verifyCode(request.getEmail(), request.getVerificationCode())) {
            throw new BusinessException(400, "验证码无效或已过期");
        }

        // Decrypt new password
        String plainNewPassword;
        try {
            plainNewPassword = PasswordHashUtil.decryptPassword(request.getEncryptedNewPassword());
        } catch (Exception e) {
            throw new BusinessException(400, "密码解密失败");
        }

        // Generate new salt and hash
        String newSalt = PasswordHashUtil.generateSalt();
        String newPasswordHash = PasswordHashUtil.hashPassword(plainNewPassword, newSalt);

        // Update user
        user.setPasswordHash(newPasswordHash);
        user.setPasswordSalt(newSalt);
        userService.update(user);

        // Delete user token to force re-login
        userTokenService.deleteByUserId(user.getId());

        log.info("Password reset completed successfully for userId={}, email={}", user.getId(), user.getEmail());
    }

    @Transactional
    public void logout(Long userId) {
        log.info("User logout started for userId={}", userId);
        userTokenService.deleteByUserId(userId);
        log.info("User logout completed successfully for userId={}", userId);
    }
}

