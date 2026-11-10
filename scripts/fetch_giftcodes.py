#!/usr/bin/env python3
"""Refresh the site's active Kingshot codes from Kingshot.net's public feed."""

import json
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "assets" / "data" / "giftcodes.json"
API_URL = "https://kingshot.net/api/gift-codes"
PAGE_URL = "https://kingshot.net/gift-codes/"


def fetch_payload():
    request = Request(
        API_URL,
        headers={
            "Accept": "application/json",
            "User-Agent": "Kingdom167GiftCodeMonitor/1.0 (+https://kingshot167.github.io/Kingdom167/)",
        },
    )
    last_error = None
    for attempt in range(3):
        try:
            with urlopen(request, timeout=25) as response:
                if response.status != 200:
                    raise RuntimeError(f"Kingshot.net returned HTTP {response.status}")
                payload = json.loads(response.read().decode("utf-8"))
            if not isinstance(payload, dict) or payload.get("status") != "success":
                raise RuntimeError("Unexpected response status from Kingshot.net")
            data = payload.get("data")
            codes = data.get("giftCodes") if isinstance(data, dict) else None
            if not isinstance(codes, list):
                raise RuntimeError("Kingshot.net response did not include a giftCodes list")
            return codes
        except (HTTPError, URLError, TimeoutError, json.JSONDecodeError, RuntimeError) as error:
            last_error = error
            if attempt < 2:
                time.sleep(3 * (attempt + 1))
    raise RuntimeError(f"Could not fetch gift codes: {last_error}")


def normalize_codes(source_codes):
    normalized = []
    seen = set()
    for item in source_codes:
        if not isinstance(item, dict):
            continue
        code = item.get("code")
        if not isinstance(code, str) or not code.strip():
            continue
        code = code.strip()
        if code in seen:
            continue
        seen.add(code)
        normalized.append(
            {
                "code": code,
                "expires_at": item.get("expiresAt") or None,
                "created_at": item.get("createdAt") or None,
            }
        )
    return normalized


def main():
    codes = normalize_codes(fetch_payload())
    existing = {}
    if DATA_FILE.exists():
        try:
            existing = json.loads(DATA_FILE.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            existing = {}

    if existing.get("codes") == codes:
        print(f"No change: {len(codes)} active gift codes.")
        return

    result = {
        "schema_version": 1,
        "source": "Kingshot.net",
        "source_url": PAGE_URL,
        "updated_at": datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
        "codes": codes,
    }
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    DATA_FILE.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Updated active gift codes: {len(codes)} entries.")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:  # Fail the workflow; keep the last known good JSON.
        print(error, file=sys.stderr)
        sys.exit(1)
