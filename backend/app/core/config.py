from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str = 'postgresql+psycopg://app:change_me@localhost:5432/research'
    cors_origins: list[str] = ['http://localhost:3000']
    upload_dir: str = 'uploads'
    secret_key: str = 'local-dev-secret-change-before-deployment'
    access_token_minutes: int = 8 * 60
    model_config = SettingsConfigDict(env_file='.env', extra='ignore')

settings = Settings()
