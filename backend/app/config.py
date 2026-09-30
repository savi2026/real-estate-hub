from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    SUPABASE_DB_URL: str
    SUPABASE_URL: str = "https://tsrojucrbtngllrgijxo.supabase.co"
    PEXELS_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    ENV: str = "development"


settings = Settings()