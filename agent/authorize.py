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
    print("\n--- store these three as agent secrets ---\n")
    print(f"GOOGLE_OAUTH_CLIENT_ID={client['client_id']}")
    print(f"GOOGLE_OAUTH_CLIENT_SECRET={client['client_secret']}")
    print(f"GOOGLE_OAUTH_REFRESH_TOKEN={creds.refresh_token}")
    print("\nlk agent update-secrets --secrets GOOGLE_OAUTH_CLIENT_ID=... \\")
    print("    --secrets GOOGLE_OAUTH_CLIENT_SECRET=... \\")
    print("    --secrets GOOGLE_OAUTH_REFRESH_TOKEN=...")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
