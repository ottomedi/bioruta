import { LogIn, LogOut, MapPinOff } from 'lucide-react'
import type { Estado, Granja } from '../api/types'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { DataTable, type Columna } from '../components/ui/DataTable'
import { EmptyState } from '../components/ui/EmptyState'
import { KpiCard } from '../components/ui/KpiCard'
import { EstadoBadge, RiskBadge } from '../components/ui/RiskBadge'
import { Spinner } from '../components/ui/Spinner'
import { useToast } from '../components/ui/toastContext'
import { ETIQUETA_TIPO_GRANJA, NIVEL_POR_ESTADO, type NivelRiesgo } from '../domain/riesgo'
import { GRANJAS } from '../mocks/fixtures'

const NIVELES: readonly NivelRiesgo[] = ['alto', 'medio', 'bajo', 'sin_datos']
// Las claves siguen el orden del contrato, de más a menos riesgo.
const ESTADOS = Object.keys(NIVEL_POR_ESTADO) as Estado[]

const COLUMNAS_GRANJA: readonly Columna<Granja>[] = [
  { key: 'nombre', header: 'Granja', render: (g) => g.nombre, sortValue: (g) => g.nombre },
  {
    key: 'tipo',
    header: 'Tipo',
    render: (g) => ETIQUETA_TIPO_GRANJA[g.tipo],
    sortValue: (g) => ETIQUETA_TIPO_GRANJA[g.tipo],
  },
  { key: 'municipio', header: 'Municipio', render: (g) => g.municipio },
  {
    key: 'estado',
    header: 'Estado',
    render: (g) => <EstadoBadge estado={g.estado_actual} />,
    sortValue: (g) => ESTADOS.indexOf(g.estado_actual),
  },
]

/**
 * Catálogo interno con todos los componentes base, en vez de Storybook.
 * No sale en la navegación: se abre en /dev/componentes.
 */
export function ComponentesPage() {
  const toast = useToast()

  return (
    <div className="flex flex-col gap-6">
      <title>Componentes · BioRuta</title>
      <header>
        <h1 className="text-2xl font-bold">Catálogo de componentes</h1>
        <p className="mt-1 text-slate-600">
          Las piezas con las que se montan las pantallas. Datos de ejemplo de src/mocks.
        </p>
      </header>

      <Card title="Niveles de riesgo">
        <p className="mb-3 text-sm text-slate-600">
          Cada color va siempre con su icono y su texto, para que se entienda sin distinguir
          colores.
        </p>
        <div className="flex flex-wrap gap-2">
          {NIVELES.map((nivel) => (
            <RiskBadge key={nivel} nivel={nivel} />
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {ESTADOS.map((estado) => (
            <EstadoBadge key={estado} estado={estado} />
          ))}
        </div>
      </Card>

      <Card title="Botones">
        <div className="flex flex-wrap gap-2">
          <Button>Calcular ruta</Button>
          <Button variante="secundario">Cancelar</Button>
          <Button variante="peligro">Simular positivo</Button>
          <Button variante="fantasma">Ver fuentes</Button>
          <Button cargando>Guardando</Button>
          <Button disabled>Desactivado</Button>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <Button tamano="grande">
            <LogIn aria-hidden className="size-6" /> Entrar
          </Button>
          <Button tamano="grande" variante="secundario">
            <LogOut aria-hidden className="size-6" /> Salir
          </Button>
        </div>
      </Card>

      <section aria-labelledby="kpis" className="flex flex-col gap-3">
        <h2 id="kpis" className="text-lg font-semibold">
          KpiCard
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Ruta más corta" value="42,5" unit="km" />
          <KpiCard label="Ruta segura" value="47,7" unit="km" detail="+5,2 km" />
          <KpiCard label="Exposiciones (más corta)" value={2} tono="alto" />
          <KpiCard label="Exposiciones (segura)" value={0} tono="bajo" />
        </div>
      </section>

      <Card title="DataTable">
        <DataTable
          caption="Granjas de ejemplo"
          columns={COLUMNAS_GRANJA}
          rows={GRANJAS}
          getRowId={(g) => g.id}
          getSearchText={(g) => `${g.nombre} ${g.municipio}`}
          emptyMessage="Ninguna granja coincide con la búsqueda."
        />
      </Card>

      <Card title="Avisos (Toast)">
        <div className="flex flex-wrap gap-2">
          <Button variante="secundario" onClick={() => toast.show('exito', 'Visita registrada.')}>
            Éxito
          </Button>
          <Button
            variante="secundario"
            onClick={() => toast.show('error', 'No se ha podido calcular la ruta.')}
          >
            Error
          </Button>
          <Button variante="secundario" onClick={() => toast.show('info', 'Datos de demo.')}>
            Información
          </Button>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card title="EmptyState">
          <EmptyState
            icon={MapPinOff}
            title="Sin ruta para hoy"
            description="Elige las granjas del día y pulsa «Calcular»."
            action={<Button variante="secundario">Elegir granjas</Button>}
          />
        </Card>
        <Card title="Spinner">
          <div className="flex items-center gap-3 text-slate-600">
            <Spinner /> Cargando granjas…
          </div>
        </Card>
      </div>
    </div>
  )
}
