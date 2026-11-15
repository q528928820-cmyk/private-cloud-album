# 私人云相册（Cloudflare Pages + D1 + Cloudinary）

这是一个可部署到 Cloudflare Pages 的轻量私人相册项目。网页文件位于项目根目录，后端接口位于 `functions/api/[[path]].js`，D1 初始化 SQL 位于 `migrations/0001_init.sql`。

## 功能
- 管理员密码登录（使用 Cloudflare Pages 环境变量设置密码）
- 新建相册、照片上传、缩略图查看、删除
- ZIP 备份：导出相册清单和每张原始图片
- ZIP 恢复：校验备份格式后将照片重新上传到 Cloudinary，并新建恢复相册
- 图片对象存储在 Cloudinary，元数据存储在 D1

## 部署前准备
1. 创建 Cloudflare D1 数据库，在 D1 控制台的 Console 执行 `migrations/0001_init.sql` 全部 SQL。
2. Cloudinary 控制台准备 Cloud Name、API Key、API Secret。API Secret 绝不要放在网页代码中。
3. 上传项目到 Cloudflare Pages。此项目使用 Pages Functions，必须通过 Pages 项目部署，不能只把 `index.html` 单独上传到静态托管。
4. Pages 项目 Settings → Functions → D1 database bindings，添加绑定：Variable name 填 `DB`，Database 选择刚创建的 D1。
5. Pages 项目 Settings → Environment variables，添加以下变量（Production，建议 Preview 也单独配置）：
   - `ADMIN_PASSWORD`：你的管理员登录密码
   - `SESSION_SECRET`：至少 32 位随机字符串
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`（必须作为加密 Secret）
6. 保存设置并重新部署。

## 重要限制与安全说明
- 单张上传限制为 25MB；一次 ZIP 备份会把照片下载到浏览器再打包，照片很多或总容量很大时，建议分批备份并确保设备有足够空间。
- ZIP 恢复采用“追加”方式，不删除现有相册和照片。恢复会为备份中的相册新建副本。
- 请先用几张不重要的测试照片验证上传、下载、备份、恢复、删除流程，再存放唯一原件。
- Cloudinary 账户的 API Secret 只能放在 Cloudflare 加密环境变量中，切勿提交到 GitHub 或发给任何人。
- 本项目为初始版本，建议先在私人测试环境验证。请保存 ZIP 到本地和另一处安全位置；不要把线上相册当作唯一备份。

## 目录
- `index.html` / `style.css` / `app.js`：前端
- `functions/api/[[path]].js`：Pages Functions API
- `migrations/0001_init.sql`：D1 数据库结构
- `wrangler.toml`：Pages 配置示例
