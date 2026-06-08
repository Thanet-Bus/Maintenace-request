import httpx

from app.core.config import settings


async def exchange_code_for_token(code: str) -> dict:
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(
            "https://api.line.me/oauth2/v2.1/token",
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": settings.line_redirect_uri,
                "client_id": settings.line_channel_id,
                "client_secret": settings.line_channel_secret,
            },
            headers={
                "Content-Type": "application/x-www-form-urlencoded",
            },
        )

    response.raise_for_status()
    return response.json()


async def verify_line_id_token(id_token: str) -> dict:
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(
            "https://api.line.me/oauth2/v2.1/verify",
            data={
                "id_token": id_token,
                "client_id": settings.line_channel_id,
            },
            headers={
                "Content-Type": "application/x-www-form-urlencoded",
            },
        )

    response.raise_for_status()
    return response.json()