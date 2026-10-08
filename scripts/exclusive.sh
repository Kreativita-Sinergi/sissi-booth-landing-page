#!/usr/bin/env bash
# Menjalankan perintah BERAT (tes, build_runner, gradle, emulator) satu per satu.
# Beberapa agent/sesi yang memanggilnya akan ANTRE, tidak berjalan bersamaan,
# sehingga komputer tidak kewalahan. Kunci dipakai bersama lintas repo Sissi.
#
#   tool/exclusive.sh flutter test
#   EXCLUSIVE_TIMEOUT=3600 tool/exclusive.sh dart run build_runner build
set -u
LOCK="${SISSI_LOCK_DIR:-/tmp/sissi-heavy.lock}"
TIMEOUT="${EXCLUSIVE_TIMEOUT:-1800}"
waited=0

while ! mkdir "$LOCK" 2>/dev/null; do
  # Kunci basi (proses pemegangnya sudah mati) → ambil alih.
  if [ -f "$LOCK/pid" ] && ! kill -0 "$(cat "$LOCK/pid" 2>/dev/null)" 2>/dev/null; then
    rm -rf "$LOCK"; continue
  fi
  if [ "$waited" -ge "$TIMEOUT" ]; then
    echo "exclusive: menunggu > ${TIMEOUT}s; dipegang: $(cat "$LOCK/cmd" 2>/dev/null)" >&2
    exit 75
  fi
  if [ $((waited % 30)) -eq 0 ]; then
    echo "exclusive: antre (dipegang: $(cat "$LOCK/cmd" 2>/dev/null || echo '?'))..." >&2
  fi
  sleep 3; waited=$((waited + 3))
done

echo $$ > "$LOCK/pid"
echo "$*" > "$LOCK/cmd"
trap 'rm -rf "$LOCK"' EXIT INT TERM
"$@"
exit $?
