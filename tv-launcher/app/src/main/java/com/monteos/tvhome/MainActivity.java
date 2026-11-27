package com.monteos.tvhome;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.ResolveInfo;
import android.os.Bundle;
import android.provider.Settings;
import android.util.Log;
import android.view.KeyEvent;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/** The home screen: header with a live clock, and a grid of big tiles. */
public class MainActivity extends Activity {

    private static final String TAG = "MonteTV";
    private static final String CONFIG_NAME = "tiles.json";

    private View firstTile;
    /** Which tiles.json the grid was last built from, to rebuild only when it changes. */
    private long builtFromStamp = Long.MIN_VALUE;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        Immersive.apply(this);
        buildTiles();
    }

    @Override
    protected void onResume() {
        super.onResume();
        Immersive.apply(this);
        // Rebuild if a new tiles.json was pushed to the TV, so it shows without a restart.
        if (configStamp() != builtFromStamp) buildTiles();
    }

    private long configStamp() {
        File dir = getExternalFilesDir(null);
        File override = dir == null ? null : new File(dir, CONFIG_NAME);
        return override != null && override.isFile() ? override.lastModified() : 0L;
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        // Home pressed while already home: jump back to the first tile.
        ScrollView scroll = findViewById(R.id.scroll);
        scroll.smoothScrollTo(0, 0);
        if (firstTile != null) firstTile.requestFocus();
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        // As the default home screen there is nowhere to go "back" to, so stay put.
        if (keyCode == KeyEvent.KEYCODE_BACK && isDefaultHome()) return true;
        return super.onKeyDown(keyCode, event);
    }

    private boolean isDefaultHome() {
        Intent home = new Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_HOME);
        ResolveInfo ri = getPackageManager().resolveActivity(home, 0);
        return ri != null && ri.activityInfo != null
                && getPackageName().equals(ri.activityInfo.packageName);
    }

    private void buildTiles() {
        builtFromStamp = configStamp();
        View focused = getCurrentFocus();
        int focusedIndex = indexOfTile(focused);

        List<TileGrid.Tile> tiles = new ArrayList<>();
        int columns = 2;
        try {
            JSONObject config = new JSONObject(readConfig());
            String title = config.optString("title", "");
            if (!title.isEmpty()) ((TextView) findViewById(R.id.title)).setText(title);
            columns = Math.max(1, Math.min(6, config.optInt("columns", 2)));
            JSONArray arr = config.getJSONArray("tiles");
            for (int i = 0; i < arr.length(); i++) {
                JSONObject o = arr.getJSONObject(i);
                TileGrid.Tile t = new TileGrid.Tile();
                t.type = o.optString("type", "web");
                t.title = o.optString("title", "");
                t.subtitle = o.optString("subtitle", "");
                t.glyph = o.optString("glyph", "");
                t.url = o.optString("url", null);
                t.pkg = o.optString("package", null);
                tiles.add(t);
            }
        } catch (Exception e) {
            Log.e(TAG, "Bad tiles.json", e);
        }

        if (tiles.isEmpty()) {
            TileGrid.Tile t = new TileGrid.Tile();
            t.type = "settings";
            t.title = getString(R.string.no_tiles);
            t.glyph = "!";
            tiles.add(t);
        }

        LinearLayout container = findViewById(R.id.tiles);
        firstTile = TileGrid.build(this, container, tiles, columns, tileHeight(), this::open);

        // Keep focus where it was (e.g. coming back from a page), else start on tile one.
        View restore = tileAt(focusedIndex);
        if (restore != null) restore.requestFocus();
        else if (firstTile != null) firstTile.requestFocus();
    }

    /** Two rows of tiles fill the screen under the header; more rows scroll. */
    private int tileHeight() {
        int screen = getResources().getDisplayMetrics().heightPixels;
        int chrome = TileGrid.dp(this, 32 + 120 + 24 + 12 + 32);   // padding + header + gaps
        int perRowMargins = TileGrid.dp(this, 28);
        int h = (screen - chrome) / 2 - perRowMargins;
        return Math.max(h, TileGrid.dp(this, 160));
    }

    private int indexOfTile(View v) {
        if (v == null) return -1;
        LinearLayout container = findViewById(R.id.tiles);
        int index = 0;
        for (int r = 0; r < container.getChildCount(); r++) {
            LinearLayout row = (LinearLayout) container.getChildAt(r);
            for (int c = 0; c < row.getChildCount(); c++) {
                View cell = row.getChildAt(c);
                if (!cell.isFocusable()) continue;
                if (cell == v) return index;
                index++;
            }
        }
        return -1;
    }

    private View tileAt(int wanted) {
        if (wanted < 0) return null;
        LinearLayout container = findViewById(R.id.tiles);
        int index = 0;
        for (int r = 0; r < container.getChildCount(); r++) {
            LinearLayout row = (LinearLayout) container.getChildAt(r);
            for (int c = 0; c < row.getChildCount(); c++) {
                View cell = row.getChildAt(c);
                if (!cell.isFocusable()) continue;
                if (index == wanted) return cell;
                index++;
            }
        }
        return null;
    }

    private void open(TileGrid.Tile tile) {
        try {
            switch (tile.type) {
                case "web":
                    if (tile.url == null || tile.url.isEmpty()) throw new ActivityNotFoundException();
                    startActivity(new Intent(this, WebActivity.class)
                            .putExtra(WebActivity.EXTRA_URL, tile.url)
                            .putExtra(WebActivity.EXTRA_TITLE, tile.title));
                    break;
                case "apps":
                    startActivity(new Intent(this, AppsActivity.class));
                    break;
                case "settings":
                    startActivity(new Intent(Settings.ACTION_SETTINGS));
                    break;
                case "app": {
                    Intent launch = AppsActivity.launchIntentFor(this, tile.pkg);
                    if (launch == null) throw new ActivityNotFoundException();
                    startActivity(launch);
                    break;
                }
                default:
                    throw new ActivityNotFoundException();
            }
        } catch (ActivityNotFoundException | SecurityException e) {
            Toast.makeText(this, R.string.cannot_open, Toast.LENGTH_LONG).show();
        }
    }

    /**
     * Uses a tiles.json pushed to the TV if there is one (no rebuild needed), otherwise
     * the copy built into the app.
     */
    private String readConfig() throws IOException {
        File dir = getExternalFilesDir(null);
        if (dir != null) {
            File override = new File(dir, CONFIG_NAME);
            if (override.isFile()) {
                try (InputStream in = new FileInputStream(override)) {
                    return readAll(in);
                } catch (IOException e) {
                    Log.w(TAG, "Could not read " + override + ", using built-in tiles", e);
                }
            }
        }
        try (InputStream in = getAssets().open(CONFIG_NAME)) {
            return readAll(in);
        }
    }

    private static String readAll(InputStream in) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        byte[] buf = new byte[8192];
        int n;
        while ((n = in.read(buf)) != -1) out.write(buf, 0, n);
        return out.toString(StandardCharsets.UTF_8.name());
    }
}
