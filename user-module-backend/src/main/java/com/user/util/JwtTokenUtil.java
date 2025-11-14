package com.user.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Slf4j
public class JwtTokenUtil {
    private static final Long DEFAULT_EXPIRATION = 86400000L; // 24 hours

    public static String generateToken(Long userId, String email, String nickname, String refreshToken, Long expiration) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("email", email);
        claims.put("nickname", nickname);

        Date now = new Date();
        Date expirationDate = new Date(now.getTime() + (expiration != null ? expiration : DEFAULT_EXPIRATION));

        SecretKey signingKey = createSigningKey(refreshToken);

        String token = Jwts.builder()
                .claims(claims)
                .subject(String.valueOf(userId))
                .issuedAt(now)
                .expiration(expirationDate)
                .signWith(signingKey)
                .compact();

        log.debug("Generated JWT token for userId={}, expiresAt={}", userId, expirationDate);
        return token;
    }

    public static Long verifyToken(String token, String refreshToken) {
        try {
            SecretKey signingKey = createSigningKey(refreshToken);

            Claims claims = Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            if (claims.getExpiration().before(new Date())) {
                log.warn("Token expired");
                return null;
            }

            Long userId = claims.get("userId", Long.class);
            log.debug("Token verified successfully for userId={}", userId);
            return userId;
        } catch (io.jsonwebtoken.security.SignatureException e) {
            log.warn("Token signature verification failed: {}", e.getMessage());
            return null;
        } catch (Exception e) {
            log.warn("Token verification failed: {}", e.getMessage());
            return null;
        }
    }

    public static Long extractUserId(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                log.warn("Invalid JWT format");
                return null;
            }

            String payload = new String(java.util.Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);

            int userIdIndex = payload.indexOf("\"userId\":");
            if (userIdIndex == -1) {
                log.warn("userId not found in JWT payload");
                return null;
            }

            int startIndex = userIdIndex + "\"userId\":".length();
            int endIndex = payload.indexOf(",", startIndex);
            if (endIndex == -1) {
                endIndex = payload.indexOf("}", startIndex);
            }

            String userIdStr = payload.substring(startIndex, endIndex).trim();
            Long userId = Long.parseLong(userIdStr);

            log.debug("Extracted userId={} from JWT without verification", userId);
            return userId;
        } catch (Exception e) {
            log.warn("Failed to extract userId from token: {}", e.getMessage());
            return null;
        }
    }

    private static SecretKey createSigningKey(String refreshToken) {
        String keyMaterial = refreshToken;
        while (keyMaterial.getBytes(StandardCharsets.UTF_8).length < 32) {
            keyMaterial = keyMaterial + refreshToken;
        }
        byte[] keyBytes = keyMaterial.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}

