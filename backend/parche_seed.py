import sys

p = sys.argv[1]
s = open(p, encoding="utf-8").read()

viejo = '''    for grupo in (escenario.granjas, escenario.veterinarios, escenario.estados):
        session.add_all(grupo)
        session.flush()
    session.add_all(escenario.visitas)
    session.flush()
    session.add_all(escenario.medidas)
    session.flush()
'''
nuevo = '''    # Las filas se borraron por SQL: la sesión no debe recordar las antiguas
    session.expunge_all()

    # Se insertan copias para poder cargar el mismo escenario más de una vez
    for grupo in (
        escenario.granjas,
        escenario.veterinarios,
        escenario.estados,
        escenario.visitas,
        escenario.medidas,
    ):
        session.add_all([_copia(fila) for fila in grupo])
        session.flush()
'''
copia = '''def _copia(fila):
    """Instancia nueva con los mismos datos, sin estado de sesión."""
    return type(fila)(**fila.model_dump())


'''
assert viejo in s, "No encuentro el bloque de inserción: ¿has modificado seed.py?"
assert "def _copia(" not in s, "El parche ya está aplicado"
s = s.replace(viejo, nuevo)
s = s.replace("def insertar(", copia + "def insertar(", 1)
open(p, "w", encoding="utf-8").write(s)
print("parche aplicado")
