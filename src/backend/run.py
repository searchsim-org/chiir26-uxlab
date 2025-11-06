# run.py
import os
import uvicorn

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8001))
    # Check if running in production mode
    is_production = os.getenv("PRODUCTION", "false").lower() == "true"
    
    if is_production:
        # Production mode: no reload, with workers
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=port,
            reload=False,
            workers=4,
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