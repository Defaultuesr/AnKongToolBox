#!/usr/bin/env bash
# ============================================================================
# 安空工具箱 —— Gradle 构建带真机 ML Kit OCR 的 APK（v1.9+）
#
# 与旧 build-apk.sh（手工 aapt2/d8，无 ML Kit）并存：
#   - build-apk.sh        : 轻量快速构建，OCR 降级为手动录入
#   - build-apk-gradle.sh : 正式发布构建，含 ML Kit bundled 中文 OCR（约 23MB）
#
# 依赖：系统 gradle 9.x + JDK 17+ + Android SDK（platform 34 / build-tools）。
# 产物：dist/安空工具箱-vX.Y.apk（debug 签名，可直接安装）
# ============================================================================
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

# SDK 路径：优先环境变量，其次 local.properties，最后验证环境默认
SDK="${ANDROID_SDK_ROOT:-}"
if [ -z "$SDK" ] && [ -f local.properties ]; then
    SDK=$(grep '^sdk.dir=' local.properties | cut -d= -f2)
fi
SDK="${SDK:-/tmp/gradletest/sdkroot}"
echo "sdk.dir=$SDK" > local.properties
echo "==> SDK: $SDK"

# 版本号从 Gradle 专用 Manifest 读取
VER=$(grep -oP 'android:versionName="\K[^"]+' app/gradle-res/AndroidManifest.xml)
APK_NAME="安空工具箱-v${VER}.apk"
echo "==> 版本: $VER  产物: $APK_NAME"

echo "==> Gradle 构建 release APK（含 ML Kit，首次约 2 分钟）"
gradle :app:assembleRelease --no-daemon

SRC="app/build/outputs/apk/release/app-release.apk"
DST="dist/$APK_NAME"
mkdir -p dist
cp "$SRC" "$DST"

echo ""
echo "==> 校验"
BT=$(find "$SDK/build-tools" -name aapt2 2>/dev/null | head -1)
if [ -n "$BT" ]; then
    "$BT" dump badging "$DST" 2>/dev/null | head -1
fi
echo "ML Kit so:" && unzip -l "$DST" | grep -E "libmlkit.*\.so" | awk '{print "  ",$1,$4}'
echo "大小: $(du -h "$DST" | cut -f1)"
echo ""
echo "构建完成: $DST"
