# 🌐 FL Browser

一款基于 Electron 的现代浏览器，支持扩展安装、多主题、朗读、翻译等功能。

[![Release](https://img.shields.io/github/v/release/flbrowser/fl-browser)](https://github.com/flbrowser/fl-browser/releases)
[![License](https://img.shields.io/github/license/flbrowser/fl-browser)](LICENSE)
[![Downloads](https://img.shields.io/github/downloads/flbrowser/fl-browser/total)](https://github.com/flbrowser/fl-browser/releases)

## ✨ 功能特性

### 🎨 外观与主题

- **6种预设主题**：浅色、深色、海洋蓝、森林绿、日落红、霓虹紫
- **自定义颜色**：支持自定义强调色、背景色、文字色
- **阅读模式**：可调字体大小和背景的阅读模式
- **标签页管理**：支持垂直标签页、标签页分组

### 🔧 浏览器功能

- **多标签页浏览**：支持新建、关闭、切换标签页
- **历史记录**：按日期分组显示，支持单条删除和清空
- **收藏夹**：快速收藏和访问常用网站
- **下载管理**：查看和管理下载文件
- **集锦功能**：收集和整理网页

### 🧩 扩展支持

- **Chrome Web Store**：访问 Chrome 扩展商店
- **Microsoft Edge Add-ons**：访问 Edge 扩展商店
- **Firefox Add-ons**：访问 Firefox 扩展商店
- **开发者模式**：支持加载未打包的扩展程序

### 📖 朗读与翻译

- **屏幕朗读**：支持多音色选择、语速调节（0.5x - 2x）
- **翻译功能**：支持8种语言翻译（中/英/日/韩/法/德/西/俄）
- **翻译历史**：自动保存翻译记录

### 🔒 安全与隐私

- **InPrivate 模式**：无痕浏览模式
- **SmartScreen**：智能安全过滤
- **广告拦截**：内置广告拦截功能
- **数据清理**：可清除浏览数据

### ⌨️ 快捷键

| 快捷键            | 功能              |
| -------------- | --------------- |
| `Ctrl+T`       | 新建标签页           |
| `Ctrl+W`       | 关闭当前标签页         |
| `Ctrl+F`       | 在页面上查找          |
| `Ctrl+H`       | 打开历史记录          |
| `Ctrl+J`       | 打开下载管理          |
| `Ctrl+N`       | 新建窗口            |
| `Ctrl+Shift+N` | 新建 InPrivate 窗口 |
| `F11`          | 全屏模式            |
| `F12`          | 开发者工具           |
| `Ctrl+滚轮`      | 页面缩放            |

## 📦 安装

### 方式一：下载安装包

1. 前往 [Releases 页面](https://github.com/flbrowser/fl-browser/releases)
2. 下载最新版本的安装包
3. 运行安装程序，按提示完成安装

### 方式二：从源码构建

#### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

#### 构建步骤

```bash
# 1. 克隆仓库
git clone https://github.com/flbrowser/fl-browser.git
cd fl-browser

# 2. 安装依赖
npm install

# 3. 运行开发模式
npm start

# 4. 打包 Windows 便携版 (ZIP)
npm run build:zip

# 5. 打包 Windows 安装版 (EXE)
npm run build:installer
```

### 打包输出位置

| 命令                        | 输出文件                              |
| ------------------------- | --------------------------------- |
| `npm run build:zip`       | `dist/FL Browser-1.0.0-win.zip`   |
| `npm run build:installer` | `dist/FL-Browser-Setup-1.0.0.exe` |

## 🚀 使用指南

### 安装扩展

1. 打开浏览器，点击右上角菜单 → **扩展**
2. 开启 **开发者模式** 开关
3. 点击 **加载已解压的扩展程序**
4. 选择扩展程序所在文件夹
5. 扩展安装成功后可在扩展页面管理

### 主题切换

1. 点击菜单 → **设置**
2. 选择 **外观** 选项卡
3. 选择预设主题或自定义颜色

### 朗读网页

1. 打开要朗读的网页
2. 点击菜单 → **大声朗读**（或按 `Ctrl+Shift+U`）
3. 在控制面板中选择音色和语速

### 翻译内容

1. 点击菜单 → **翻译**
2. 输入要翻译的文本
3. 选择源语言和目标语言
4. 点击翻译按钮

## ⚙️ 配置说明

### package.json 配置

```json
{
  "name": "fl-browser",
  "version": "1.0.0",
  "description": "FL Browser - A modern web browser based on Electron",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "build": "electron-builder --win portable",
    "build:installer": "electron-builder --win nsis",
    "build:zip": "electron-builder --win zip"
  },
  "build": {
    "appId": "com.flbrowser.app",
    "productName": "FL Browser",
    "directories": {
      "output": "dist"
    },
    "files": [
      "main.js",
      "index.html",
      "preload.js",
      "icons/**/*"
    ],
    "compression": "maximum",
    "win": {
      "target": [
        {"target": "portable", "arch": ["x64"]},
        {"target": "zip", "arch": ["x64"]}
      ],
      "icon": "icons/wind-power-browser.ico"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "shortcutName": "FL Browser"
    }
  }
}
```

### 配置项说明

| 配置项                                       | 说明                           |
| ----------------------------------------- | ---------------------------- |
| `appId`                                   | 应用唯一标识符                      |
| `productName`                             | 应用显示名称                       |
| `directories.output`                      | 打包输出目录                       |
| `files`                                   | 需要打包的文件                      |
| `compression`                             | 压缩级别（maximum/maximum/normal） |
| `win.target`                              | Windows 打包目标格式               |
| `nsis.oneClick`                           | 是否一键安装                       |
| `nsis.allowToChangeInstallationDirectory` | 是否允许选择安装目录                   |

## 🔄 自动升级

浏览器内置自动升级功能：

1. 启动时自动检查更新（每24小时一次）
2. 发现新版本后弹出提示
3. 用户确认自动下载安装

### 发布新版本

```bash
# 1. 更新版本号
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0

# 2. 打包新版本
npm run build:installer

# 3. 创建 GitHub Release
# 前往 GitHub Releases 页面，上传安装包并填写更新日志
```

## 📁 项目结构

```
fl-browser/
├── main.js              # Electron 主进程
├── preload.js           # 预加载脚本
├── index.html           # 渲染进程主文件
├── updater.js           # 自动升级模块
├── package.json         # 项目配置
├── icons/               # 应用图标
│   ├── wind-power-browser.ico
│   └── wind-power-browser.png
└── dist/                # 打包输出目录（自动生成）
```

## 🛠️ 开发指南

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发模式（含 DevTools）
npm start

# 优化文件大小（可选）
node compress.js
```

### 调试

- 开发模式下 DevTools 默认开启
- 按 `F12` 可切换开发者工具
- 主进程日志在终端中显示

## 📝 更新日志

### v1.0.0

- ✨ 初始版本发布
- 🎨 6种预设主题
- 🧩 扩展支持（Chrome/Edge/Firefox）
- 📖 屏幕朗读功能
- 🌐 多语言翻译
- 📜 历史记录管理
- 🔒 安全浏览模式

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📮 联系方式

- 项目主页：[https://github.com/fenglijituan/fl-browser](https://github.com/flbrowser/fl-browser)
- 问题反馈：sunyihuan9\@gmail.com    fenglijituan\@qq.com

