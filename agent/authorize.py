"""One-time Google sign-in, so the agent can create real Meet events.

Why this exists
---------------
The service account can READ every calendar shared with it, which is how
conflict checking works. But on a consumer gmail account it cannot:

  * create a Google Meet link  -> 400 "Invalid conference type value"
  * add the visitor as an attendee -> 403, needs Workspace domain-wide delegation

Acting as Naman lifts both limits, and Google then emails the visitor a proper
invite instead of us hand-rolling an .ics.

Refresh tokens issued while the OAuth consent screen sits in "Testing" expire
after 7 days. Publish the consent screen to "In production" BEFORE running this,
or the agent silently stops booking a week later.

Usage
-----
    uv run python authorize.py            # opens a browser, prints the token

Then store the printed value:

    lk agent update-secrets --secrets GOOGLE_OAUTH_REFRESH_TOKEN=<token>
"""

from __future__ import annotations

import json
import pathlib
import re
import sys

SCOPES = ["https://www.googleapis.com/auth/calendar.events"]
CLIENT_FILE = pathlib.Path(__file__).parent / "oauth-client.json"


def main() -> int:
    if not CLIENT_FILE.exists():
        print(f"missing {CLIENT_FILE.name}\n")
        print("Create it first:")
        print("  1. console.cloud.google.com > APIs & Services > Credentials")
        print("  2. Create credentials > OAuth client ID > Desktop app")
        print("  3. Download the JSON, save it here as oauth-client.json")
        print("  4. OAuth consent screen > PUBLISH APP (not 'Testing')")
        return 1

    from google_auth_oauthlib.flow import InstalledAppFlow

    flow = InstalledAppFlow.from_client_secrets_file(str(CLIENT_FILE), SCOPES)
    # access_type=offline + prompt=consent is what actually returns a refresh
    # token; without prompt=consent a repeat authorisation returns none.
    creds = flow.run_local_server(port=0, access_type="offline", prompt="consent")

    if not creds.refresh_token:
        print("no refresh token returned - revoke access and retry", file=sys.stderr)
        return 1

    client = json.loads(CLIENT_FILE.read_text())["installed"]
    values = {
        "GOOGLE_OAUTH_CLIENT_ID": client["client_id"],
        "GOOGLE_OAUTH_CLIENT_SECRET": client["client_secret"],
        "GOOGLE_OAUTH_REFRESH_TOKEN": creds.refresh_token,
    }

    # Written to disk rather than printed: a refresh token pasted into a chat or
    # a terminal log is a refresh token you have to rotate.
    env = pathlib.Path(__file__).parent / ".env.local"
    text = env.read_text() if env.exists() else ""
    for key, value in values.items():
        line = f"{key}={value}"
        if re.search(rf"^{key}=.*$", text, flags=re.M):
            text = re.sub(rf"^{key}=.*$", line, text, flags=re.M)
        else:
            text = text.rstrip("\n") + f"\n{line}\n"
    env.write_text(text)
    env.chmod(0o600)

    print(f"\nwrote 3 values to {env.name} (gitignored)")
    print(f"  refresh token: {creds.refresh_token[:6]}...{creds.refresh_token[-4:]}")
    print("\nNow push them to the deployed agent:")
    print("  uv run python authorize.py --push")
    return 0


def push() -> int:
    """Copy the OAuth values from .env.local into the agent's secrets."""
    import subprocess

    env = pathlib.Path(__file__).parent / ".env.local"
    if not env.exists():
        print("no .env.local - run without --push first", file=sys.stderr)
        return 1
    text = env.read_text()

    args = []
    for key in ("GOOGLE_OAUTH_CLIENT_ID", "GOOGLE_OAUTH_CLIENT_SECRET",
                "GOOGLE_OAUTH_REFRESH_TOKEN"):
        m = re.search(rf"^{key}=(.*)$", text, flags=re.M)
        if not m or not m.group(1).strip():
            print(f"{key} missing from .env.local", file=sys.stderr)
            return 1
        args += ["--secrets", f"{key}={m.group(1).strip()}"]

    print("pushing 3 secrets to the deployed agent...")
    return subprocess.call(["lk", "agent", "update-secrets", *args])


if __name__ == "__main__":
    if "--push" in sys.argv:
        raise SystemExit(push())
    raise SystemExit(main())
