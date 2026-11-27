package com.monteos.tvhome;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.KeyEvent;
import android.view.View;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ProgressBar;
import android.widget.TextView;

/**
 * Shows one web tile (the dashboard, Jarvis, ...) full screen. Back goes back a page, or
 * home from the first page. If the page fails to load, OK retries, and it also retries
 * on its own every 30 seconds so a wall TV recovers after a Wi-Fi drop.
 */
public class WebActivity extends Activity {

    static final String EXTRA_URL = "url";
    static final String EXTRA_TITLE = "title";
    private static final long RETRY_MS = 30_000;

    private WebView web;
    private View cover;
    private ProgressBar spinner;
    private TextView status;
    private boolean failed;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Runnable autoRetry = this::retry;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_web);
        // Dashboards stay on the wall: don't let the screen saver take over.
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        Immersive.apply(this);

        web = findViewById(R.id.web);
        cover = findViewById(R.id.cover);
        spinner = findViewById(R.id.spinner);
        status = findViewById(R.id.status);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setSupportMultipleWindows(false);
        // Present as the regular Chrome browser rather than an embedded WebView.
        s.setUserAgentString(s.getUserAgentString().replace("; wv", ""));

        CookieManager cookies = CookieManager.getInstance();
        cookies.setAcceptCookie(true);
        cookies.setAcceptThirdPartyCookies(web, true);

        web.setBackgroundColor(0xFF0B0F14);   // matches @color/bg, avoids a white flash
        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new Client());

        String url = getIntent().getStringExtra(EXTRA_URL);
        if (url == null) { finish(); return; }
        web.loadUrl(url);
        web.requestFocus();
    }

    private final class Client extends WebViewClient {
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            return handleLink(request.getUrl());
        }

        @SuppressWarnings("deprecation")
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            return handleLink(Uri.parse(url));
        }

        @Override
        public void onPageStarted(WebView view, String url, Bitmap favicon) {
            failed = false;
        }

        @Override
        public void onPageFinished(WebView view, String url) {
            if (!failed) {
                cover.setVisibility(View.GONE);
                CookieManager.getInstance().flush();   // stay signed in across restarts
            }
        }

        @Override
        public void onReceivedError(WebView view, WebResourceRequest request,
                                    WebResourceError error) {
            if (request.isForMainFrame()) showError();
        }

        @SuppressWarnings("deprecation")
        @Override
        public void onReceivedError(WebView view, int errorCode, String description,
                                    String failingUrl) {
            showError();
        }
    }

    /** Web links stay in this viewer; anything else (app links, mailto) opens its app. */
    private boolean handleLink(Uri uri) {
        String scheme = uri.getScheme();
        if ("http".equals(scheme) || "https".equals(scheme)) return false;
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, uri));
        } catch (ActivityNotFoundException ignored) {
            // Nothing on the TV handles it; stay on the page.
        }
        return true;
    }

    private void showError() {
        failed = true;
        spinner.setVisibility(View.GONE);
        status.setText(R.string.load_failed);
        cover.setVisibility(View.VISIBLE);
        cover.setFocusable(true);
        cover.requestFocus();
        handler.removeCallbacks(autoRetry);
        handler.postDelayed(autoRetry, RETRY_MS);
    }

    private void retry() {
        handler.removeCallbacks(autoRetry);
        failed = false;
        spinner.setVisibility(View.VISIBLE);
        status.setText(R.string.loading);
        web.reload();
        web.requestFocus();
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (failed && (keyCode == KeyEvent.KEYCODE_DPAD_CENTER
                || keyCode == KeyEvent.KEYCODE_ENTER)) {
            retry();
            return true;
        }
        if (keyCode == KeyEvent.KEYCODE_BACK && !failed && web.canGoBack()) {
            web.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    protected void onResume() {
        super.onResume();
        Immersive.apply(this);
        web.onResume();
    }

    @Override
    protected void onPause() {
        web.onPause();
        CookieManager.getInstance().flush();
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        handler.removeCallbacksAndMessages(null);
        web.destroy();
        super.onDestroy();
    }
}
