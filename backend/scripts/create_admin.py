"""Create an administrator or promote an existing user.

Usage: python -m scripts.create_admin EMAIL "FULL NAME" PASSWORD
"""

import sys

from pydantic import ValidationError

from app.db import SessionLocal
from app.modules.users import service
from app.modules.users.models import ROLE_ADMIN
from app.modules.users.schemas import UserCreate


def main() -> None:
    if len(sys.argv) != 4:
        print(__doc__)
        raise SystemExit(1)
    email, full_name, password = sys.argv[1:]
    try:
        data = UserCreate(email=email, full_name=full_name, password=password)
    except ValidationError as exc:
        print("Invalid data: email must be valid, password at least 8 characters.")
        print(exc)
        raise SystemExit(1) from exc

    with SessionLocal() as session:
        user = service.get_by_email(session, data.email)
        if user is None:
            service.create_user(session, data, role=ROLE_ADMIN)
            print(f"Administrator {data.email} created")
        else:
            service.set_role(session, user, ROLE_ADMIN)
            print(f"User {data.email} is now an administrator")


if __name__ == "__main__":
    main()
