from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

CODIGOS = {
    401: "no_autorizado",
    403: "prohibido",
    404: "no_encontrado",
    409: "conflicto",
    422: "validacion",
}


class ApiError(Exception):
    """Error de negocio con código estable para el frontend."""

    def __init__(
        self, status_code: int, codigo: str, mensaje: str, regla_id: str | None = None
    ):
        self.status_code = status_code
        self.codigo = codigo
        self.mensaje = mensaje
        self.regla_id = regla_id


def cuerpo(codigo: str, mensaje: str, detalles: list | None = None, regla_id: str | None = None):
    return {
        "codigo": codigo,
        "mensaje": mensaje,
        "detalles": detalles or [],
        "regla_id": regla_id,
    }


def registrar_errores(app: FastAPI) -> None:
    @app.exception_handler(ApiError)
    async def _api_error(request: Request, exc: ApiError):
        return JSONResponse(
            status_code=exc.status_code,
            content=cuerpo(exc.codigo, exc.mensaje, regla_id=exc.regla_id),
        )

    @app.exception_handler(StarletteHTTPException)
    async def _http_error(request: Request, exc: StarletteHTTPException):
        codigo = CODIGOS.get(exc.status_code, "error")
        return JSONResponse(
            status_code=exc.status_code, content=cuerpo(codigo, str(exc.detail))
        )

    @app.exception_handler(RequestValidationError)
    async def _validation_error(request: Request, exc: RequestValidationError):
        detalles = [
            {
                "campo": ".".join(str(p) for p in e["loc"] if p not in ("body", "query", "path")),
                "mensaje": e["msg"],
            }
            for e in exc.errors()
        ]
        return JSONResponse(
            status_code=422,
            content=cuerpo("validacion", "Los datos enviados no son válidos.", detalles),
        )
