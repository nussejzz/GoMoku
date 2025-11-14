package com.user.util;

import javax.crypto.Cipher;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

public final class RsaCryptoUtil {
    private static final String PUBLIC_KEY_RESOURCE = "/rsa-public.pem";
    private static final String PRIVATE_KEY_RESOURCE = "/rsa-private.pem";

    private static volatile PublicKey cachedPublicKey = null;
    private static volatile PrivateKey cachedPrivateKey = null;
    private static volatile String cachedPublicKeyPem = null;

    public static String encrypt(String plainText) throws Exception {
        PublicKey publicKey = getPublicKey();
        Cipher cipher = Cipher.getInstance("RSA");
        cipher.init(Cipher.ENCRYPT_MODE, publicKey);
        byte[] encryptedBytes = cipher.doFinal(plainText.getBytes("UTF-8"));
        return Base64.getEncoder().encodeToString(encryptedBytes);
    }

    public static String decryptWith(String encryptedBase64) throws Exception {
        PrivateKey privateKey = getPrivateKey();
        Cipher cipher = Cipher.getInstance("RSA");
        cipher.init(Cipher.DECRYPT_MODE, privateKey);
        byte[] decryptedBytes = cipher.doFinal(Base64.getDecoder().decode(encryptedBase64));
        return new String(decryptedBytes, "UTF-8");
    }

    public static String getPublicKeyPem() throws Exception {
        if (cachedPublicKeyPem == null) {
            synchronized (RsaCryptoUtil.class) {
                if (cachedPublicKeyPem == null) {
                    cachedPublicKeyPem = readPemFromResource(PUBLIC_KEY_RESOURCE);
                }
            }
        }
        return cachedPublicKeyPem;
    }

    private static PublicKey getPublicKey() throws Exception {
        if (cachedPublicKey == null) {
            synchronized (RsaCryptoUtil.class) {
                if (cachedPublicKey == null) {
                    cachedPublicKey = readPublicKeyFromPem();
                }
            }
        }
        return cachedPublicKey;
    }

    private static PrivateKey getPrivateKey() throws Exception {
        if (cachedPrivateKey == null) {
            synchronized (RsaCryptoUtil.class) {
                if (cachedPrivateKey == null) {
                    cachedPrivateKey = readPrivateKeyFromPem();
                }
            }
        }
        return cachedPrivateKey;
    }

    private static PublicKey readPublicKeyFromPem() throws Exception {
        String pem = readPemFromResource(PUBLIC_KEY_RESOURCE);
        String base64 = pem.replaceAll("-----BEGIN PUBLIC KEY-----", "")
                .replaceAll("-----END PUBLIC KEY-----", "")
                .replaceAll("\\s", "");
        byte[] keyBytes = Base64.getDecoder().decode(base64);
        X509EncodedKeySpec spec = new X509EncodedKeySpec(keyBytes);
        KeyFactory kf = KeyFactory.getInstance("RSA");
        return kf.generatePublic(spec);
    }

    private static PrivateKey readPrivateKeyFromPem() throws Exception {
        String pem = readPemFromResource(PRIVATE_KEY_RESOURCE);
        String base64 = pem.replaceAll("-----BEGIN PRIVATE KEY-----", "")
                .replaceAll("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s", "");
        byte[] keyBytes = Base64.getDecoder().decode(base64);
        PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(keyBytes);
        KeyFactory kf = KeyFactory.getInstance("RSA");
        return kf.generatePrivate(spec);
    }

    private static String readPemFromResource(String resourcePath) throws Exception {
        try (java.io.InputStream is = RsaCryptoUtil.class.getResourceAsStream(resourcePath)) {
            if (is == null) {
                throw new IllegalArgumentException("Resource not found: " + resourcePath);
            }
            return new String(is.readAllBytes(), "UTF-8");
        }
    }
}

