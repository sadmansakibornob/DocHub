from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def root():
    return {"message": "FastAPI is working!"}


@app.get("/api/tasks")
def get_tasks():
    return {"tasks": []}