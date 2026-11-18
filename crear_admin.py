import getpass
import os
import sys

import bcrypt

from app.database.session import SessionLocal
from app.models.user import AdminUser
from app.repositories.user_repository import get_user_by_email


def crear_admin():
    if "--auto" in sys.argv:
        nombre = os.getenv("ADMIN_NAME", "").strip()
        email = os.getenv("ADMIN_EMAIL", "").strip().lower()
        password = os.getenv("ADMIN_PASSWORD", "")

        if not nombre or not email or not password:
            return
    else:
        nombre = input("Nombre del administrador: ").strip()
        email = input("Correo electrónico: ").strip().lower()
        password = getpass.getpass("Contraseña: ")

    if not nombre or not email or not password:
        print("Todos los datos son obligatorios.")
        return

    if len(password.encode("utf-8")) > 72:
        print("La contraseña es demasiado larga.")
        return

    with SessionLocal() as session:
        if get_user_by_email(session, email):
            print("Ya existe una cuenta con ese correo.")
            return

        hashed_password = bcrypt.hashpw(
            password.encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

        administrador = AdminUser(
            full_name=nombre,
            email=email,
            hashed_password=hashed_password,
            is_active=True
        )

        session.add(administrador)
        session.commit()

        print("Administrador creado correctamente.")


if __name__ == "__main__":
    crear_admin()