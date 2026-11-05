from typing import Annotated

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel import Session

from . import models
from .db import get_session
from .errors import ApiError
from .seguridad import TokenInvalido, usuario_id_desde_token

# auto_error=False: así el error sale con nuestro formato (401 con codigo/mensaje)
bearer = HTTPBearer(scheme_name="bearerAuth", auto_error=False)

SesionDep = Annotated[Session, Depends(get_session)]


def get_current_user(
    credenciales: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
    session: SesionDep,
) -> models.Usuario:
    if credenciales is None:
        raise ApiError(401, "no_autorizado", "Hay que iniciar sesión.")
    try:
        usuario_id = usuario_id_desde_token(credenciales.credentials)
    except TokenInvalido as error:
        raise ApiError(401, "no_autorizado", str(error)) from error
    usuario = session.get(models.Usuario, usuario_id)
    if usuario is None:
        raise ApiError(401, "no_autorizado", "Sesión no válida.")
    return usuario


UsuarioActual = Annotated[models.Usuario, Depends(get_current_user)]
