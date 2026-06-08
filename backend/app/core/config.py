from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    secret_key: str

    line_channel_id: str
    line_channel_secret: str
    line_redirect_uri: str

    jwt_secret_key: str
    jwt_algorithm: str = 'HS256'
    jwt_expire_minutes: int = 10080

settings = Settings()