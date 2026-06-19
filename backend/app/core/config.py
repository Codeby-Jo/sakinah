from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Sakinah Matrimony"
    API_V1_STR: str = "/api/v1"
    
    # We will add database and JWT settings here later when we connect them
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
