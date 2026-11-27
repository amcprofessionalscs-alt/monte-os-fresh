package com.monteos.tvhome;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ResolveInfo;
import android.util.Log;

/**
 * Opens Monte TV once the TV has booted. When Monte TV is the default home screen the
 * system already does this, so this is the fallback for TVs (some Google TV builds) that
 * keep their own launcher as home. On Android 10+ it needs the "display over other apps"
 * permission, which the install script grants.
 */
public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        if (!Intent.ACTION_BOOT_COMPLETED.equals(action)
                && !Intent.ACTION_LOCKED_BOOT_COMPLETED.equals(action)
                && !"android.intent.action.QUICKBOOT_POWERON".equals(action)) {
            return;
        }
        Intent home = new Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_HOME);
        ResolveInfo ri = context.getPackageManager().resolveActivity(home, 0);
        if (ri != null && ri.activityInfo != null
                && context.getPackageName().equals(ri.activityInfo.packageName)) {
            return;   // already the home screen; the system will show it
        }
        try {
            context.startActivity(new Intent(context, MainActivity.class)
                    .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
        } catch (RuntimeException e) {
            Log.w("MonteTV", "Could not open on boot", e);
        }
    }
}
