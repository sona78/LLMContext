from fastapi import FastAPI

app = FastAPI()

@app.post("/post_context?user={user_id}&url={url}&context={context}")

def post_context(user_id: int, url: str, context: str):
    # Put Context into Database
    return {"user_id": user_id, "url": url, "context": context}


@app.get("/get_context?user={user_id}&question={question}")

def get_context(user_id: int, question: str):
    # Return context related to question
    return {"user_id": user_id, "question": question}
