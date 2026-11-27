package com.monteos.tvhome;

import android.app.Activity;
import android.content.Intent;
import android.graphics.drawable.Drawable;
import android.util.TypedValue;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import java.util.List;
import java.util.Locale;

/**
 * Lays tiles out in rows of equal-width cells. Each tile is a focusable view, so the
 * remote's arrow buttons move between them using Android's built-in focus search, and
 * the focused tile gets a yellow ring (drawable/tile_bg.xml) plus a small zoom.
 */
final class TileGrid {

    /** What a tile shows and does. Either {@code url}/{@code type} or {@code intent} is used. */
    static final class Tile {
        String type = "web";
        String title = "";
        String subtitle = "";
        String glyph = "";
        String url;
        String pkg;
        Drawable image;
        Intent intent;
    }

    interface OnTileClick {
        void onClick(Tile tile);
    }

    private static final float FOCUS_SCALE = 1.04f;

    private TileGrid() {}

    static int dp(Activity a, float dp) {
        return Math.round(TypedValue.applyDimension(
                TypedValue.COMPLEX_UNIT_DIP, dp, a.getResources().getDisplayMetrics()));
    }

    /**
     * Replaces the contents of {@code container} with rows of tiles.
     *
     * @return the first tile view, so the caller can give it focus; null if there are none.
     */
    static View build(Activity activity, LinearLayout container, List<Tile> tiles,
                      int columns, int tileHeightPx, OnTileClick listener) {
        container.removeAllViews();
        LayoutInflater inflater = LayoutInflater.from(activity);
        int gap = dp(activity, 14);
        View first = null;
        LinearLayout row = null;

        for (int i = 0; i < tiles.size(); i++) {
            if (i % columns == 0) {
                row = new LinearLayout(activity);
                row.setOrientation(LinearLayout.HORIZONTAL);
                row.setClipChildren(false);
                row.setClipToPadding(false);
                container.addView(row, new LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.MATCH_PARENT,
                        LinearLayout.LayoutParams.WRAP_CONTENT));
            }

            final Tile tile = tiles.get(i);
            View view = inflater.inflate(R.layout.tile, row, false);
            bind(view, tile);

            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, tileHeightPx, 1f);
            lp.setMargins(gap, gap, gap, gap);
            row.addView(view, lp);

            view.setOnClickListener(v -> listener.onClick(tile));
            view.setOnFocusChangeListener(TileGrid::animateFocus);
            if (first == null) first = view;
        }

        // Pad the last row with empty cells so every tile keeps the same width.
        if (row != null) {
            int remainder = tiles.size() % columns;
            if (remainder != 0) {
                for (int i = remainder; i < columns; i++) {
                    View spacer = new View(activity);
                    LinearLayout.LayoutParams lp =
                            new LinearLayout.LayoutParams(0, tileHeightPx, 1f);
                    lp.setMargins(gap, gap, gap, gap);
                    row.addView(spacer, lp);
                }
            }
        }
        return first;
    }

    private static void bind(View view, Tile tile) {
        TextView label = view.findViewById(R.id.label);
        TextView subtitle = view.findViewById(R.id.subtitle);
        TextView glyph = view.findViewById(R.id.glyph);
        ImageView image = view.findViewById(R.id.image);

        label.setText(tile.title);
        if (tile.subtitle == null || tile.subtitle.isEmpty()) {
            subtitle.setVisibility(View.GONE);
        } else {
            subtitle.setText(tile.subtitle);
        }

        if (tile.image != null) {
            image.setImageDrawable(tile.image);
            image.setVisibility(View.VISIBLE);
            glyph.setVisibility(View.GONE);
        } else {
            String g = tile.glyph;
            if ((g == null || g.isEmpty()) && tile.title != null && !tile.title.isEmpty()) {
                g = tile.title.substring(0, 1);
            }
            glyph.setText(g == null ? "" : g.toUpperCase(Locale.getDefault()));
        }
        view.setContentDescription(tile.title);
    }

    private static void animateFocus(View v, boolean hasFocus) {
        float scale = hasFocus ? FOCUS_SCALE : 1f;
        v.animate().scaleX(scale).scaleY(scale).setDuration(140).start();
        v.setTranslationZ(hasFocus ? 12f : 0f);
    }
}
