# 用户模块 (User Module)

微服务架构中的用户管理模块，提供用户注册、登录、认证等功能。

## 📋 功能特性

- ✅ 用户注册（邮箱验证码）
- ✅ 用户登录（JWT Token）
- ✅ 用户信息查询
- ✅ 密码重置
- ✅ Token 验证
- ✅ 用户登出

## 🚀 快速开始

### 环境要求

- Java 17+
- Maven 3.6+
- MySQL 8.0+
- Redis 5.0+
- Node.js 16+ (前端)

### 启动步骤

1. **配置数据库**
   ```bash
   mysql -u root -p < src/main/resources/init.sql
   ```

2. **启动Redis**
   ```bash
   docker run -d -p 6379:6379 redis:5.0.7
   ```

3. **配置应用**
   - 修改 `src/main/resources/application.yaml`
   - 配置数据库连接
   - 配置QQ邮箱SMTP（可选，用于发送验证码）

4. **启动后端**
   ```bash
   mvn spring-boot:run
   ```

5. **访问API文档**
   ```
   http://localhost:8080/api/user/swagger-ui.html
   ```

## 📚 文档

- [微服务架构评估](MICROSERVICE_ARCHITECTURE_ASSESSMENT.md) - 架构评估和改进建议
- [改进总结](MICROSERVICE_IMPROVEMENTS_SUMMARY.md) - 已完成的改进内容
- [QQ邮箱配置](QQ_EMAIL_SETUP.md) - QQ邮箱SMTP配置指南

## 🔧 技术栈

- **框架**: Spring Boot 3.2.0
- **数据库**: MySQL 8.0
- **缓存**: Redis
- **ORM**: MyBatis
- **认证**: JWT
- **文档**: Swagger/OpenAPI
- **监控**: Spring Boot Actuator

## 📡 API端点

### 用户认证
- `POST /api/user/register` - 用户注册
- `POST /api/user/login` - 用户登录
- `POST /api/user/logout` - 用户登出
- `GET /api/user/verify` - 验证Token
- `POST /api/user/reset-password` - 重置密码
- `GET /api/user/public-key` - 获取RSA公钥

### 用户信息
- `GET /api/user/user/{userId}` - 获取用户信息

### 邮箱服务
- `POST /api/user/email/send-verification-code` - 发送验证码

### 监控端点
- `GET /api/user/actuator/health` - 健康检查
- `GET /api/user/actuator/info` - 应用信息
- `GET /api/user/actuator/metrics` - 指标监控

## 🏗️ 项目结构

```
src/main/java/com/user/
├── controller/      # REST控制器
├── service/        # 业务逻辑
├── mapper/          # MyBatis映射器
├── entity/          # 实体类
├── vo/              # 值对象（请求/响应）
├── util/            # 工具类
└── exception/       # 异常处理

src/main/resources/
├── mapper/          # MyBatis XML映射文件
├── application.yaml # 应用配置
└── init.sql         # 数据库初始化脚本
```

## 📝 开发规范

### 异常处理
- Service层抛出 `BusinessException`
- Controller层无需try-catch
- 全局异常处理器统一处理

### API文档
- 使用 `@Tag` 标注Controller
- 使用 `@Operation` 标注方法
- 访问 Swagger UI 查看完整文档

### 代码风格
- 使用Lombok简化代码
- 统一使用 `ApiResult` 作为响应格式
- 日志使用 `@Slf4j`

## 🔐 安全特性

- RSA加密传输密码
- BCrypt哈希存储密码
- JWT Token认证
- 邮箱验证码验证

## 📊 监控

- Spring Boot Actuator 健康检查
- 指标监控端点
- 统一日志记录

## 📄 许可证

MIT License

