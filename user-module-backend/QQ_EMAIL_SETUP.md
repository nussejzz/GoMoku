# QQ邮箱配置指南

## ✅ 已完成的修改

1. **添加 Spring Mail 依赖**
   - 在 `pom.xml` 中添加了 `spring-boot-starter-mail` 依赖
   - 移除了 SendGrid 依赖（不再需要）

2. **修改 EmailService**
   - 使用 `JavaMailSender` 发送QQ邮件
   - 移除了 SendGrid 相关代码
   - 添加了邮件服务初始化检查

3. **更新配置**
   - 完善了 `application.yaml` 中的QQ邮箱SMTP配置
   - 添加了SSL相关配置
   - 更新了配置说明

## 📋 当前配置

### application.yaml 配置

```yaml
spring:
  mail:
    host: smtp.qq.com
    port: 465  # QQ邮箱SSL端口
    username: 3388609154@qq.com
    password: irdgfajaditpdcbc   # QQ邮箱授权码
    protocol: smtps  # 使用SSL协议
    default-encoding: UTF-8
    properties:
      mail:
        smtp:
          auth: true
          ssl:
            enable: true
            required: true
          socketFactory:
            class: javax.net.ssl.SSLSocketFactory
            port: 465
    from: 3388609154@qq.com

app:
  mail:
    verify-switch-off: false  # false = 生产模式（发送QQ邮件）；true = 开发模式（日志显示）
```

## 🔧 QQ邮箱授权码获取

1. **登录QQ邮箱**
   - 访问 https://mail.qq.com
   - 使用QQ号和密码登录

2. **开启SMTP服务**
   - 点击"设置" → "账户"
   - 找到"POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务"
   - 开启"POP3/SMTP服务"或"IMAP/SMTP服务"

3. **生成授权码**
   - 点击"生成授权码"
   - 按照提示发送短信验证
   - 获取16位授权码（如：`irdgfajaditpdcbc`）
   - **注意：授权码不是QQ密码！**

4. **配置授权码**
   - 将授权码填入 `application.yaml` 中的 `spring.mail.password`
   - 确保 `spring.mail.username` 填写QQ邮箱地址

## 🚀 使用说明

### 开发模式（不发送邮件）

```yaml
app:
  mail:
    verify-switch-off: true  # 开发模式
```

- 验证码会显示在后端日志中
- 不会实际发送邮件
- 适合本地开发测试

### 生产模式（发送QQ邮件）

```yaml
app:
  mail:
    verify-switch-off: false  # 生产模式
```

- 验证码通过QQ邮件发送
- 用户会收到包含验证码的邮件
- 适合生产环境使用

## 🧪 测试邮件发送

### 1. 启动后端服务

```bash
mvn spring-boot:run
```

### 2. 查看启动日志

启动成功后，应该看到：

```
EmailService 初始化完成，verify-switch-off: false
邮件服务已配置，使用QQ邮箱SMTP发送邮件
发件人邮箱: 3388609154@qq.com
当前为生产模式，验证码将通过QQ邮件发送
```

### 3. 发送验证码

- 访问注册页面
- 输入邮箱地址
- 点击"发送验证码"
- 检查邮箱是否收到验证码邮件

### 4. 查看日志

如果邮件发送失败，日志会显示：

```
发送QQ邮件失败，邮箱: xxx@example.com, 错误: ...
验证码（邮件发送失败，显示在日志中）
邮箱: xxx@example.com
验证码: 123456
```

## 🔍 常见问题

### 问题1: 邮件发送失败

**错误信息：**
```
javax.mail.AuthenticationFailedException: 535 Error: authentication failed
```

**解决方案：**
1. 检查QQ邮箱授权码是否正确
2. 确认已开启SMTP服务
3. 确认授权码未过期
4. 检查 `spring.mail.username` 和 `spring.mail.password` 配置

### 问题2: SSL连接失败

**错误信息：**
```
javax.mail.MessagingException: Could not connect to SMTP host
```

**解决方案：**
1. 检查端口配置（应该是465）
2. 确认SSL配置正确
3. 检查防火墙设置
4. 尝试使用TLS（端口587）

### 问题3: 邮件发送超时

**错误信息：**
```
java.net.SocketTimeoutException: Read timed out
```

**解决方案：**
1. 增加超时时间配置
2. 检查网络连接
3. 确认QQ邮箱服务正常

### 问题4: 收不到邮件

**可能原因：**
1. 邮件被归类到垃圾邮件
2. 邮箱地址错误
3. 邮件发送失败（查看日志）
4. 验证码已过期（5分钟有效期）

**解决方案：**
1. 检查垃圾邮件文件夹
2. 确认邮箱地址正确
3. 查看后端日志中的错误信息
4. 重新发送验证码

## 📝 配置检查清单

- [ ] QQ邮箱已开启SMTP服务
- [ ] 已生成QQ邮箱授权码
- [ ] `spring.mail.username` 配置正确
- [ ] `spring.mail.password` 配置正确（使用授权码，不是QQ密码）
- [ ] `spring.mail.from` 配置正确
- [ ] `app.mail.verify-switch-off` 配置正确
- [ ] 后端服务启动成功
- [ ] 邮件服务初始化成功
- [ ] 测试发送验证码成功
- [ ] 收到验证码邮件

## 🎯 下一步

1. **重新编译项目**
   ```bash
   mvn clean compile
   ```

2. **重启后端服务**
   - 停止当前服务
   - 重新启动服务
   - 查看启动日志

3. **测试邮件发送**
   - 访问注册页面
   - 输入邮箱地址
   - 发送验证码
   - 检查邮箱

## 📞 需要帮助？

如果遇到问题，请提供：

1. **错误信息：** 完整的错误日志
2. **配置信息：** `application.yaml` 中的邮件配置（隐藏敏感信息）
3. **测试结果：** 是否收到邮件
4. **日志信息：** 后端启动日志和邮件发送日志

