set -eu
adb shell wm size 480x800
adb shell wm density 160
adb shell settings put system accelerometer_rotation 0
adb shell settings put system user_rotation 1
adb shell wm dismiss-keyguard
adb install --no-incremental -r "$RUNNER_TEMP/firefox.apk"
adb reverse tcp:8072 tcp:8072
adb reverse tcp:8073 tcp:8073
python3 -u clockwork-adventure/tests/android_check.py
