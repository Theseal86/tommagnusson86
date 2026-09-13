"""HTTP/download excerpt from the Stroke of Steel ElevenLabs audio generator.

Only post_with_retry and save_stream are included, unchanged from the generator.
This module does not generate assets on import and contains no credentials.
"""

from __future__ import annotations

import sys
import time
from pathlib import Path

import requests

RETRYABLE_STATUS = {408, 409, 425, 429, 500, 502, 503, 504}


def post_with_retry(
    session: requests.Session,
    url: str,
    headers: dict[str, str],
    payload: dict,
    retries: int,
) -> requests.Response:
    last_error: Exception | None = None
    for attempt in range(retries + 1):
        try:
            response = session.post(
                url,
                headers=headers,
                json=payload,
                timeout=(20, 900),
                stream=True,
            )
            if response.status_code not in RETRYABLE_STATUS:
                return response
            message = response.text[:500]
            last_error = RuntimeError(f"HTTP {response.status_code}: {message}")
        except requests.RequestException as exc:
            last_error = exc
        if attempt < retries:
            delay = min(60.0, 2.0 ** attempt * 2.0)
            print(f"    retrying in {delay:.1f}s after: {last_error}", file=sys.stderr)
            time.sleep(delay)
    raise RuntimeError(f"Request failed after {retries + 1} attempts: {last_error}")


def save_stream(response: requests.Response, target: Path) -> None:
    if response.status_code >= 400:
        try:
            detail = response.json()
        except ValueError:
            detail = response.text[:1000]
        raise RuntimeError(f"ElevenLabs API error {response.status_code}: {detail}")

    content_type = response.headers.get("content-type", "").lower()
    if "json" in content_type:
        raise RuntimeError(f"Expected audio but received JSON: {response.text[:1000]}")

    target.parent.mkdir(parents=True, exist_ok=True)
    temp = target.with_suffix(target.suffix + ".part")
    with temp.open("wb") as handle:
        for chunk in response.iter_content(chunk_size=1024 * 128):
            if chunk:
                handle.write(chunk)
    if temp.stat().st_size < 100:
        temp.unlink(missing_ok=True)
        raise RuntimeError("Generated audio response was unexpectedly small")
    temp.replace(target)
