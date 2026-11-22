# 安空工具箱（AnKongToolBox）

> 一个功能齐全、完全离线的多平台实用工具箱 —— 集 **477 个工具**、**15 种界面语言**、**资讯阅读** 与 **自动更新** 于一体，支持 Android / iOS / 网页三端。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-2.4-orange.svg)](https://github.com/Defaultuesr/AnKongToolBox/releases/latest)
[![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS%20%7C%20Web-blue.svg)](#平台支持)
[![Tools](https://img.shields.io/badge/tools-477-green.svg)](#功能概览)

---

## 目录

- [简介](#简介)
- [功能概览](#功能概览)
- [平台支持](#平台支持)
- [快速开始](#快速开始)
- [下载安装](#下载安装)
- [项目结构](#项目结构)
- [技术实现](#技术实现)
- [本地构建](#本地构建)
- [版本历史](#版本历史)
- [反馈与支持](#反馈与支持)
- [许可证与致谢](#许可证与致谢)

---

## 简介

**安空工具箱** 是一款以「轻黄护眼、离线可用、功能全面」为设计理念的工具集合应用。它的核心是一个**单文件 H5 网页（SPA）**，通过原生 WebView 壳打包为 Android APK 与 iOS App，也可以直接在浏览器中打开使用。

- **477 个实用工具**，覆盖查询、文本、媒体、开发、计算、生活、测评、游戏、聚合九大分类
- **绝大多数工具纯离线运行**，输入内容不离开设备，注重隐私
- **浅黄色护眼主题**，支持 Pad / 平板 / ChromeOS 大屏自适应布局
- **15 种界面语言**，一键切换，覆盖全球主要语种
- **内置今日新闻 / 热榜资讯页**、**内置浏览器**、**图片文字识别（OCR）**
- **自动检查更新**，可手动检查、忽略指定版本

---

## 功能概览

### 九大分类

| 分类 | 说明 |
| --- | --- |
| 🔍 查询工具 | 农历、历史、性格测试、各类速查表 |
| 📝 文本工具 | 编码解码、加密摘要、正则、文本校对 |
| 🖼️ 媒体工具 | 取色、压缩裁剪、二维码、条形码 |
| 💻 开发者工具 | JSON/XML、时间戳、进制转换、IP 子网 |
| 🧮 计算换算 | 计算器、单位换算、复利、BMI 等 |
| 🏠 生活工具 | 便签、番茄钟、倒数日、密码生成 |
| 📱 设备测评 | 设备信息、水平仪、指南针、屏幕测试 |
| 🎮 小游戏 | 2048、井字棋、反应测试、节拍器 |
| 🔗 聚合资源 | 影音、玩机、链接解析、资料库 |

### 特色功能

- **资讯页**：今日新闻、微博 / 知乎 / 抖音 / 头条 / 百度热榜、每日一言（带缓存与降级策略）
- **OCR 图片文字提取**：Android 端集成 ML Kit 中文识别模型（on-device，无需联网），iOS 端使用 Vision 框架
- **内置浏览器**：Android 使用 `BrowserActivity`，iOS 使用 `SFSafariViewController`
- **暮光数据移植**：元素周期表（118 元素）、猫品种图鉴（233 条）、一笔画（120 关）、域名后缀（1476 条）、开源库速查（217 条）等（已获作者授权）
- **自动更新**：基于 GitHub Releases API，12 小时节流，支持缓存与跳过版本

### 界面语言

简体中文 · 繁體中文 · English · 日本語 · Français · Deutsch · Español · 한국어 · Русский · Português · Italiano · Nederlands · Türkçe · Tiếng Việt · Bahasa Indonesia

---

## 平台支持

| 平台 | 形式 | 状态 |
| --- | --- | --- |
| **Android** | APK（arm64-v8a / armeabi-v7a，minSdk 23） | ✅ 正式发布 |
| **iOS** | Xcode 工程源码 + 未签名 IPA 结构包 | ✅ v2.4 起支持 |
| **网页** | 单文件 `index.html`，双击即可离线打开 | ✅ 随版本构建 |

> **关于 iOS IPA 的说明**：仓库 Release 中提供的 `.ipa` 为**未签名结构包**，无法直接安装。iOS 平台强制要求苹果签名，请使用 `ios-build/` 中的 Xcode 工程在 macOS 上自行构建并签名。详见 [iOS 工程说明](https://github.com/Defaultuesr/AnKongToolBox/releases)。

---

## 快速开始

### 网页版（最简单）

直接下载最新版本 Release 中的 `安空工具箱-网页版.html`，用任意现代浏览器打开即可，无需安装、完全离线。

###  Android / iOS

从 [Releases 页面](https://github.com/Defaultuesr/AnKongToolBox/releases/latest) 下载对应平台的安装包：

- **Android**：下载 `安空工具箱-vX.Y.apk`（已使用 debug 签名，可直接安装）
- **iOS**：下载 iOS 工程 zip，按说明用 Xcode 构建签名

---

## 下载安装

所有历史版本的安装包、源码归档与网页版均在 [GitHub Releases](https://github.com/Defaultuesr/AnKongToolBox/releases) 中提供。

| 资源 | 说明 |
| --- | --- |
| `安空工具箱-vX.Y.apk` | Android 安装包（含 ML Kit OCR） |
| `安空工具箱-网页版.html` | 单文件离线网页版 |
| `安空工具箱-vX.Y-项目源码.zip` | Android 项目完整源码 |
| `安空工具箱-vX.Y-iOS工程.zip` | iOS Xcode 工程（v2.4 起） |
| `AnKongToolBox-vX.Y-unsigned.ipa` | 未签名 IPA 结构包（v2.4 起） |

应用内也提供 **自动检查更新** 功能，可在「关于」页面手动触发。

---

## 项目结构

```
ankong-toolbox/
├── app/                        # Android 原生壳工程
│   └── src/main/
│       ├── assets/www/index.html   # 构建生成的单文件 H5
│       ├── java/com/ankong/toolbox/  # MainActivity / BrowserActivity / OcrBridge
│       └── res/                    # 图标、主题、多语言 values
├── src/                        # H5 源码（核心）
│   ├── core.js                 # 全局框架、路由、导航、设置
│   ├── tools*.js               # 各版本工具集合
│   ├── i18n*.js                # 15 语言词条
│   ├── icons*.js               # 工具图标映射
│   ├── data-twilight*.js       # 暮光移植数据
│   ├── news.js                 # 资讯页
│   ├── update.js               # 自动更新 / 通用 HTTP 桥
│   └── style.css               # 浅黄色主题样式
├── ios-build/                  # iOS Xcode 工程（v2.4 起）
│   └── AnKongToolBox.xcodeproj/
├── build-web.py                # 合并 src/ → 单文件 index.html
├── build-apk-gradle.sh         # Gradle 构建正式 APK 脚本
└── validate_v*.py              # 各版本校验脚本
```

---

## 技术实现

- **核心架构**：H5 单页应用（ES5 兼容写法），所有工具通过 `T({...})` / `IM(cfg)` 注册
- **Android 壳**：Java + WebView，Gradle + AGP 8.13.0 构建，ML Kit `text-recognition-chinese:16.0.1` 提供离线 OCR
- **iOS 壳**：Swift + WKWebView，纯系统框架（WebKit / Vision / PhotosUI / SafariServices），无第三方依赖
- **原生桥**：JS 通过 `window.Ankong.*`（iOS 为 `window.webkit.messageHandlers.ankong`）调用网络请求、打开网页、分享、复制、震动、语言设置、OCR 等能力
- **自动更新**：调用 GitHub API `releases/latest`，`localStorage` 缓存与节流
- **主题**：浅黄色护眼配色，Flex/Grid 响应式布局，适配 Pad 与 ChromeOS 大屏

---

## 本地构建

```bash
# 1. 生成单文件网页版（合并 src/ 下的 CSS 与 JS）
python3 build-web.py

# 2. 构建 Android APK（需 JDK 17+ / Android SDK platform 34）
./build-apk-gradle.sh

# iOS：用 Xcode 打开 ios-build/AnKongToolBox.xcodeproj，配置签名后 Archive 导出
```

---

## 版本历史

| 版本 | 日期 | 主要变化 |
| --- | --- | --- |
| v2.4 | 2026-11-22 | 首次支持 iOS；新增 6 个离线工具，工具总数达 477 |
| v2.3 | 2026-11-22 | 新增「今天吃什么 / 域名后缀 / 英制单位 / 开源库速查」等 |
| v2.2 | 2026-11-22 | 移植暮光数据：元素周期表、猫图鉴、一笔画 |
| v2.1 | 2026-11-19 | 新增 24 个数论 / 编码 / 财务类工具 |
| v2.0 | 2026-11-18 | 新增「资讯」导航页、内置浏览器、今日新闻 |
| v1.9 | 2026-11-16 | 集成 ML Kit 离线中文 OCR |
| v1.8 | 2026-11-15 | 新增 OCR、内置 Chromium 浏览器等能力 |
| v1.0–v1.7 | 2026-11 | 基础框架、多语言、自动更新与持续增补工具 |

完整更新日志可在应用「关于」页面查看。

---

## 反馈与支持

- **反馈邮箱**：3805278668@qq.com
- **问题反馈**：欢迎在 [GitHub Issues](https://github.com/Defaultuesr/AnKongToolBox/issues) 提交问题与建议
- **新功能建议**：邮件或 Issue 均可，请描述使用场景

---

## 许可证与致谢

- 本项目采用 [MIT License](LICENSE) 开源。
- 部分数据资源移植自 **暮光工具箱**，已获得原作者授权，特此致谢。
- 感谢所有提供反馈与建议的用户。

---

<div align="center">

**安空工具箱** —— 让实用工具触手可及

[⬆ 返回顶部](#安空工具箱ankongtoolbox)

</div>
