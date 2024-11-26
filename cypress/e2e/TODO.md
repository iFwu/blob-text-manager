# TODO: Additional Test Scenarios

## Error Handling Tests

- API errors (list, create, delete operations)
- File content loading errors
- Network failures
- Invalid responses

## Loading States Tests

- Initial file list loading
- File content loading
- File operations in progress
- Multiple concurrent operations

## Concurrent Operations Tests

- Multiple file creations
- Rapid folder operations
- Simultaneous file operations
- Race condition handling

Example test cases:

```typescript
// Error handling examples
it('should handle API errors gracefully');
it('should handle file content loading errors');
it('should handle file creation errors');
// Loading state examples
it('should show loading state during initial file list fetch');
it('should show loading state during file content fetch');
// Concurrent operations examples
it('should handle multiple file creations');
it('should handle rapid folder operations');
```

# Feature Development Roadmap

## P0 - 核心功能（高优先级）

### 编辑器功能增强

1. 编辑器关闭功能

   - 添加关闭按钮
   - 实现关闭逻辑
   - 关闭后清理编辑器状态

2. 内容变更保护（Dirty State）
   - 检测文件内容变更
   - 实现以下场景的确认提示：
     - 切换到其他文件时
     - 关闭编辑器时
     - 创建新文件时
     - 刷新页面时
   - 提供保存、放弃、取消三个选项

### 基础文件操作

1. 文件复制/粘贴

   - 实现单个文件复制
   - 实现单个文件粘贴
   - 处理重名文件情况
   - 支持跨目录复制粘贴

2. 文件重命名

   - 添加重命名按钮/快捷键
   - 实现重命名输入框
   - 文件名验证
   - 处理重名冲突

3. 文件下载

   - 实现单个文件下载
   - 添加下载进度提示
   - 支持大文件下载
   - 处理下载失败情况

4. 文件夹前缀管理
   - 支持删除创建文件时的文件夹前缀
   - 优化文件夹路径显示
   - 处理前缀删除后的文件组织

### 文件元数据管理

1. 创建日期支持

   - 在文件名中添加创建日期前缀
   - 实现文件更新时保留原始创建日期
   - 提供创建日期解析和显示
   - 按创建日期排序功能

2. 文件元信息
   - 显示文件大小
   - 显示最后修改时间
   - 显示文件类型
   - 显示文件路径信息

## P1 - 增强功能（中优先级）

### Markdown 编辑增强

1. Markdown 语法支持

   - 实现语法高亮
   - 支持常用 Markdown 语法
   - 支持代码块高亮
   - 添加 Markdown 工具栏

2. Markdown 预览

   - 实现实时预览
   - 支持预览/编辑切换
   - 支持同步滚动
   - 预览样式优化

3. Front Matter 支持

   - 解析 Front Matter
   - 提供 Front Matter 编辑界面
   - 支持常用 Front Matter 字段
   - 验证 Front Matter 格式

4. 图片支持
   - 图片上传功能
     - 支持拖拽上传
     - 支持粘贴上传
     - 上传进度显示
   - 图片预览功能
     - 支持缩略图
     - 支持图片放大
     - 支持图片旋转
   - Markdown 图片插入
     - 提供图片插入按钮
     - 自动生成 Markdown 图片语法
     - 支持图片大小调整
     - 支持图片说明文字

### 文件管理增强

1. 拖拽操作支持

   - 文件上传
     - 支持拖拽上传文件
     - 支持拖拽上传文件夹
     - 显示上传进度
   - 文件移动
     - 支持拖拽移动文件
     - 支持拖拽移动文件夹
     - 显示移动提示
   - 文件下载
     - 支持拖拽下载文件
     - 支持拖拽下载文件夹

2. 搜索功能
   - 文件名搜索
     - 支持模糊搜索
     - 支持正则表达式
     - 实时搜索结果
   - 文件内容搜索
     - 全文搜索支持
     - 搜索结果预览
     - 搜索结果高亮
     - 支持大文件搜索优化

## P2 - 扩展功能（低优先级）

### 文件类型支持

1. 扩展文件类型预览

   - 支持音频预览
   - 支持视频预览
   - 支持 PDF 预览
   - 支持代码文件语法高亮

2. 文件上传增强
   - 在 CreateForm 中支持更多文件类型
   - 文件类型验证
   - 文件大小限制
   - 批量上传支持

### Vercel Blob 高级特性

1. 分页与状态

   - 实现文件列表分页
   - 记住文件夹展开/折叠状态
   - 优化大量文件的显示性能

2. 高级功能支持
   - 范围请求（Range Request）支持
     - 支持断点续传
     - 支持视频流媒体
   - 上传进度显示
     - 精确的进度百分比
     - 剩余时间估算
     - 上传速度显示
   - 请求控制
     - 支持终止上传请求
     - 支持终止下载请求
     - 支持批量操作终止
   - 批量操作
     - 支持批量删除文件
     - 支持批量移动文件
     - 支持批量下载文件

## 技术改进

### 性能优化

1. 缓存优化

   - 利用 Vercel Blob 浏览器缓存（1年）
   - 利用边缘网络缓存（5分钟）
   - 实现本地缓存策略

2. 大文件处理

   - 分片上传实现
   - 断点续传支持
   - 大文件预览优化

3. 并发控制
   - 实现请求队列
   - 控制并发请求数量
   - 优化批量操作性能

### 错误处理

1. API 错误处理完善

   - 统一错误处理机制
   - 友好的错误提示
   - 错误重试机制

2. 网络错误处理

   - 断网状态处理
   - 请求超时处理
   - 自动重连机制

3. 并发错误处理
   - 处理竞态条件
   - 处理并发冲突
   - 实现操作队列
