# WebView 的 JavascriptInterface 需保留，避免混淆后 JS 桥失效
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keep class com.ankong.toolbox.MainActivity$JsBridge { *; }
