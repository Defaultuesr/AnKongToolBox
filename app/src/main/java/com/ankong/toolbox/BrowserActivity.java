package com.ankong.toolbox;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.text.InputType;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.DownloadListener;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

/**
 * 内置浏览器：基于设备自带的 Chromium / Android System WebView 内核。
 * 纯 Java 布局，不依赖额外资源；网页由目标站点直接加载，不经过本应用服务器。
 * 顶部常驻「关闭」按钮，返回键先回退网页再退出，随时可离开。
 */
public class BrowserActivity extends Activity {

    private WebView web;
    private EditText addr;
    private TextView title;
    private static final String HOME = "https://www.baidu.com";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        int dp = Math.max(1, (int) getResources().getDisplayMetrics().density);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.parseColor("#FFFDF3"));

        // 顶栏：关闭 + 标题
        LinearLayout top = new LinearLayout(this);
        top.setOrientation(LinearLayout.HORIZONTAL);
        top.setGravity(Gravity.CENTER_VERTICAL);
        top.setPadding(8 * dp, 6 * dp, 8 * dp, 4 * dp);
        Button close = smallBtn("关闭");
        close.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) { finish(); }
        });
        title = new TextView(this);
        title.setText("内置浏览器");
        title.setTextSize(15f);
        title.setTextColor(Color.parseColor("#3A3418"));
        LinearLayout.LayoutParams tp = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f);
        tp.setMarginStart(10 * dp);
        title.setLayoutParams(tp);
        top.addView(close);
        top.addView(title);

        // 地址栏
        LinearLayout bar = new LinearLayout(this);
        bar.setOrientation(LinearLayout.HORIZONTAL);
        bar.setPadding(8 * dp, 0, 8 * dp, 6 * dp);
        addr = new EditText(this);
        addr.setSingleLine(true);
        addr.setInputType(InputType.TYPE_TEXT_VARIATION_URI);
        addr.setHint("输入网址");
        addr.setTextSize(14f);
        addr.setLayoutParams(new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f));
        addr.setOnEditorActionListener(new TextView.OnEditorActionListener() {
            @Override public boolean onEditorAction(TextView v, int actionId, KeyEvent event) {
                load(v.getText().toString());
                return true;
            }
        });
        Button go = smallBtn("前往");
        go.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) { load(addr.getText().toString()); }
        });
        bar.addView(addr);
        bar.addView(go);

        // 导航条
        LinearLayout nav = new LinearLayout(this);
        nav.setOrientation(LinearLayout.HORIZONTAL);
        nav.setPadding(6 * dp, 0, 6 * dp, 4 * dp);
        String[] labels = {"← 后退", "前进 →", "刷新", "停止", "主页", "关闭"};
        for (int i = 0; i < labels.length; i++) {
            final int idx = i;
            Button b = smallBtn(labels[i]);
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f);
            lp.setMarginStart(2 * dp);
            b.setLayoutParams(lp);
            b.setOnClickListener(new View.OnClickListener() {
                @Override public void onClick(View v) {
                    switch (idx) {
                        case 0: if (web.canGoBack()) web.goBack(); break;
                        case 1: if (web.canGoForward()) web.goForward(); break;
                        case 2: web.reload(); break;
                        case 3: web.stopLoading(); break;
                        case 4: load(HOME); break;
                        default: finish(); break;
                    }
                }
            });
            nav.addView(b);
        }

        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setAllowFileAccessFromFileURLs(false);
        s.setAllowUniversalAccessFromFileURLs(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setSupportZoom(true);
        s.setBuiltInZoomControls(true);
        s.setDisplayZoomControls(false);
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(true);

        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return handleUri(request.getUrl());
            }
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return handleUri(Uri.parse(url));
            }
            @Override
            public void onPageFinished(WebView view, String url) {
                addr.setText(url);
                if (view.getTitle() != null) title.setText(view.getTitle());
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override public void onReceivedTitle(WebView view, String t) {
                if (t != null && !t.isEmpty()) title.setText(t);
            }
        });
        web.setDownloadListener(new DownloadListener() {
            @Override public void onDownloadStart(String url, String userAgent, String contentDisposition,
                                                   String mimetype, long contentLength) {
                try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url))); }
                catch (Exception ignored) {}
            }
        });

        root.addView(top);
        root.addView(bar);
        root.addView(nav);
        root.addView(web, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f));
        setContentView(root);

        String u = getIntent().getStringExtra("url");
        load(u == null || u.trim().isEmpty() ? HOME : u.trim());
    }

    private boolean handleUri(Uri u) {
        if (u == null) return true;
        String sc = u.getScheme();
        if ("http".equalsIgnoreCase(sc) || "https".equalsIgnoreCase(sc)) return false;
        try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception ignored) {}
        return true;
    }

    private String normalize(String u) {
        String x = u == null ? "" : u.trim();
        if (x.isEmpty()) return HOME;
        if (!x.matches("(?i)^[a-z][a-z0-9+.-]*://.*")) x = "https://" + x;
        return x;
    }

    private void load(String raw) {
        String u = normalize(raw);
        if (!u.startsWith("http://") && !u.startsWith("https://")) {
            Toast.makeText(this, "仅支持 http / https 网址", Toast.LENGTH_SHORT).show();
            return;
        }
        addr.setText(u);
        web.loadUrl(u);
    }

    private Button smallBtn(String t) {
        Button b = new Button(this);
        b.setText(t);
        b.setAllCaps(false);
        b.setTextSize(12f);
        b.setMinWidth(0);
        b.setMinimumWidth(0);
        int dp = Math.max(1, (int) getResources().getDisplayMetrics().density);
        b.setPadding(6 * dp, 2 * dp, 6 * dp, 2 * dp);
        return b;
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && web != null && web.canGoBack()) {
            web.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    protected void onDestroy() {
        try { if (web != null) web.destroy(); } catch (Exception ignored) {}
        super.onDestroy();
    }
}
