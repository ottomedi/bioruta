from fastapi import APIRouter
from sqlmodel import select

from .. import models, schemas
from ..config import settings
from ..deps import SesionDep, UsuarioActual
from ..errors import ApiError
from ..seguridad import crear_token, verificar_password

router = APIRouter(prefix="/auth", tags=["auth"])


def _token(usuario: models.Usuario) -> schemas.Token:
    return schemas.Token(access_token=crear_token(usuario.id), token_type="bearer")


@router.post("/login", response_model=schemas.Token, operation_id="login")
def login(datos: schemas.LoginRequest, session: SesionDep):
    usuario = session.exec(
        select(models.Usuario).where(models.Usuario.email == datos.email)
    ).first()
    if usuario is None or not verificar_password(datos.password, usuario.password_hash):
        # Mismo mensaje en los dos casos: no se revela si el email existe
        raise ApiError(401, "no_autorizado", "Email o contraseña incorrectos.")
    return _token(usuario)


@router.post("/demo", response_model=schemas.Token, operation_id="loginDemo")
def login_demo(session: SesionDep):
    if not settings.demo_habilitado:
        raise ApiError(
            403, "demo_desactivado", "El modo demo está desactivado en este despliegue."
        )
    usuario = session.exec(
        select(models.Usuario).where(models.Usuario.email == settings.demo_email)
    ).first()
    if usuario is None:
        raise ApiError(
            403, "demo_no_disponible", "Este despliegue no tiene cargado el usuario de demo."
        )
    return _token(usuario)


@router.get("/me", response_model=schemas.Usuario, operation_id="getMe")
def me(usuario: UsuarioActual, session: SesionDep):
    vet = session.get(models.Veterinario, usuario.veterinario_id)
    return schemas.Usuario(
        id=usuario.id,
        email=usuario.email,
        veterinario=schemas.Veterinario(
            id=vet.id,
            nombre=vet.nombre,
            base=schemas.Coordenadas(latitud=vet.base_latitud, longitud=vet.base_longitud),
        ),
    )
