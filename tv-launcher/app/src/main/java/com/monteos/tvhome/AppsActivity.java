package com.monteos.tvhome;

import android.app.Activity;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.graphics.drawable.Drawable;
import android.os.Bundle;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.Toast;

import java.text.Collator;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Every app installed on the TV, as tiles, so this launcher never strands you. */
public class AppsActivity extends Activity {

    private static final int COLUMNS = 5;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_apps);
        Immersive.apply(this);

        List<TileGrid.Tile> tiles = new ArrayList<>();
        for (ResolveInfo ri : launchableApps(this)) {
            ActivityInfo ai = ri.activityInfo;
            TileGrid.Tile t = new TileGrid.Tile();
            t.type = "app";
            t.title = String.valueOf(ri.loadLabel(getPackageManager()));
            t.pkg = ai.packageName;
            t.image = artFor(ai);
            t.intent = new Intent(Intent.ACTION_MAIN)
                    .setComponent(new ComponentName(ai.packageName, ai.name))
                    .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK
                            | Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED);
            tiles.add(t);
        }

        int screenW = getResources().getDisplayMetrics().widthPixels;
        int tileW = (screenW - TileGrid.dp(this, 112)) / COLUMNS - TileGrid.dp(this, 28);
        int tileH = Math.round(tileW * 0.78f);

        LinearLayout container = findViewById(R.id.tiles);
        View first = TileGrid.build(this, container, tiles, COLUMNS, tileH, tile -> {
            try {
                startActivity(tile.intent);
            } catch (RuntimeException e) {
                Toast.makeText(this, R.string.cannot_open, Toast.LENGTH_LONG).show();
            }
        });
        if (first != null) first.requestFocus();
    }

    @Override
    protected void onResume() {
        super.onResume();
        Immersive.apply(this);
    }

    /** The TV banner if the app has one, else its icon. */
    private Drawable artFor(ActivityInfo ai) {
        PackageManager pm = getPackageManager();
        Drawable banner = ai.loadBanner(pm);
        return banner != null ? banner : ai.loadIcon(pm);
    }

    /** TV apps first, then phone-style apps, one entry per app, sorted by name. */
    static List<ResolveInfo> launchableApps(Context context) {
        PackageManager pm = context.getPackageManager();
        Map<String, ResolveInfo> byPackage = new LinkedHashMap<>();
        String[] categories = {Intent.CATEGORY_LEANBACK_LAUNCHER, Intent.CATEGORY_LAUNCHER};
        for (String category : categories) {
            Intent query = new Intent(Intent.ACTION_MAIN).addCategory(category);
            for (ResolveInfo ri : pm.queryIntentActivities(query, 0)) {
                String pkg = ri.activityInfo.packageName;
                if (pkg.equals(context.getPackageName())) continue;
                if (!byPackage.containsKey(pkg)) byPackage.put(pkg, ri);
            }
        }
        List<ResolveInfo> apps = new ArrayList<>(byPackage.values());
        Collator collator = Collator.getInstance();
        Collections.sort(apps, (a, b) -> collator.compare(
                String.valueOf(a.loadLabel(pm)), String.valueOf(b.loadLabel(pm))));
        return apps;
    }

    /** Launch intent for an "app" tile in tiles.json; null if it isn't installed. */
    static Intent launchIntentFor(Context context, String pkg) {
        if (pkg == null || pkg.isEmpty()) return null;
        PackageManager pm = context.getPackageManager();
        Intent i = pm.getLeanbackLaunchIntentForPackage(pkg);
        if (i == null) i = pm.getLaunchIntentForPackage(pkg);
        if (i != null) i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        return i;
    }
}
