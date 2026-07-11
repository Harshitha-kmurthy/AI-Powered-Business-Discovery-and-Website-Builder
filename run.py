import uvicorn
import webbrowser
from dotenv import load_dotenv


load_dotenv()

if __name__ == "__main__":
    webbrowser.open("http://127.0.0.1:8000/docs")

    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )


