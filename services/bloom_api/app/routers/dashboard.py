from datetime import datetime, timedelta, timezone
from typing import Annotated

import asyncpg
from fastapi import APIRouter, Depends, HTTPException, Query, status

from ..core.config import settings
from ..core.db import get_pool
from ..core.security import UserContext, get_current_user_optional

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def day_key(date_value: datetime) -> str:
    return date_value.strftime("%Y-%m-%d")


def logical_today_utc(cutoff_hour: int = 3) -> str:
    now = datetime.now(timezone.utc)
    shifted = now - timedelta(days=1) if now.hour < cutoff_hour else now
    return day_key(shifted)


def previous_day_key(day: str) -> str:
    dt = datetime.strptime(day, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    return day_key(dt - timedelta(days=1))


def compute_streak(logical_days: list[str]) -> int:
    if not logical_days:
        return 0

    unique_desc = sorted(set(logical_days), reverse=True)
    streak = 1
    cursor = unique_desc[0]

    for next_day in unique_desc[1:]:
        expected = previous_day_key(cursor)
        if next_day != expected:
            break
        streak += 1
        cursor = next_day

    return streak


def compute_missed_days(latest_day: str | None, today: str) -> int:
    if latest_day is None:
        return 2

    latest_dt = datetime.strptime(latest_day, "%Y-%m-%d")
    today_dt = datetime.strptime(today, "%Y-%m-%d")
    delta = (today_dt - latest_dt).days
    return max(0, delta)


@router.get("")
async def get_mobile_dashboard(
    user: Annotated[UserContext | None, Depends(get_current_user_optional)],
    pool: asyncpg.Pool = Depends(get_pool),
    profile_id: str = Query(default="local-user"),
) -> dict[str, object]:
    if user is None and not settings.dashboard_dev_fallback:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    if user is None:
        profile = profile_id
    elif user.role in {"admin", "service"}:
        profile = profile_id
    else:
        profile = user.sub

    async with pool.acquire() as conn:
        habits = await conn.fetch(
            """
            SELECT id, titre, type, cadence, date_creation::text AS date_creation
            FROM bloom_habitudes
            WHERE profile_id = $1
            ORDER BY date_creation ASC;
            """,
            profile,
        )

        validations = await conn.fetch(
            """
            SELECT habitude_id, date_logique::text AS date_logique
            FROM bloom_validations
            WHERE profile_id = $1
            ORDER BY date_logique DESC;
            """,
            profile,
        )

        wallet = await conn.fetchrow(
            """
            SELECT petales, cristaux, pending_bg_petales
            FROM bloom_solde_monnaie
            WHERE profile_id = $1;
            """,
            profile,
        )

        shield = await conn.fetchrow(
            """
            SELECT active_until_utc
            FROM bloom_shield
            WHERE profile_id = $1;
            """,
            profile,
        )

    by_habit: dict[str, list[str]] = {}
    all_days: list[str] = []

    for row in validations:
        hid = str(row["habitude_id"])
        day = str(row["date_logique"])
        by_habit.setdefault(hid, []).append(day)
        all_days.append(day)

    today = logical_today_utc()

    habits_view = []
    max_streak = 0
    max_sobriety = 0

    for row in habits:
        hid = str(row["id"])
        days = by_habit.get(hid, [])
        streak = compute_streak(days)

        habits_view.append(
            {
                "id": hid,
                "titre": str(row["titre"]),
                "type": str(row["type"]),
                "cadence": str(row["cadence"]),
                "date_creation": str(row["date_creation"]),
                "streak": streak,
                "today_checked": today in set(days),
            }
        )

        max_streak = max(max_streak, streak)
        if str(row["type"]) == "quit":
            max_sobriety = max(max_sobriety, streak)

    # 35 days sparkline/heatmap
    counts = {}
    for day in all_days:
        counts[day] = counts.get(day, 0) + 1

    heatmap_values: list[int] = []
    cursor = datetime.now(timezone.utc)
    for i in range(34, -1, -1):
        d = cursor - timedelta(days=i)
        key = day_key(d)
        score = min(100, counts.get(key, 0) * 40)
        heatmap_values.append(score)

    unique_desc_days = sorted(set(all_days), reverse=True)
    latest_day = unique_desc_days[0] if unique_desc_days else None
    missed_days = compute_missed_days(latest_day, today)

    shield_active = False
    if shield and shield["active_until_utc"] is not None:
        shield_active = shield["active_until_utc"] > datetime.now(timezone.utc)

    return {
        "activeStreak": max_streak,
        "sobrietyDays": max_sobriety,
        "shieldActive": shield_active,
        "missedDays": missed_days,
        "currency": {
            "petales": float(wallet["petales"]) if wallet else 0,
            "crystalPetales": int(wallet["cristaux"]) if wallet else 0,
            "pendingBackgroundPetales": float(wallet["pending_bg_petales"]) if wallet else 0,
        },
        "heatmapValues": heatmap_values,
        "habits": habits_view,
    }
