from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Loads configuration from environment variables / .env file.
    Safe to commit — real values live only in backend/.env (gitignored).
    """
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    SUPABASE_DB_URL: str
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    ENV: str = "development"


settings = Settings()