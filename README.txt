# 私人云相册 Worker 文件

## 部署前必须设置的 Worker 机密
在 Cloudflare Worker -> 设置 -> 变量和机密中设置：
- `ALBUM_PASSWORD`：你自己设定的相册登录密码（不要发给任何人）
- `ALBUM_SESSION_SECRET`：一段足够长的随机字符串（至少 32 个随机字符）
- 已有的 `CLOUDINARY_CLOUD_NAME`
- 已有的 `CLOUDINARY_API_KEY`
- 已有的 `CLOUDINARY_API_SECRET`

`DB` 是 D1 绑定，不是普通变量。wrangler.toml 已包含 D1 数据库配置。

## 重要说明
- Worker 直接返回网页，不需要 ASSETS 静态资源绑定。
- 需要现有 D1 表：albums、photos、settings（与此前创建的结构兼容）。
- ZIP 备份在浏览器端生成，原图由 Worker 代理读取；恢复时重新上传到 Cloudinary。
- 恢复目前将备份中的照片导入到备份第一本相册；多相册 ZIP 的照片归属映射尚未实现。请勿把此版本当作多相册完整恢复版。
- ZIP 使用 jszip CDN，需要浏览器能访问 jsDelivr。
- 大型相册备份会占用浏览器内存；请先用少量测试照片验证，正式存入重要照片前先做一次备份恢复测试。
