package com.superpaw.try4;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.Toast;
import androidx.webkit.WebViewAssetLoader;
import org.json.JSONObject;
import org.json.JSONTokener;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

/** Offline native host. No JavaScript interface, arbitrary URLs, network or payment access. */
public final class MainActivity extends Activity {
    private static final String BASE = "https://appassets.androidplatform.net/assets/web/";
    private static final int EXPORT = 41, IMPORT = 42, LIMIT = 1801000, CHUNK = 24000;
    private WebView web;
    private boolean transferring;

    @Override public void onCreate(Bundle saved) {
        super.onCreate(saved);
        LinearLayout root = new LinearLayout(this); root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.rgb(9,19,45));
        // Respect system insets on Android's edge-to-edge displays.
        root.setOnApplyWindowInsetsListener((v,insets) -> {
            v.setPadding(insets.getSystemWindowInsetLeft(),insets.getSystemWindowInsetTop(),insets.getSystemWindowInsetRight(),insets.getSystemWindowInsetBottom());return insets;
        });
        LinearLayout bar = new LinearLayout(this);
        addButton(bar,"Studio",() -> navigate("studio.html"));
        addButton(bar,"Games",() -> navigate("index.html"));
        addButton(bar,"Export",() -> chooseExport());
        addButton(bar,"Restore",() -> chooseImport());
        root.addView(bar);
        web = new WebView(this);
        root.addView(web,new LinearLayout.LayoutParams(-1,0,1));setContentView(root);
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);settings.setAllowContentAccess(false);
        settings.setAllowFileAccessFromFileURLs(false);settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);settings.setSupportMultipleWindows(false);
        settings.setMediaPlaybackRequiresUserGesture(true);
        CookieManager.getInstance().setAcceptCookie(false);
        CookieManager.getInstance().setAcceptThirdPartyCookies(web,false);
        WebView.setWebContentsDebuggingEnabled(false);
        final WebViewAssetLoader loader = new WebViewAssetLoader.Builder().addPathHandler("/assets/",new WebViewAssetLoader.AssetsPathHandler(this)).build();
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                if (allowed(req.getUrl())) return false;
                toast("External links are disabled in this offline app.");return true;
            }
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
                if (allowed(req.getUrl()) && "GET".equals(req.getMethod())) {
                    WebResourceResponse local = loader.shouldInterceptRequest(req.getUrl());
                    if (local != null) return local;
                }
                return new WebResourceResponse("text/plain","UTF-8",403,"Blocked",java.util.Collections.emptyMap(),new ByteArrayInputStream(new byte[0]));
            }
        });
        web.setDownloadListener((url,agent,disposition,mime,length) -> toast("Use Export in the native toolbar to save your workspace and drafts."));
        navigate("studio.html");
    }
    private boolean allowed(Uri uri) {
        return "https".equals(uri.getScheme()) && "appassets.androidplatform.net".equals(uri.getHost()) && uri.getPort()==-1 && uri.getUserInfo()==null && uri.getPath()!=null && uri.getPath().startsWith("/assets/web/") && !uri.getPath().contains("..");
    }
    private void addButton(LinearLayout row,String title,Runnable action) {
        Button b=new Button(this);b.setText(title);b.setTextSize(12);b.setMinHeight(48);b.setOnClickListener(v->action.run());row.addView(b,new LinearLayout.LayoutParams(0,-2,1));
    }
    private void navigate(String file) { if(transferring){toast("Wait for the backup operation to finish.");return;}web.loadUrl(BASE+file); }
    private boolean inStudio() { return web.getUrl()!=null && (BASE+"studio.html").equals(web.getUrl().split("#",2)[0]); }
    private void toast(String message) { runOnUiThread(()->Toast.makeText(this,message,Toast.LENGTH_LONG).show()); }
    private void chooseExport() {
        if(!inStudio()||transferring){toast("Open Studio first and finish any backup operation.");return;}
        Intent intent=new Intent(Intent.ACTION_CREATE_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType("application/json").putExtra(Intent.EXTRA_TITLE,"try4-workspace.json");
        startActivityForResult(intent,EXPORT);
    }
    private void chooseImport() {
        if(!inStudio()||transferring){toast("Open Studio first and finish any backup operation.");return;}
        new AlertDialog.Builder(this).setTitle("Restore workspace?").setMessage("This replaces your local studio drafts and transaction records. Export a backup first if needed.").setNegativeButton("Cancel",null).setPositiveButton("Choose backup",(d,w)->{
            Intent intent=new Intent(Intent.ACTION_OPEN_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType("application/json");startActivityForResult(intent,IMPORT);
        }).show();
    }
    @Override protected void onActivityResult(int request,int result,Intent data) {
        super.onActivityResult(request,result,data);
        if(result!=RESULT_OK||data==null||data.getData()==null)return;
        if(!inStudio()){toast("Return to Studio and try again.");return;}
        Uri uri=data.getData();transferring=true;
        if(request==EXPORT) {
            web.evaluateJavascript("(()=>{if(!window.try4Export)return -1;window.__try4Backup=window.try4Export();return window.__try4Backup.length;})()",value->{
                try {int length=Integer.parseInt(value);if(length<1||length>LIMIT)throw new Exception();collectBackup(uri,length,0,new StringBuilder());}
                catch(Exception e){finishTransfer("Could not prepare backup.");}
            });
        } else if(request==IMPORT) {
            new Thread(()->{
                try(InputStream input=getContentResolver().openInputStream(uri);ByteArrayOutputStream out=new ByteArrayOutputStream()) {
                    if(input==null)throw new Exception();byte[] buffer=new byte[8192];int n;
                    while((n=input.read(buffer))!=-1){if(out.size()+n>LIMIT)throw new Exception();out.write(buffer,0,n);}
                    String raw=out.toString(StandardCharsets.UTF_8.name());
                    JSONObject envelope=new JSONObject(raw);if(!"Try4 Core".equals(envelope.optString("app"))||envelope.optInt("version")!=2)throw new Exception();
                    runOnUiThread(()->{web.evaluateJavascript("window.__try4Incoming='';",v->sendImport(raw,0));});
                } catch(Exception e){runOnUiThread(()->finishTransfer("Backup rejected or unreadable. Existing records kept."));}
            }).start();
        } else finishTransfer("Unknown operation.");
    }
    private void collectBackup(Uri uri,int length,int offset,StringBuilder content) {
        int end=Math.min(length,offset+CHUNK);
        web.evaluateJavascript("window.__try4Backup.slice("+offset+","+end+")",value->{
            try {Object decoded=new JSONTokener(value).nextValue();if(!(decoded instanceof String))throw new Exception();content.append((String)decoded);
                if(end<length){collectBackup(uri,length,end,content);return;}
                new Thread(()->{try(OutputStream output=getContentResolver().openOutputStream(uri,"wt")){if(output==null)throw new Exception();output.write(content.toString().getBytes(StandardCharsets.UTF_8));runOnUiThread(()->finishTransfer("Workspace backup saved."));}catch(Exception e){runOnUiThread(()->finishTransfer("Could not save backup. Check the selected destination."));}}).start();
            }catch(Exception e){finishTransfer("Backup export failed.");}
        });
    }
    private void sendImport(String raw,int offset) {
        int end=Math.min(raw.length(),offset+CHUNK);
        web.evaluateJavascript("window.__try4Incoming+="+JSONObject.quote(raw.substring(offset,end))+";true",v->{
            if(end<raw.length()){sendImport(raw,end);return;}
            web.evaluateJavascript("(()=>{try{window.try4Import(window.__try4Incoming);return 'ok';}catch(e){return 'error';}finally{delete window.__try4Incoming;}})()",result->finishTransfer("\"ok\"".equals(result)?"Backup restored with emergency lock on.":"Backup rejected. Existing records kept."));
        });
    }
    private void finishTransfer(String message) {transferring=false;web.evaluateJavascript("delete window.__try4Backup;delete window.__try4Incoming;",null);toast(message);}
    @Override protected void onPause(){super.onPause();if(web!=null){web.evaluateJavascript("if(window.try4Pause)window.try4Pause();window.dispatchEvent(new Event('blur'));",null);web.onPause();web.pauseTimers();}}
    @Override protected void onResume(){super.onResume();if(web!=null){web.onResume();web.resumeTimers();}}
    @Override public void onBackPressed(){if(transferring){toast("Wait for the backup operation to finish.");return;}if(web.canGoBack())web.goBack();else super.onBackPressed();}
    @Override protected void onDestroy(){if(web!=null){web.stopLoading();web.destroy();web=null;}super.onDestroy();}
}
