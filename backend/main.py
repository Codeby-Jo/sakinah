from fastapi import FastAPI
import models
from database import engine
from routes import auth, profile

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(auth.router)
app.include_router(profile.router)
