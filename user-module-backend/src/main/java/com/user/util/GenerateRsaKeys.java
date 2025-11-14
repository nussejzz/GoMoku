package com.user.util;

import java.io.File;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.util.Base64;
import java.nio.file.Files;

/**
 * 工具类：生成RSA密钥对
 * 运行此类的main方法可以生成RSA公钥和私钥文件
 */
public class GenerateRsaKeys {
    public static void main(String[] args) {
        try {
            generateRsaKeys();
        } catch (Exception e) {
            System.err.println("生成RSA密钥对失败: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }

    public static void generateRsaKeys() throws Exception {
        // 生成2048位RSA密钥对
        KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
        keyPairGenerator.initialize(2048);
        KeyPair keyPair = keyPairGenerator.generateKeyPair();

        PublicKey publicKey = keyPair.getPublic();
        PrivateKey privateKey = keyPair.getPrivate();

        // 转换为PEM格式
        String publicKeyPem = formatPublicKey(publicKey);
        String privateKeyPem = formatPrivateKey(privateKey);

        // 获取项目根目录
        String projectRoot = System.getProperty("user.dir");
        String resourcesPath = projectRoot + File.separator + "src" + File.separator + "main" + File.separator + "resources";
        
        // 确保目录存在
        File resourcesDir = new File(resourcesPath);
        if (!resourcesDir.exists()) {
            boolean created = resourcesDir.mkdirs();
            if (!created) {
                throw new Exception("无法创建目录: " + resourcesPath);
            }
        }

        // 写入文件
        File publicKeyFile = new File(resourcesDir, "rsa-public.pem");
        File privateKeyFile = new File(resourcesDir, "rsa-private.pem");
        
        Files.write(publicKeyFile.toPath(), publicKeyPem.getBytes("UTF-8"));
        Files.write(privateKeyFile.toPath(), privateKeyPem.getBytes("UTF-8"));

        System.out.println("========================================");
        System.out.println("RSA密钥对生成成功！");
        System.out.println("密钥文件目录: " + resourcesDir.getAbsolutePath());
        System.out.println("公钥文件: rsa-public.pem");
        System.out.println("私钥文件: rsa-private.pem");
        System.out.println("========================================");
    }

    private static String formatPublicKey(PublicKey publicKey) {
        byte[] encoded = publicKey.getEncoded();
        String base64 = Base64.getEncoder().encodeToString(encoded);
        StringBuilder pem = new StringBuilder();
        pem.append("-----BEGIN PUBLIC KEY-----\n");
        // 每64个字符换行
        for (int i = 0; i < base64.length(); i += 64) {
            pem.append(base64.substring(i, Math.min(i + 64, base64.length())));
            pem.append("\n");
        }
        pem.append("-----END PUBLIC KEY-----\n");
        return pem.toString();
    }

    private static String formatPrivateKey(PrivateKey privateKey) {
        byte[] encoded = privateKey.getEncoded();
        String base64 = Base64.getEncoder().encodeToString(encoded);
        StringBuilder pem = new StringBuilder();
        pem.append("-----BEGIN PRIVATE KEY-----\n");
        // 每64个字符换行
        for (int i = 0; i < base64.length(); i += 64) {
            pem.append(base64.substring(i, Math.min(i + 64, base64.length())));
            pem.append("\n");
        }
        pem.append("-----END PRIVATE KEY-----\n");
        return pem.toString();
    }
}

