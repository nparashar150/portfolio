"""Mails Naman a summary after someone talks to the agent.

Uses the same OAuth credential as booking, with the gmail.send scope, so the
mail comes from his own account to himself. No third-party sender, no domain to
verify, nothing new to pay for.
"""

from __future__ import annotations

import base64
import logging
import os
from email.message import EmailMessage

import booking

logger = logging.getLogger(__name__)

GMAIL_SCOPES = [
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/gmail.send",
]


def _gmail():
    """Gmail client, or None when OAuth isn't configured."""
    client_id, client_secret, refresh_token = booking.oauth_env()
    if not (client_id and client_secret and refresh_token):
        return None
    try:
        from google.oauth2.credentials import Credentials
        from googleapiclient.discovery import build

        creds = Credentials(
            token=None,
            refresh_token=refresh_token,
            client_id=client_id,
            client_secret=client_secret,
            token_uri="https://oauth2.googleapis.com/token",
            scopes=GMAIL_SCOPES,
        )
        return build("gmail", "v1", credentials=creds, cache_discovery=False)
    except Exception:
        logger.exception("gmail client could not be built")
        return None


def send_to_self(subject: str, body: str) -> bool:
    """Send plain text to OWNER_EMAIL. Never raises — this is a notification."""
    to = os.environ.get("OWNER_EMAIL", "").strip() or booking._calendar_id()
    svc = _gmail()
    if svc is None:
        logger.info("no gmail client; skipping summary mail")
        return False

    msg = EmailMessage()
    msg["To"] = to
    msg["From"] = to
    msg["Subject"] = subject
    msg.set_content(body)

    try:
        svc.users().messages().send(
            userId="me",
            body={"raw": base64.urlsafe_b64encode(msg.as_bytes()).decode()},
        ).execute()
        logger.info("summary mailed to %s", to)
        return True
    except Exception:
        # A missing summary must never take a session down with it.
        logger.exception("could not send summary mail")
        return False
