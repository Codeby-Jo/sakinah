from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Sakinah Matrimony"
    API_V1_STR: str = "/api/v1"
    
    FIREBASE_CERT_PATH: str = "firebase-credentials.json"
    
    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"

settings = Settings()
