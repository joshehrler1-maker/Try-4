"""Static Android manifest/asset checks. Not a substitute for an SDK compilation."""
from pathlib import Path
import xml.etree.ElementTree as ET
root=Path(__file__).resolve().parents[1]
ns='{http://schemas.android.com/apk/res/android}'
manifest=ET.parse(root/'android/app/src/main/AndroidManifest.xml').getroot()
assert not manifest.findall('uses-permission'), 'Offline MVP must request no permissions'
app=manifest.find('application')
assert app.get(ns+'allowBackup')=='false'
assert app.get(ns+'usesCleartextTraffic')=='false'
activities=app.findall('activity')
assert len(activities)==1 and activities[0].get(ns+'exported')=='true'
for file in (root/'android/app/src/main/res').rglob('*.xml'):ET.parse(file)
java=(root/'android/app/src/main/java/com/superpaw/try4/MainActivity.java').read_text()
assert 'addJavascriptInterface' not in java
for setting in ['setAllowFileAccess(false)','setAllowContentAccess(false)','setAllowFileAccessFromFileURLs(false)','setAllowUniversalAccessFromFileURLs(false)','setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW)']:
 assert setting in java,setting
assert 'WebViewAssetLoader' in java
for name in ['studio.html','core.js','studio.js','studio.css','index.html','release-policy.json']:
 assert (root/name).is_file(),name
print('PASS: Android manifest, resource XML, WebView restrictions and required source assets. SDK compilation is a separate check.')
