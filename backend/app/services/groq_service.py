import json
from typing import Any
import httpx
from fastapi import HTTPException, status
from app.core.config import get_settings
from app.schemas.ai import GenerateContentRequest

settings = get_settings()

SYSTEM_PROMPT = """
You are CreatorForge AI, a practical content strategist for short-form video creators,
writers, editors, and students. Return only valid JSON. Do not use markdown fences.
The output must fit the requested platform, tone, and language.
""".strip()


def build_user_prompt(payload: GenerateContentRequest) -> str:
    return f"""
Create content for this idea: {payload.idea}
Platform: {payload.platform}
Tone: {payload.tone}
Language: {payload.language}

Return JSON using exactly this schema:
{{
  "title": "string",
  "hook": "string",
  "script": "string",
  "storyboard": [
    {{
      "scene": 1,
      "visual": "string",
      "voice_over": "string",
      "editing_note": "string"
    }}
  ],
  "visual_prompts": ["string"],
  "caption": "string",
  "hashtags": ["string"],
  "editing_checklist": ["string"]
}}

Rules:
- Make the script concise and emotionally engaging.
- Use 4 to 6 storyboard scenes.
- Give practical editing notes.
- Hashtags should be relevant, not spammy.
- Do not include text outside the JSON object.
""".strip()


def extract_json(text: str) -> dict[str, Any]:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        cleaned = cleaned.replace("json", "", 1).strip()

    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("Model response did not contain a JSON object")

    return json.loads(cleaned[start : end + 1])


async def generate_content_with_groq(payload: GenerateContentRequest) -> dict[str, Any]:
    if not settings.groq_api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GROQ_API_KEY is not configured. Add it to your .env file.",
        )

    request_body = {
        "model": settings.groq_model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": build_user_prompt(payload)},
        ],
        "temperature": 0.8,
        "max_completion_tokens": 1800,
        "response_format": {"type": "json_object"},
    }

    headers = {
        "Authorization": f"Bearer {settings.groq_api_key}",
        "Content-Type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(settings.groq_base_url, headers=headers, json=request_body)
            response.raise_for_status()
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            parsed = extract_json(content)
            parsed["_groq_usage"] = data.get("usage", {})
            parsed["_groq_model"] = data.get("model", settings.groq_model)
            return parsed
    except httpx.HTTPStatusError as exc:
        detail = exc.response.text
        raise HTTPException(status_code=exc.response.status_code, detail=f"Groq API error: {detail}") from exc
    except (KeyError, ValueError, json.JSONDecodeError) as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Groq returned an invalid response: {exc}",
        ) from exc
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Cannot connect to Groq API: {exc}",
        ) from exc
