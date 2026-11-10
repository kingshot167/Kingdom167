#!/usr/bin/env python3
"""Refresh Kingdom 167 leaderboard snapshots from MightPulse."""

import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "assets" / "data" / "leaderboards.json"
API_BASE = "https://api.mightpulse.com/v1"
KINGDOM_ID = 167
KINGDOM_NAME = "Kingdom 167"
LIMIT = 100
ALLIANCE_TAGS = ("RYL", "JUS", "TNW", "ONE", "ITA")
# These tags and spelling variants are looked up only inside Kingdom 167.
PLAYER_ID_TAGS = ("TNW", "RYL", "ONE", "JUS", "JU2", "ryl", "FUN", "rly", "ita", "TDW", "167", "LG2")
BOARD_KINDS = {
    "personal_power": "player",
    "kills": "player",
    "town_center": "player",
    "rebel_conquest": "player",
    "single_hero": "player",
    "hero_total": "player",
    "troop_power": "player",
    "building_power": "player",
    "research_power": "player",
    "hero_no_equip": "player",
    "hero_equip": "player",
    "gov_gear": "player",
    "gov_charm": "player",
    "pet_power": "player",
    "island_prosperity": "player",
    "migrant_score": "player",
    "mystic_trial": "player",
    "coliseum": "player",
    "forest_of_life": "player",
    "crystal_cave": "player",
    "knowledge_nexus": "player",
    "molten_fort": "player",
    "radiant_spire": "player",
    "master_power": "player",
}


def fetch_json(url, api_key):
    """Fetch JSON from MightPulse, retrying temporary errors without logging secrets."""
    request = Request(
        url,
        headers={
            "Accept": "application/json",
            "Authorization": f"Bearer {api_key}",
            "User-Agent": "Kingdom167LeaderboardRefresh/1.0 (+https://kingshot167.github.io/Kingdom167/)",
        },
    )
    last_error = None

    for attempt in range(3):
        try:
            with urlopen(request, timeout=75) as response:
                if response.status != 200:
                    raise RuntimeError(f"MightPulse returned HTTP {response.status}")
                payload = json.loads(response.read().decode("utf-8"))
            if not isinstance(payload, dict):
                raise RuntimeError("MightPulse returned an unexpected response")
            if payload.get("ok") is False:
                raise RuntimeError("MightPulse reported that the request failed")
            return payload
        except HTTPError as error:
            last_error = RuntimeError(f"MightPulse returned HTTP {error.code}")
            if error.code not in (429, 500, 502, 503, 504) or attempt == 2:
                break
            retry_after = error.headers.get("Retry-After", "")
            try:
                delay = min(max(int(retry_after), 1), 60)
            except ValueError:
                delay = 3 * (attempt + 1)
            time.sleep(delay)
        except (URLError, TimeoutError, json.JSONDecodeError, RuntimeError) as error:
            last_error = error
            if attempt == 2:
                break
            time.sleep(3 * (attempt + 1))

    raise RuntimeError(f"Could not fetch MightPulse data: {last_error}")


def first_list(source, keys):
    """Return the first list found under one of the expected response keys."""
    if isinstance(source, list):
        return source
    if not isinstance(source, dict):
        return None
    for key in keys:
        value = source.get(key)
        if isinstance(value, list):
            return value
    return None


def response_data(payload):
    """Handle the documented response plus a possible data wrapper."""
    data = payload.get("data")
    return data if isinstance(data, (dict, list)) else payload


def board_container(payload):
    """Find the grouped board data in an aggregate ranks response."""
    data = response_data(payload)
    if isinstance(data, list):
        return data
    for key in ("leaderboards", "boards"):
        value = data.get(key)
        if isinstance(value, (dict, list)):
            return value
    return data


def board_value(container, slug):
    """Read one board from either a keyed object or a list of board objects."""
    if isinstance(container, dict):
        return container.get(slug)
    if isinstance(container, list):
        for item in container:
            if not isinstance(item, dict):
                continue
            key = item.get("slug") or item.get("key") or item.get("board") or item.get("type")
            if key == slug:
                return item
    return None


def board_entries(value):
    return first_list(value, ("entries", "rows", "ranks", "rankings", "results", "players", "alliances"))


def member_rows(payload):
    """Find roster rows whether MightPulse returns them directly or under alliance."""
    data = response_data(payload)
    if isinstance(data, list):
        return data
    if not isinstance(data, dict):
        return None
    alliance = data.get("alliance")
    rows = first_list(alliance, ("members", "roster"))
    if rows is not None:
        return rows
    return first_list(data, ("members", "roster"))


def alliance_rosters(api_key):
    """Fetch main profile data and governor IDs for all requested alliance tags."""
    tags_by_governor = {}
    rosters = {}
    player_ids_by_alliance = {}
    for tag in PLAYER_ID_TAGS:
        url = f"{API_BASE}/alliances/{KINGDOM_ID}/{tag}?include=info,roster"
        try:
            payload = fetch_json(url, api_key)
        except RuntimeError as error:
            if tag in ALLIANCE_TAGS:
                raise
            print(f"Could not fetch optional alliance tag {tag}: {error}", file=sys.stderr)
            player_ids_by_alliance[tag] = []
            continue
        rows = member_rows(payload)
        if rows is None:
            if tag in ALLIANCE_TAGS:
                raise RuntimeError(f"MightPulse returned no roster list for {tag}; saved data was left unchanged")
            player_ids_by_alliance[tag] = []
            continue
        data = response_data(payload)
        alliance_info = data.get("alliance", data) if isinstance(data, dict) else {}
        if not isinstance(alliance_info, dict):
            alliance_info = {}
        members = []
        player_ids = []
        for member in rows:
            if not isinstance(member, dict):
                continue
            governor_id = member.get("governor_id") or member.get("fid")
            if governor_id is not None:
                tags_by_governor[str(governor_id)] = tag
                player_ids.append(str(governor_id))

            rank_value = member.get("alliance_rank") or member.get("alliance_rank_label") or ""
            rank_text = str(rank_value).upper()
            rank = next((f"R{number}" for number in range(5, 0, -1) if rank_text == f"R{number}" or rank_text == str(number)), None)
            if rank is None:
                rank_label = str(member.get("alliance_rank_label") or "").upper()
                rank = next((f"R{number}" for number in range(5, 0, -1) if f"R{number}" in rank_label), None)
            if rank is None:
                continue

            name = member.get("nick_name") or member.get("name")
            if not name:
                continue
            members.append({
                "governor_id": str(governor_id) if governor_id is not None else None,
                "name": name,
                "avatar_url": member.get("avatar_url") or None,
                "rank": rank,
            })

        members.sort(key=lambda item: (-int(item["rank"][1:]), item["name"].casefold()))
        member_count = alliance_info.get("count")
        if member_count is None:
            member_count = len(rows)
        player_ids_by_alliance[tag] = player_ids
        if tag in ALLIANCE_TAGS:
            rosters[tag] = {
                "name": alliance_info.get("name") or tag,
                "member_count": member_count,
                "power": alliance_info.get("power"),
                "members": members,
            }
    return rosters, tags_by_governor, player_ids_by_alliance


def normalize_entry(source, position, kind, tags_by_governor):
    if not isinstance(source, dict):
        return None

    score = source.get("score", source.get("value"))
    rank = source.get("rank", source.get("position", position))
    try:
        rank = int(rank)
    except (TypeError, ValueError):
        rank = position

    if kind == "alliance":
        abbr = source.get("abbr") or source.get("alliance_abbr") or ""
        return {
            "rank": rank,
            "aid": source.get("aid"),
            "abbr": abbr,
            "name": source.get("name") or source.get("alliance_name") or abbr or "Unknown alliance",
            "score": score,
        }

    governor_id = source.get("governor_id") or source.get("fid")
    alliance = source.get("alliance")
    api_tag = alliance.get("abbr") if isinstance(alliance, dict) else None
    alliance_tag = source.get("alliance_abbr") or api_tag
    if not alliance_tag and governor_id is not None:
        alliance_tag = tags_by_governor.get(str(governor_id))
    return {
        "rank": rank,
        "governor_id": str(governor_id) if governor_id is not None else None,
        "nick_name": source.get("nick_name") or source.get("nickname") or source.get("name") or "Unknown governor",
        "score": score,
        "alliance_abbr": alliance_tag or None,
    }


def normalize_boards(payload, tags_by_governor):
    container = board_container(payload)
    leaderboards = {}
    total_entries = 0

    for slug, kind in BOARD_KINDS.items():
        raw_board = board_value(container, slug)
        raw_entries = board_entries(raw_board) or []
        entries = []
        for position, source in enumerate(raw_entries[:LIMIT], start=1):
            entry = normalize_entry(source, position, kind, tags_by_governor)
            if entry is not None:
                entries.append(entry)
        total_entries += len(entries)
        leaderboards[slug] = {"kind": kind, "entries": entries}

    if total_entries == 0:
        raise RuntimeError("MightPulse returned no recognizable leaderboard entries; the saved snapshot was left unchanged")
    return leaderboards


def main():
    api_key = os.environ.get("MIGHTPULSE_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("Set the MIGHTPULSE_API_KEY GitHub Actions secret before running this refresh")

    ranks_url = f"{API_BASE}/kingdoms/{KINGDOM_ID}/ranks?{urlencode({'limit': LIMIT})}"
    ranks_payload = fetch_json(ranks_url, api_key)
    alliances, tags_by_governor, player_ids_by_alliance = alliance_rosters(api_key)
    leaderboards = normalize_boards(ranks_payload, tags_by_governor)

    existing = {}
    if DATA_FILE.exists():
        try:
            existing = json.loads(DATA_FILE.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            existing = {}

    if (
        existing.get("leaderboards") == leaderboards
        and existing.get("alliances") == alliances
        and existing.get("player_ids_by_alliance") == player_ids_by_alliance
    ):
        print("No leaderboard changes; keeping the current snapshot.")
        return

    result = {
        "schema_version": 1,
        "kingdom_id": KINGDOM_ID,
        "kingdom_name": KINGDOM_NAME,
        "source": "MightPulse",
        "source_url": f"{API_BASE}/kingdoms/{KINGDOM_ID}/ranks",
        "updated_at": datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
        "limit": LIMIT,
        "leaderboards": leaderboards,
        "alliances": alliances,
        "player_ids_by_alliance": player_ids_by_alliance,
    }
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    DATA_FILE.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Updated {len(leaderboards)} leaderboard boards with {sum(len(board['entries']) for board in leaderboards.values())} entries.")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:  # Fail the workflow; keep the last known good JSON.
        print(error, file=sys.stderr)
        sys.exit(1)
