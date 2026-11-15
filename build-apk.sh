#!/usr/bin/env bash
# ============================================================================
# 安空工具箱 —— 一键构建 Android APK（无需 Android Studio / Gradle）
#
# 用法：
#   ./build-apk.sh
#      自动准备 Android build-tools 34 与 platform 34，编译并签名出 APK。
#   ANDROID_TOOLS_DIR=/path/to/sdk ./build-apk.sh
#      复用已经准备好的 SDK 目录（内含 bt/android-14 与 plat/android-34-ext12）。
#
# 产物：dist/安空工具箱-v1.5.apk（debug 签名，可直接安装到手机 / 平板 / ChromeOS）
#
# 构建链：aapt2 compile/link → javac → d8 → 追加 classes.dex → zipalign → apksigner
# 只需 JDK 8+、python3、curl、unzip；不依赖 Gradle 与 Android Studio。
# ============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

BUILD="$ROOT/.build"
DIST="$ROOT/dist"
APK_NAME="安空工具箱-v1.5.apk"

echo "==> [1/9] 生成单文件网页应用与应用图标"
python3 build-web.py
python3 make-icons.py

echo "==> [2/9] 准备 Android 构建工具"
if [ -n "${ANDROID_TOOLS_DIR:-}" ] && [ -x "$ANDROID_TOOLS_DIR/bt/android-14/aapt2" ]; then
    BT="$ANDROID_TOOLS_DIR/bt/android-14"
    PLAT="$ANDROID_TOOLS_DIR/plat/android-34-ext12"
    echo "    复用：$ANDROID_TOOLS_DIR"
else
    SDK="$BUILD/sdk"
    BT="$SDK/bt/android-14"
    PLAT="$SDK/plat/android-34-ext12"
    mkdir -p "$SDK/bt" "$SDK/plat"
    if [ ! -x "$BT/aapt2" ]; then
        echo "    下载 build-tools_r34 (约 60MB) ..."
        curl -fL --retry 2 -o "$SDK/bt.zip" \
            https://dl.google.com/android/repository/build-tools_r34-linux.zip
        unzip -oq "$SDK/bt.zip" -d "$SDK/bt"
    fi
    if [ ! -f "$PLAT/android.jar" ]; then
        echo "    下载 platform-34 (约 60MB) ..."
        curl -fL --retry 2 -o "$SDK/plat.zip" \
            https://dl.google.com/android/repository/platform-34-ext12_r01.zip
        unzip -oq "$SDK/plat.zip" -d "$SDK/plat"
    fi
fi
ANDROID_JAR="$PLAT/android.jar"
[ -f "$ANDROID_JAR" ] || { echo "找不到 android.jar：$ANDROID_JAR"; exit 1; }
chmod +x "$BT/aapt2" "$BT/d8" "$BT/zipalign" "$BT/apksigner" 2>/dev/null || true

rm -rf "$BUILD/res" "$BUILD/gen" "$BUILD/classes" "$BUILD/dex" "$BUILD/apk"
mkdir -p "$BUILD/res" "$BUILD/gen" "$BUILD/classes" "$BUILD/dex" "$BUILD/apk" "$DIST"

echo "==> [3/9] aapt2 compile（编译资源）"
"$BT/aapt2" compile --dir app/src/main/res -o "$BUILD/res/"

echo "==> [4/9] aapt2 link（生成资源 APK 与 R.java）"
FLATS="$(find "$BUILD/res" -name '*.flat' | sort | tr '\n' ' ')"
# shellcheck disable=SC2086
"$BT/aapt2" link \
    -o "$BUILD/apk/base.apk" \
    -I "$ANDROID_JAR" \
    --manifest app/src/main/AndroidManifest.xml \
    -A app/src/main/assets \
    --java "$BUILD/gen" \
    --min-sdk-version 23 \
    --target-sdk-version 34 \
    --version-code 10 \
    --version-name 1.5 \
    --auto-add-overlay \
    $FLATS

echo "==> [5/9] javac（编译 Java 源码）"
# shellcheck disable=SC2046
javac -encoding UTF-8 --release 8 -nowarn \
    -cp "$ANDROID_JAR" \
    -d "$BUILD/classes" \
    $(find app/src/main/java "$BUILD/gen" -name '*.java')

echo "==> [6/9] d8（生成 classes.dex）"
# shellcheck disable=SC2046
"$BT/d8" --lib "$ANDROID_JAR" --min-api 23 --output "$BUILD/dex" \
    $(find "$BUILD/classes" -name '*.class')

echo "==> [7/9] 把 dex 与 assets 打进 APK"
python3 - "$BUILD/apk/base.apk" "$BUILD/dex/classes.dex" <<'PY'
import sys, zipfile
apk, dex = sys.argv[1], sys.argv[2]
with zipfile.ZipFile(apk, 'a', zipfile.ZIP_DEFLATED) as z:
    z.write(dex, 'classes.dex')
print('    classes.dex 已写入')
PY

echo "==> [8/9] zipalign 对齐"
"$BT/zipalign" -f -p 4 "$BUILD/apk/base.apk" "$BUILD/apk/aligned.apk"

echo "==> [9/9] 生成签名并输出 APK"
KS="$BUILD/debug.keystore"
if [ ! -f "$KS" ]; then
    keytool -genkeypair -keystore "$KS" -alias androiddebugkey \
        -keyalg RSA -keysize 2048 -validity 10000 \
        -storepass android -keypass android \
        -dname "CN=Ankong Toolbox, OU=Dev, O=Ankong, L=Shenzhen, ST=GD, C=CN" \
        >/dev/null 2>&1
fi
"$BT/apksigner" sign \
    --ks "$KS" --ks-key-alias androiddebugkey \
    --ks-pass pass:android --key-pass pass:android \
    --min-sdk-version 23 \
    --out "$DIST/$APK_NAME" \
    "$BUILD/apk/aligned.apk"
"$BT/apksigner" verify "$DIST/$APK_NAME"

echo ""
echo "构建完成："
ls -lh "$DIST/$APK_NAME"
echo ""
echo "APK 内容："
unzip -l "$DIST/$APK_NAME" | grep -E 'classes.dex|AndroidManifest.xml|resources.arsc|assets/www/' | head -10
echo ""
echo "安装到手机： adb install -r \"$DIST/$APK_NAME\""
