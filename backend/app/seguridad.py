from datetime import UTC, datetime, timedelta

import bcrypt
import jwt

from .config import settings


class TokenInvalido(Exception):
    """El token falta, está mal firmado o ha caducado. El mensaje se puede enseñar al usuario."""


def hashear_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verificar_password(password: str, hash_guardado: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode(), hash_guardado.encode())
    except ValueError:  # hash mal formado o contraseña demasiado larga para bcrypt
        return False


def crear_token(usuario_id: int, minutos: int | None = None) -> str:
    ahora = datetime.now(UTC)
    duracion = settings.jwt_minutos if minutos is None else minutos
    datos = {"sub": str(usuario_id), "iat": ahora, "exp": ahora + timedelta(minutes=duracion)}
    return jwt.encode(datos, settings.jwt_secret, algorithm=settings.jwt_algoritmo)


def usuario_id_desde_token(token: str) -> int:
    try:
        datos = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algoritmo],
            options={"require": ["exp", "sub"]},
        )
        return int(datos["sub"])
    except jwt.ExpiredSignatureError as error:
        raise TokenInvalido("La sesión ha caducado. Vuelve a iniciar sesión.") from error
    except (jwt.InvalidTokenError, ValueError) as error:
        raise TokenInvalido("Sesión no válida.") from error
