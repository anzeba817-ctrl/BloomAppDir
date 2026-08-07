from typing import Annotated

from fastapi import APIRouter, Depends

from ..core.security import UserContext, require_roles
from ..schemas import PersonalizedQuoteRequest, PersonalizedQuoteResponse

router = APIRouter(prefix="/ai", tags=["ai"])


def choose_quote(active_streak: int, mood: str | None) -> tuple[str, str, str]:
    normalized_mood = (mood or "neutral").strip().lower()

    if active_streak >= 30:
        return (
            "Your consistency is now part of your identity. Protect it one gentle day at a time.",
            "celebratory",
            "identity-reinforcement",
        )

    if active_streak >= 7:
        return (
            "Seven days of intention can change your month. Keep that flame steady.",
            "motivational",
            "milestone-amplification",
        )

    if normalized_mood in {"hard", "difficult", "sad", "anxious"}:
        return (
            "Low-energy days still count. Tiny actions keep your future self alive.",
            "supportive",
            "friction-reduction",
        )

    return (
        "Bloom is built one repetition at a time. Today is enough.",
        "balanced",
        "daily-momentum",
    )


@router.post("/personalize", response_model=PersonalizedQuoteResponse)
async def personalize_experience(
    body: PersonalizedQuoteRequest,
    _: Annotated[UserContext, Depends(require_roles("user", "service", "admin"))],
) -> PersonalizedQuoteResponse:
    quote, tone, strategy = choose_quote(body.active_streak, body.mood)
    return PersonalizedQuoteResponse(quote=quote, tone=tone, strategy=strategy)
