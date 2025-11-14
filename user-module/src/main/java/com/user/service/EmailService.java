package com.user.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.security.SecureRandom;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class EmailService {
    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.mail.verify-switch-off:true}")
    private boolean verifySwitchOff;

    @Value("${spring.mail.from:}")
    private String fromEmail;

    // 内存存储作为Redis的备选方案（用于开发模式）
    private final Map<String, CodeInfo> memoryStorage = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    private volatile boolean redisAvailable = true;
    
    @PostConstruct
    public void init() {
        log.info("EmailService 初始化完成，verify-switch-off: {}", verifySwitchOff);
        // 测试Redis连接
        testRedisConnection();
        // 测试邮件服务
        testMailService();
        // 启动清理任务，每5分钟清理过期的内存验证码
        scheduler.scheduleAtFixedRate(this::cleanExpiredCodes, 5, 5, TimeUnit.MINUTES);
    }
    
    /**
     * 测试邮件服务配置
     */
    private void testMailService() {
        if (mailSender != null) {
            log.info("邮件服务已配置，使用QQ邮箱SMTP发送邮件");
            log.info("发件人邮箱: {}", fromEmail != null && !fromEmail.isEmpty() ? fromEmail : "3388609154@qq.com");
        } else {
            log.warn("邮件服务未配置（JavaMailSender为null），将无法发送邮件");
        }
        
        if (verifySwitchOff) {
            log.info("当前为开发模式，验证码将显示在日志中，不发送邮件");
        } else {
            log.info("当前为生产模式，验证码将通过QQ邮件发送");
        }
    }
    
    /**
     * 测试Redis连接
     */
    private void testRedisConnection() {
        try {
            redisTemplate.opsForValue().set("test:connection", "test", 1, TimeUnit.SECONDS);
            redisTemplate.delete("test:connection");
            redisAvailable = true;
            log.info("Redis连接测试成功，将使用Redis存储验证码");
        } catch (Exception e) {
            redisAvailable = false;
            log.warn("Redis连接测试失败，将使用内存存储验证码: {}", e.getMessage());
            if (!verifySwitchOff) {
                log.error("生产模式下Redis不可用，这将导致验证码功能异常！");
            }
        }
    }
    
    /**
     * 清理过期的内存验证码
     */
    private void cleanExpiredCodes() {
        long now = System.currentTimeMillis();
        memoryStorage.entrySet().removeIf(entry -> entry.getValue().isExpired(now));
    }
    
    /**
     * 验证码信息类
     */
    private static class CodeInfo {
        private final String code;
        final long expireTime;  // 改为包可见，用于日志
        
        public CodeInfo(String code, long expireTime) {
            this.code = code;
            this.expireTime = expireTime;
        }
        
        public boolean isExpired(long currentTime) {
            return currentTime > expireTime;
        }
        
        public boolean matches(String inputCode) {
            return code != null && code.equals(inputCode != null ? inputCode.trim() : null);
        }
    }

    public void sendVerificationCode(String email) {
        log.info("开始生成验证码，邮箱: {}", email);
        log.info("verifySwitchOff 配置值: {}", verifySwitchOff);
        
        String code = generateCode();
        String storageKey = "email:verify:" + email;
        boolean stored = false;
        
        // 尝试存储到Redis
        if (redisAvailable) {
            try {
                log.info("验证码已生成，开始存储到Redis，Key: {}", storageKey);
                redisTemplate.opsForValue().set(storageKey, code != null ? code : "", 5, TimeUnit.MINUTES);
                log.info("验证码已存储到Redis，有效期: 5分钟");
                stored = true;
            } catch (Exception e) {
                log.warn("Redis存储失败，将使用内存存储: {}", e.getMessage());
                redisAvailable = false;
                // 继续使用内存存储
            }
        }
        
        // 如果Redis不可用或存储失败，使用内存存储（双重存储确保可靠性）
        long expireTime = System.currentTimeMillis() + 5 * 60 * 1000; // 5分钟后过期
        memoryStorage.put(storageKey, new CodeInfo(code, expireTime));
        if (!stored) {
            log.info("验证码已存储到内存，有效期: 5分钟");
        } else {
            log.info("验证码同时存储到内存作为备份，有效期: 5分钟");
        }
        
        if (verifySwitchOff) {
            // 开发模式：验证码在日志中输出
            log.info("");
            log.info("========================================");
            log.info("===== 开发模式：验证码已生成 =====");
            log.info("邮箱: {}", email);
            log.info("验证码: {}", code);
            log.info("验证码有效期: 5分钟");
            log.info("存储方式: {}", redisAvailable ? "Redis" : "内存");
            log.info("存储Key: {}", storageKey);
            log.info("========================================");
            log.info("");
            return;
        }

        log.info("生产模式：开始发送邮件，邮箱: {}", email);
        sendEmail(email, code);
    }

    public boolean verifyCode(String email, String code) {
        if (email == null || code == null || code.trim().isEmpty()) {
            log.warn("验证码验证失败：邮箱或验证码为空");
            return false;
        }
        
        String storageKey = "email:verify:" + email;
        
        // 首先尝试从Redis获取
        if (redisAvailable) {
            try {
                String storedCode = redisTemplate.opsForValue().get(storageKey);
                if (storedCode != null && !storedCode.isEmpty()) {
                    boolean matches = storedCode.equals(code.trim());
                    if (matches) {
                        // 验证成功，删除Redis和内存中的验证码
                        redisTemplate.delete(storageKey);
                        memoryStorage.remove(storageKey);
                        log.info("验证码验证成功（Redis），邮箱: {}", email);
                    } else {
                        log.warn("验证码不匹配（Redis），邮箱: {}，期望: {}，实际: {}", email, storedCode, code);
                    }
                    return matches;
                }
                // Redis中没有，继续检查内存存储
            } catch (Exception e) {
                log.warn("Redis读取失败，尝试从内存读取: {}", e.getMessage());
                redisAvailable = false;
                // 继续使用内存存储
            }
        }
        
        // 从内存存储获取
        CodeInfo codeInfo = memoryStorage.get(storageKey);
        if (codeInfo == null) {
            log.warn("验证码未找到或已过期，邮箱: {}", email);
            return false;
        }
        
        // 检查是否过期
        long currentTime = System.currentTimeMillis();
        if (codeInfo.isExpired(currentTime)) {
            memoryStorage.remove(storageKey);
            log.warn("验证码已过期，邮箱: {}，过期时间: {}，当前时间: {}", email, 
                    codeInfo.expireTime, currentTime);
            return false;
        }
        
        // 验证验证码
        boolean matches = codeInfo.matches(code.trim());
        if (matches) {
            // 验证成功，删除内存和Redis中的验证码
            memoryStorage.remove(storageKey);
            if (redisAvailable) {
                try {
                    redisTemplate.delete(storageKey);
                } catch (Exception e) {
                    log.warn("删除Redis验证码失败: {}", e.getMessage());
                }
            }
            log.info("验证码验证成功（内存），邮箱: {}", email);
        } else {
            log.warn("验证码不匹配（内存），邮箱: {}，输入的验证码: {}", email, code);
        }
        
        return matches;
    }

    private String generateCode() {
        SecureRandom random = new SecureRandom();
        int num = 100000 + random.nextInt(900000);
        return String.valueOf(num);
    }

    /**
     * 使用QQ邮箱SMTP发送验证码邮件
     */
    private void sendEmail(String toEmail, String code) {
        if (mailSender == null) {
            log.error("JavaMailSender 未配置，无法发送邮件");
            log.info("===== 验证码（邮件服务未配置，显示在日志中）=====");
            log.info("邮箱: {}", toEmail);
            log.info("验证码: {}", code);
            log.info("验证码有效期: 5分钟");
            log.info("================================================");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail != null && !fromEmail.isEmpty() ? fromEmail : "3388609154@qq.com");
            message.setTo(toEmail);
            message.setSubject("用户模块验证码");
            message.setText("您的验证码是: " + code + "\n\n验证码有效期为 5 分钟，请勿泄露给他人。\n\n如果这不是您的操作，请忽略此邮件。");
            
            mailSender.send(message);
            log.info("QQ邮件发送成功，邮箱: {}", toEmail);
        } catch (Exception e) {
            log.error("发送QQ邮件失败，邮箱: {}, 错误: {}", toEmail, e.getMessage(), e);
            // 发送失败时，将验证码输出到日志，方便调试
            log.info("===== 验证码（邮件发送失败，显示在日志中）=====");
            log.info("邮箱: {}", toEmail);
            log.info("验证码: {}", code);
            log.info("验证码有效期: 5分钟");
            log.info("错误信息: {}", e.getMessage());
            log.info("================================================");
            // 不抛出异常，让验证码仍然可以验证（虽然邮件未发送）
        }
    }
}

