# run.py
import os
import uvicorn

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8001))
    # Check if running in production mode
    is_production = os.getenv("PRODUCTION", "false").lower() == "true"

    if is_production:
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=port,
            reload=False,
            workers=int(os.getenv("WEB_CONCURRENCY", 2)),
            log_level="info"
        )
    else:
        # Development mode: with reload
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=port,
            reload=True
        )