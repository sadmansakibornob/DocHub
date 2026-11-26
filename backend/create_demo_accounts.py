import hashlib
import hmac

from app.config import settings
from app.db import supabase

PASSWORD = "12345678"

ACCOUNTS = [
    *[
        {
            "email": f"student{i:02d}@example.com",
            "name": f"Student {i:02d}",
            "role": "admin",
        }
        for i in range(1, 6)
    ],
    *[
        {
            "email": f"user{i:02d}@example.com",
            "name": f"User {i:02d}",
            "role": "user",
        }
        for i in range(1, 6)
    ],
]


def pepper_password(password: str) -> str:
    return hmac.new(
        settings.password_pepper.encode(),
        password.encode(),
        hashlib.sha256,
    ).hexdigest()


def create_account(account: dict) -> None:
    email = account["email"]
    password = pepper_password(PASSWORD)

    print(f"\nProcessing {email}...")

    # Find an existing Supabase Auth account.
    users = supabase.auth.admin.list_users()
    existing = next(
        (u for u in users if u.email and u.email.lower() == email.lower()),
        None,
    )

    if existing:
        user_id = str(existing.id)

        supabase.auth.admin.update_user_by_id(
            user_id,
            {
                "password": password,
                "email_confirm": True,
            },
        )
        print("Updated existing Auth account.")
    else:
        result = supabase.auth.admin.create_user(
            {
                "email": email,
                "password": password,
                "email_confirm": True,
            }
        )

        user_id = str(result.user.id)
        print("Created Auth account.")

    # Create or update the public profile.
    supabase.table("users").upsert(
        {
            "id": user_id,
            "name": account["name"],
            "email": email,
            "role": account["role"],
            "is_banned": False,
        },
        on_conflict="id",
    ).execute()

    print(f"Profile synchronized: {account['role']}")


def main():
    print("Creating DocHub demo accounts...")

    for account in ACCOUNTS:
        try:
            create_account(account)
        except Exception as error:
            print(f"FAILED: {account['email']}: {error}")

    print("\nDemo account processing completed.")


if __name__ == "__main__":
    main()
