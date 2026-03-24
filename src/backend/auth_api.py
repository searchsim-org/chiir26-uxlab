"""
Authentication API endpoints for GitHub OAuth.
"""
import os
import secrets
from datetime import datetime, timedelta
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, Response, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from db.engine import get_session
from db.models import User

router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])

# GitHub OAuth Configuration
GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID", "")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET", "")
GITHUB_REDIRECT_URI = os.getenv("GITHUB_REDIRECT_URI", "http://localhost:8000/api/v1/auth/github/callback")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
JWT_SECRET = os.getenv("JWT_SECRET", secrets.token_hex(32))
SESSION_DURATION_DAYS = 30

# Simple session storage (in production, use Redis or similar)
sessions: dict[str, dict] = {}


class UserResponse(BaseModel):
    id: int
    github_id: int
    username: str
    email: Optional[str]
    name: Optional[str]
    avatar_url: Optional[str]
    
    class Config:
        from_attributes = True


class AuthStatus(BaseModel):
    authenticated: bool
    user: Optional[UserResponse] = None


@router.get("/github")
async def github_login():
    """Redirect to GitHub OAuth authorization page."""
    if not GITHUB_CLIENT_ID:
        raise HTTPException(status_code=500, detail="GitHub OAuth not configured")
    
    github_auth_url = (
        f"https://github.com/login/oauth/authorize"
        f"?client_id={GITHUB_CLIENT_ID}"
        f"&redirect_uri={GITHUB_REDIRECT_URI}"
        f"&scope=read:user user:email"
    )
    return RedirectResponse(url=github_auth_url)


@router.get("/github/callback")
async def github_callback(
    code: str,
    response: Response,
    db: Session = Depends(get_session)
):
    """Handle GitHub OAuth callback."""
    if not GITHUB_CLIENT_ID or not GITHUB_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="GitHub OAuth not configured")
    
    # Exchange code for access token
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            "https://github.com/login/oauth/access_token",
            data={
                "client_id": GITHUB_CLIENT_ID,
                "client_secret": GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": GITHUB_REDIRECT_URI,
            },
            headers={"Accept": "application/json"}
        )
        token_data = token_response.json()
        
        if "error" in token_data:
            raise HTTPException(status_code=400, detail=token_data.get("error_description", "OAuth failed"))
        
        access_token = token_data.get("access_token")
        if not access_token:
            raise HTTPException(status_code=400, detail="No access token received")
        
        # Get user info from GitHub
        user_response = await client.get(
            "https://api.github.com/user",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/json"
            }
        )
        github_user = user_response.json()
        
        # Get user email (may be private)
        email = github_user.get("email")
        if not email:
            emails_response = await client.get(
                "https://api.github.com/user/emails",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/json"
                }
            )
            emails = emails_response.json()
            if emails and isinstance(emails, list):
                primary_email = next((e for e in emails if e.get("primary")), None)
                email = primary_email.get("email") if primary_email else emails[0].get("email")
    
    # Find or create user
    github_id = github_user.get("id")
    user = db.query(User).filter(User.github_id == github_id).first()
    
    if user:
        # Update existing user
        user.username = github_user.get("login")
        user.email = email
        user.name = github_user.get("name")
        user.avatar_url = github_user.get("avatar_url")
        user.access_token = access_token
        user.last_login = datetime.utcnow()
    else:
        # Create new user
        user = User(
            github_id=github_id,
            username=github_user.get("login"),
            email=email,
            name=github_user.get("name"),
            avatar_url=github_user.get("avatar_url"),
            access_token=access_token,
        )
        db.add(user)
    
    db.commit()
    db.refresh(user)
    
    # Create session
    session_token = secrets.token_urlsafe(32)
    sessions[session_token] = {
        "user_id": user.id,
        "expires": datetime.utcnow() + timedelta(days=SESSION_DURATION_DAYS)
    }
    
    # Redirect to frontend with session cookie
    redirect_response = RedirectResponse(url=f"{FRONTEND_URL}/dashboard")
    is_https = FRONTEND_URL.startswith("https")
    redirect_response.set_cookie(
        key="session",
        value=session_token,
        httponly=True,
        path="/",
        max_age=SESSION_DURATION_DAYS * 24 * 60 * 60,
        samesite="lax" if is_https else "lax",
        secure=is_https,
    )
    return redirect_response


def get_current_user(request: Request, db: Session = Depends(get_session)) -> Optional[User]:
    """Get current user from session cookie."""
    session_token = request.cookies.get("session")
    if not session_token:
        return None
    
    session_data = sessions.get(session_token)
    if not session_data:
        return None
    
    if datetime.utcnow() > session_data["expires"]:
        del sessions[session_token]
        return None
    
    user = db.query(User).filter(User.id == session_data["user_id"]).first()
    return user


@router.get("/me", response_model=AuthStatus)
async def get_me(request: Request, db: Session = Depends(get_session)):
    """Get current authenticated user."""
    user = get_current_user(request, db)
    if user:
        return AuthStatus(
            authenticated=True,
            user=UserResponse.from_orm(user)
        )
    return AuthStatus(authenticated=False)


@router.post("/logout")
async def logout(request: Request, response: Response):
    """Log out the current user."""
    session_token = request.cookies.get("session")
    if session_token and session_token in sessions:
        del sessions[session_token]
    
    response.delete_cookie("session")
    return {"success": True}
