package com.user.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.util.UUID;

public class PasswordHashUtil {
    private static final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(12);

    public static String generateSalt() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    public static String hashPassword(String plainPassword, String salt) {
        String saltedPassword = plainPassword + salt;
        return passwordEncoder.encode(saltedPassword);
    }

    public static boolean verifyPassword(String plainPassword, String hashedPassword, String salt) {
        String saltedPassword = plainPassword + salt;
        return passwordEncoder.matches(saltedPassword, hashedPassword);
    }

    public static String decryptPassword(String encryptedPassword) throws Exception {
        return RsaCryptoUtil.decryptWith(encryptedPassword);
    }
}

