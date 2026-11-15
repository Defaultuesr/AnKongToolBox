package com.ankong.toolbox;

import android.Manifest;
import android.app.Activity;
import android.app.ActivityManager;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.hardware.camera2.CameraCharacteristics;
import android.hardware.camera2.CameraManager;
import android.media.MediaScannerConnection;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.os.BatteryManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.StatFs;
import android.provider.Settings;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.provider.MediaStore;
import android.util.Base64;
import android.util.DisplayMetrics;
import android.view.KeyEvent;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/**
 * 安空工具箱 —— 原生壳。
 * 主体界面与全部工具都在 assets/www/index.html 中，本地加载、离线可用。
 * 这里只提供 WebView 无法直接完成的系统能力：剪贴板、相册保存、闪光灯、
 * 设备信息、振动、分享等。系统栏恒常显示，不提供全屏 / 沉浸切换。
 */
public class MainActivity extends Activity {

    private WebView web;
    private ValueCallback<Uri[]> filePathCallback;
    private static final int REQ_FILE = 1001;
    private static final int REQ_PERMISSION = 2002;
    private String cameraId = null;
    private boolean darkTheme = false;
    private String accentMode = "amber";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        web = (WebView) findViewById(R.id.webview);
        setupSystemBars();

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        // 天气查询等 HTTPS 请求需要跨源能力（本地 file:// 页面）
        s.setAllowFileAccessFromFileURLs(true);
        s.setAllowUniversalAccessFromFileURLs(true);
        s.setLoadWithOverviewMode(false);
        s.setUseWideViewPort(true);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setCacheMode(WebSettings.LOAD_NO_CACHE);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        s.setMediaPlaybackRequiresUserGesture(true);
        s.setTextZoom(100);

        web.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri u = request.getUrl();
                String scheme = u.getScheme();
                if ("http".equals(scheme) || "https".equals(scheme) || "mailto".equals(scheme)) {
                    try {
                        startActivity(new Intent(Intent.ACTION_VIEW, u));
                    } catch (Exception ignored) {
                    }
                    return true;
                }
                return false;
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback,
                                             FileChooserParams params) {
                if (filePathCallback != null) filePathCallback.onReceiveValue(null);
                filePathCallback = callback;
                try {
                    Intent i = params.createIntent();
                    i.setType("image/*");
                    i.putExtra(Intent.EXTRA_MIME_TYPES, new String[]{"image/*"});
                    startActivityForResult(Intent.createChooser(i, "选择图片"), REQ_FILE);
                    return true;
                } catch (Exception e) {
                    filePathCallback = null;
                    showToast("无法打开文件选择器");
                    return false;
                }
            }
        });

        web.addJavascriptInterface(new JsBridge(), "Ankong");
        web.loadUrl("file:///android_asset/www/index.html");

        if (Build.VERSION.SDK_INT >= 23) {
            requestPermissions(new String[]{
                    Manifest.permission.CAMERA,
                    Manifest.permission.WRITE_EXTERNAL_STORAGE
            }, REQ_PERMISSION);
        }
    }

    /* ------------------------------------------------------------------
       标准窗口：状态栏 / 导航栏恒常显示且为实色，内容由系统自动避让。
       不使用 edge-to-edge、不隐藏系统栏、不注入 insets，界面布局始终一致，
       从根本上不存在「取消全屏后回不到原样」的状态切换问题。
       ------------------------------------------------------------------ */
    private void setupSystemBars() {
        Window w = getWindow();
        w.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
        w.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_NAVIGATION);
        w.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        applySystemUi();
    }

    /** 系统栏外观：仅随主题深浅切换图标颜色与底色，从不隐藏系统栏。 */
    private void applySystemUi() {
        Window w = getWindow();
        View v = w.getDecorView();
        // 不设置 LAYOUT_FULLSCREEN / LAYOUT_HIDE_NAVIGATION，系统自动为内容避让
        int flags = View.SYSTEM_UI_FLAG_LAYOUT_STABLE;
        // 浅黄底需要深色状态栏图标；深色主题改为浅色图标
        if (!darkTheme) {
            flags |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
            if (Build.VERSION.SDK_INT >= 26) flags |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
        }
        v.setSystemUiVisibility(flags);
        int barColor = darkTheme ? 0xFF191610 : 0xFFFFF8EE;
        w.setStatusBarColor(barColor);
        w.setNavigationBarColor(barColor);
        // 兜底：确保系统栏始终处于默认常显状态（清除可能的历史残留）
        if (Build.VERSION.SDK_INT >= 30) {
            WindowInsetsController c = w.getInsetsController();
            if (c != null) {
                c.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_DEFAULT);
                c.show(WindowInsets.Type.systemBars());
            }
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) applySystemUi();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == REQ_FILE) {
            if (filePathCallback != null) {
                Uri[] results = null;
                if (resultCode == RESULT_OK && data != null && data.getData() != null) {
                    results = new Uri[]{data.getData()};
                }
                filePathCallback.onReceiveValue(results);
                filePathCallback = null;
            }
        } else {
            super.onActivityResult(requestCode, resultCode, data);
        }
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (event.getAction() == KeyEvent.ACTION_DOWN) {
            if (keyCode == KeyEvent.KEYCODE_BACK) {
                web.evaluateJavascript(
                        "(function(){if(window.AnkongApp&&window.AnkongApp.onBack){window.AnkongApp.onBack();}})()",
                        null);
                return true;
            }
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    protected void onDestroy() {
        if (web != null) web.destroy();
        super.onDestroy();
    }

    private void showToast(final String msg) {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                Toast.makeText(MainActivity.this, msg, Toast.LENGTH_SHORT).show();
            }
        });
    }

    private class JsBridge {

        /** 把系统语言交给 H5，用于首次启动自动选择界面语言。 */
        @JavascriptInterface
        public String getLocale() {
            try {
                return Locale.getDefault().toLanguageTag();
            } catch (Exception e) {
                return Locale.getDefault().toString();
            }
        }

        /** 应用内语言由 H5 自行持久化；原生侧留档，便于后续扩展。 */
        @JavascriptInterface
        public void setLocale(String lang) {
            try {
                getSharedPreferences("ak_prefs", MODE_PRIVATE)
                        .edit().putString("lang", lang).apply();
            } catch (Exception ignored) {
            }
        }

        @JavascriptInterface
        public void toast(String msg) {
            showToast(msg);
        }

        @JavascriptInterface
        public void copy(String text) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    ClipboardManager cm = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
                    if (cm != null) cm.setPrimaryClip(ClipData.newPlainText("安空工具箱", text));
                }
            });
        }

        @JavascriptInterface
        public void vibrate(String ms) {
            try {
                int n = Integer.parseInt(ms == null || ms.trim().isEmpty() ? "10" : ms.trim());
                if (n > 2000) n = 2000;
                Vibrator v = (Vibrator) getSystemService(VIBRATOR_SERVICE);
                if (v == null) return;
                if (Build.VERSION.SDK_INT >= 26) {
                    v.vibrate(VibrationEffect.createOneShot(n, VibrationEffect.DEFAULT_AMPLITUDE));
                } else {
                    v.vibrate(n);
                }
            } catch (Exception ignored) {
            }
        }

        @JavascriptInterface
        public void exit(String unused) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    finish();
                }
            });
        }

        @JavascriptInterface
        public void theme(final String mode) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    darkTheme = "dark".equals(mode);
                    applySystemUi();
                }
            });
        }

        @JavascriptInterface
        public void openUrl(String url) {
            try {
                startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
            } catch (Exception e) {
                showToast("无法打开链接");
            }
        }

        @JavascriptInterface
        public void share(String text) {
            try {
                Intent i = new Intent(Intent.ACTION_SEND);
                i.setType("text/plain");
                i.putExtra(Intent.EXTRA_TEXT, text);
                startActivity(Intent.createChooser(i, "分享"));
            } catch (Exception e) {
                showToast("分享失败");
            }
        }

        /** 主题色：记录当前配色，供系统栏外观统一使用。 */
        @JavascriptInterface
        public void accent(String mode) {
            accentMode = mode == null ? "amber" : mode;
        }

        /** 清理 WebView 缓存（H5「缓存管理」）。 */
        @JavascriptInterface
        public String clearCache(String unused) {
            runOnUiThread(new Runnable() {
                @Override public void run() {
                    try { web.clearCache(true); } catch (Exception ignored) {}
                }
            });
            return "ok";
        }

        /** 清理 WebView Cookie（H5「Cookie 管理」）。 */
        @JavascriptInterface
        public String clearCookies(String unused) {
            try {
                CookieManager cm = CookieManager.getInstance();
                if (Build.VERSION.SDK_INT >= 21) cm.removeAllCookies(null);
                else cm.removeAllCookie();
                cm.flush();
                return "ok";
            } catch (Exception e) {
                return "fail";
            }
        }

        /** 返回保存到「Pictures/安空工具箱」的图片列表 JSON。 */
        @JavascriptInterface
        public String listDownloads(String unused) {
            JSONArray arr = new JSONArray();
            try {
                if (Build.VERSION.SDK_INT >= 29) {
                    Cursor c = getContentResolver().query(
                            MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                            new String[]{MediaStore.Images.Media.DISPLAY_NAME,
                                    MediaStore.Images.Media.SIZE,
                                    MediaStore.Images.Media.DATE_ADDED},
                            MediaStore.Images.Media.RELATIVE_PATH + " LIKE ?",
                            new String[]{"Pictures/安空工具箱%"},
                            MediaStore.Images.Media.DATE_ADDED + " DESC");
                    if (c != null) {
                        while (c.moveToNext() && arr.length() < 100) {
                            JSONObject o = new JSONObject();
                            o.put("name", c.getString(0));
                            o.put("size", fmtBytes(c.getLong(1)));
                            o.put("time", fmtTime(c.getLong(2) * 1000L));
                            arr.put(o);
                        }
                        c.close();
                    }
                } else {
                    File dir = new File(
                            Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES),
                            "安空工具箱");
                    File[] fs = dir.listFiles();
                    if (fs != null) {
                        for (File f : fs) {
                            if (!f.isFile() || arr.length() >= 100) continue;
                            JSONObject o = new JSONObject();
                            o.put("name", f.getName());
                            o.put("size", fmtBytes(f.length()));
                            o.put("time", fmtTime(f.lastModified()));
                            arr.put(o);
                        }
                    }
                }
            } catch (Exception ignored) {
            }
            return arr.toString();
        }

        /** 删除「下载管理」中的单个文件。 */
        @JavascriptInterface
        public String deleteDownload(String name) {
            if (name == null || name.isEmpty()) return "fail";
            try {
                if (Build.VERSION.SDK_INT >= 29) {
                    int n = getContentResolver().delete(
                            MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                            MediaStore.Images.Media.DISPLAY_NAME + "=? AND "
                                    + MediaStore.Images.Media.RELATIVE_PATH + " LIKE ?",
                            new String[]{name, "Pictures/安空工具箱%"});
                    return n > 0 ? "ok" : "not_found";
                }
                File f = new File(new File(
                        Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES),
                        "安空工具箱"), name);
                return f.delete() ? "ok" : "not_found";
            } catch (Exception e) {
                return "fail";
            }
        }

        /** 「隐启设置」：拉起安卓原生设置页。 */
        @JavascriptInterface
        public void openSettings(final String which) {
            runOnUiThread(new Runnable() {
                @Override public void run() {
                    String k = which == null ? "" : which;
                    Intent i = null;
                    if ("wifi".equals(k)) i = new Intent(Settings.ACTION_WIFI_SETTINGS);
                    else if ("bluetooth".equals(k)) i = new Intent(Settings.ACTION_BLUETOOTH_SETTINGS);
                    else if ("display".equals(k)) i = new Intent(Settings.ACTION_DISPLAY_SETTINGS);
                    else if ("sound".equals(k)) i = new Intent(Settings.ACTION_SOUND_SETTINGS);
                    else if ("apps".equals(k)) i = new Intent(Settings.ACTION_APPLICATION_SETTINGS);
                    else if ("dev".equals(k)) i = new Intent(Settings.ACTION_APPLICATION_DEVELOPMENT_SETTINGS);
                    else if ("battery".equals(k)) i = new Intent(Settings.ACTION_BATTERY_SAVER_SETTINGS);
                    else if ("storage".equals(k)) i = new Intent(Settings.ACTION_INTERNAL_STORAGE_SETTINGS);
                    else if ("access".equals(k)) i = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
                    else if ("date".equals(k)) i = new Intent(Settings.ACTION_DATE_SETTINGS);
                    else if ("locale".equals(k)) i = new Intent(Settings.ACTION_LOCALE_SETTINGS);
                    else if ("about".equals(k)) i = new Intent(Settings.ACTION_DEVICE_INFO_SETTINGS);
                    if (i == null) {
                        // appinfo / webview / sys / 未知：打开本应用详情页
                        i = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
                                Uri.parse("package:" + getPackageName()));
                    }
                    try {
                        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        startActivity(i);
                    } catch (Exception e) {
                        try {
                            startActivity(new Intent(Settings.ACTION_SETTINGS)
                                    .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
                        } catch (Exception e2) {
                            showToast("无法打开系统设置");
                        }
                    }
                }
            });
        }

        private String fmtTime(long ms) {
            try {
                return new SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault())
                        .format(new Date(ms));
            } catch (Exception e) {
                return "—";
            }
        }

        @JavascriptInterface
        public String torch(String cmd) {
            if (Build.VERSION.SDK_INT < 23) return "unsupported";
            if (checkSelfPermission(Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
                requestPermissions(new String[]{Manifest.permission.CAMERA}, REQ_PERMISSION);
                return "need_permission";
            }
            try {
                CameraManager cm = (CameraManager) getSystemService(CAMERA_SERVICE);
                if (cm == null) return "no_flash";
                if (cameraId == null) {
                    for (String id : cm.getCameraIdList()) {
                        Boolean has = cm.getCameraCharacteristics(id)
                                .get(CameraCharacteristics.FLASH_INFO_AVAILABLE);
                        if (has != null && has) {
                            cameraId = id;
                            break;
                        }
                    }
                }
                if (cameraId == null) return "no_flash";
                boolean on = "on".equals(cmd);
                cm.setTorchMode(cameraId, on);
                return on ? "on" : "off";
            } catch (Exception e) {
                return "error:" + e.getMessage();
            }
        }

        /** 保存 Data URL 图片到系统相册（Pictures/安空工具箱）。 */
        @JavascriptInterface
        public String saveImage(String json) {
            try {
                JSONObject o = new JSONObject(json);
                String data = o.getString("data");
                String name = o.optString("name", "ankong.png");
                String b64 = data.indexOf(',') >= 0
                        ? data.substring(data.indexOf(',') + 1) : data;
                byte[] bytes = Base64.decode(b64, Base64.DEFAULT);
                boolean png = data.startsWith("data:image/png");
                String mime = png ? "image/png" : "image/jpeg";
                String ext = png ? ".png" : ".jpg";
                if (!name.endsWith(ext)) {
                    int dot = name.lastIndexOf('.');
                    name = (dot > 0 ? name.substring(0, dot) : name) + ext;
                }
                name = name.replace('/', '_').replace('\\', '_');

                if (Build.VERSION.SDK_INT >= 29) {
                    ContentValues cv = new ContentValues();
                    cv.put(MediaStore.Images.Media.DISPLAY_NAME, name);
                    cv.put(MediaStore.Images.Media.MIME_TYPE, mime);
                    cv.put(MediaStore.Images.Media.RELATIVE_PATH,
                            Environment.DIRECTORY_PICTURES + "/安空工具箱");
                    Uri uri = getContentResolver().insert(
                            MediaStore.Images.Media.EXTERNAL_CONTENT_URI, cv);
                    if (uri == null) return "fail";
                    OutputStream os = getContentResolver().openOutputStream(uri);
                    if (os == null) return "fail";
                    os.write(bytes);
                    os.close();
                } else {
                    File dir = new File(
                            Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES),
                            "安空工具箱");
                    if (!dir.exists() && !dir.mkdirs()) return "fail";
                    File f = new File(dir, name);
                    FileOutputStream fos = new FileOutputStream(f);
                    fos.write(bytes);
                    fos.close();
                    MediaScannerConnection.scanFile(MainActivity.this,
                            new String[]{f.getAbsolutePath()}, new String[]{mime}, null);
                }
                showToast("已保存到相册「Pictures/安空工具箱」");
                return "ok";
            } catch (Exception e) {
                showToast("保存失败：" + e.getMessage());
                return "fail";
            }
        }

        /** 返回设备硬件 / 系统信息 JSON 字符串。 */
        @JavascriptInterface
        public String deviceInfo(String unused) {
            try {
                JSONObject o = new JSONObject();
                o.put("device", Build.MANUFACTURER + " " + Build.MODEL);
                o.put("system", "Android " + Build.VERSION.RELEASE);
                o.put("android", Build.VERSION.RELEASE + " (API " + Build.VERSION.SDK_INT + ")");
                o.put("cpu", Build.HARDWARE + " / "
                        + (Build.SUPPORTED_ABIS.length > 0 ? Build.SUPPORTED_ABIS[0] : "—"));

                ActivityManager am = (ActivityManager) getSystemService(ACTIVITY_SERVICE);
                if (am != null) {
                    ActivityManager.MemoryInfo mi = new ActivityManager.MemoryInfo();
                    am.getMemoryInfo(mi);
                    o.put("memory", fmtBytes(mi.totalMem) + "（可用 " + fmtBytes(mi.availMem) + "）");
                }
                try {
                    StatFs st = new StatFs(Environment.getDataDirectory().getPath());
                    o.put("storage", fmtBytes(st.getTotalBytes()) + "（可用 "
                            + fmtBytes(st.getAvailableBytes()) + "）");
                } catch (Exception ignored) {
                }

                DisplayMetrics dm = new DisplayMetrics();
                getWindowManager().getDefaultDisplay().getRealMetrics(dm);
                o.put("screen", dm.widthPixels + " × " + dm.heightPixels + " px");
                o.put("density", String.format("%.0f dpi", dm.xdpi));
                boolean pc = getPackageManager().hasSystemFeature("android.hardware.type.pc");
                boolean arc = getPackageManager().hasSystemFeature("org.chromium.arc");
                String form = (pc || arc) ? "ChromeOS / 桌面模式"
                        : (getResources().getConfiguration().smallestScreenWidthDp >= 600 ? "平板" : "手机");
                o.put("form", form);
                o.put("window", dm.widthPixels + " × " + dm.heightPixels + " px · " + form);

                if (Build.VERSION.SDK_INT >= 21) {
                    BatteryManager bm = (BatteryManager) getSystemService(BATTERY_SERVICE);
                    if (bm != null) {
                        o.put("battery", bm.getIntProperty(
                                BatteryManager.BATTERY_PROPERTY_CAPACITY) + "%");
                    }
                }

                ConnectivityManager cm =
                        (ConnectivityManager) getSystemService(CONNECTIVITY_SERVICE);
                if (cm != null) {
                    NetworkInfo ni = cm.getActiveNetworkInfo();
                    if (ni != null && ni.isConnected()) {
                        o.put("network", ni.getTypeName() + (ni.getType() == ConnectivityManager.TYPE_WIFI
                                ? "（WLAN）" : "（移动数据）"));
                    } else {
                        o.put("network", "未连接");
                    }
                }
                o.put("app", "安空工具箱 v1.5");
                return o.toString();
            } catch (Exception e) {
                return "{}";
            }
        }

        private String fmtBytes(long b) {
            if (b <= 0) return "—";
            String[] u = {"B", "KB", "MB", "GB", "TB"};
            double v = b;
            int i = 0;
            while (v >= 1024 && i < u.length - 1) {
                v /= 1024;
                i++;
            }
            return String.format("%.1f %s", v, u[i]);
        }
    }
}
