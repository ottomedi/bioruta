import { Search, X } from 'lucide-react'
import { useCallback, useEffect, useId, useState, type ReactNode } from 'react'
import { listarZonas } from '../../api/granjas'
import type { Estado, TipoGranja } from '../../api/types'
import { useAuth } from '../../auth/authContext'
import { Button } from '../../components/ui/Button'
import { ETIQUETA_ESTADO, ETIQUETA_TIPO_GRANJA } from '../../domain/riesgo'
import { useCarga } from '../../lib/useCarga'
import type { ClaveFiltro } from './filtros'

/** Espera tras la última tecla antes de buscar. */
const ESPERA_BUSQUEDA_MS = 300

const CAMPO =
  'mt-1 min-h-tactil w-full rounded-md border border-linea bg-superficie px-3 text-base text-tinta hover:border-campo'

// Las claves de los registros siguen el orden del contrato (de más a menos sensible o riesgo).
const TIPOS = Object.entries(ETIQUETA_TIPO_GRANJA) as [TipoGranja, string][]
const ESTADOS = Object.entries(ETIQUETA_ESTADO) as [Estado, string][]

interface FiltrosGranjasProps {
  readonly valores: Readonly<Record<ClaveFiltro, string>>
  readonly onCambiar: (clave: ClaveFiltro, valor: string) => void
  readonly onLimpiar?: () => void
}

export function FiltrosGranjas({ valores, onCambiar, onLimpiar }: FiltrosGranjasProps) {
  return (
    <form
      role="search"
      aria-label="Filtrar granjas"
      onSubmit={(e) => e.preventDefault()}
      className="grid grid-cols-3 items-end gap-x-2 gap-y-3 sm:gap-x-3 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]"
    >
      <Buscador valor={valores.q} onCambiar={(q) => onCambiar('q', q)} />
      <Selector etiqueta="Tipo" valor={valores.tipo} onCambiar={(v) => onCambiar('tipo', v)}>
        {TIPOS.map(([valor, texto]) => (
          <option key={valor} value={valor}>
            {texto}
          </option>
        ))}
      </Selector>
      <Selector etiqueta="Estado" valor={valores.estado} onCambiar={(v) => onCambiar('estado', v)}>
        {ESTADOS.map(([valor, texto]) => (
          <option key={valor} value={valor}>
            {texto}
          </option>
        ))}
      </Selector>
      <SelectorZona valor={valores.zona} onCambiar={(v) => onCambiar('zona', v)} />
      {onLimpiar && (
        <Button
          variante="fantasma"
          onClick={onLimpiar}
          className="col-span-3 justify-self-start lg:col-span-1"
        >
          <X aria-hidden className="size-5" /> Quitar filtros
        </Button>
      )}
    </form>
  )
}

interface BuscadorProps {
  readonly valor: string
  readonly onCambiar: (valor: string) => void
}

/**
 * Guarda lo escrito y solo avisa cuando se deja de teclear. La espera solo
 * arranca con lo que teclea el usuario: si la URL cambia por fuera (Quitar
 * filtros, volver atrás), el campo la sigue y se descarta la búsqueda pendiente.
 */
function Buscador({ valor, onCambiar }: BuscadorProps) {
  const id = useId()
  const [texto, setTexto] = useState(valor)
  const [pendiente, setPendiente] = useState(false)
  // Lo último que el campo mandó a la URL, para no confundir su propio eco con un cambio externo.
  const [enviado, setEnviado] = useState(valor)
  const [valorPrevio, setValorPrevio] = useState(valor)
  if (valor !== valorPrevio) {
    setValorPrevio(valor)
    if (valor !== enviado) {
      setTexto(valor)
      setEnviado(valor)
      setPendiente(false)
    }
  }

  useEffect(() => {
    if (!pendiente) return
    const timer = setTimeout(() => {
      const q = texto.trim()
      setPendiente(false)
      setEnviado(q)
      onCambiar(q)
    }, ESPERA_BUSQUEDA_MS)
    return () => clearTimeout(timer)
  }, [texto, pendiente, onCambiar])

  return (
    <div className="col-span-3 lg:col-span-1">
      <label htmlFor={id} className="font-medium">
        Buscar
      </label>
      <div className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 mt-0.5 size-5 -translate-y-1/2 text-tinta-suave"
        />
        <input
          id={id}
          type="search"
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value)
            setPendiente(true)
          }}
          placeholder="Nombre, municipio o REGA"
          className={`${CAMPO} pl-10 placeholder:text-tinta-suave`}
        />
      </div>
    </div>
  )
}

interface SelectorProps {
  readonly etiqueta: string
  readonly valor: string
  readonly onCambiar: (valor: string) => void
  readonly disabled?: boolean
  /** Texto bajo el campo, por ejemplo si no se han podido cargar las opciones. */
  readonly ayuda?: string
  readonly children: ReactNode
}

function Selector({ etiqueta, valor, onCambiar, disabled, ayuda, children }: SelectorProps) {
  const id = useId()
  const ayudaId = useId()
  return (
    <div>
      <label htmlFor={id} className="font-medium">
        {etiqueta}
      </label>
      <select
        id={id}
        value={valor}
        disabled={disabled}
        aria-describedby={ayuda ? ayudaId : undefined}
        onChange={(e) => onCambiar(e.target.value)}
        className={CAMPO}
      >
        <option value="">Todos</option>
        {children}
      </select>
      {ayuda && (
        <p id={ayudaId} className="mt-1 text-sm text-tinta-suave">
          {ayuda}
        </p>
      )}
    </div>
  )
}

type SelectorZonaProps = Pick<SelectorProps, 'valor' | 'onCambiar'>

function SelectorZona({ valor, onCambiar }: SelectorZonaProps) {
  const { request } = useAuth()
  const cargar = useCallback((signal: AbortSignal) => listarZonas(request, signal), [request])
  const [estado] = useCarga(cargar)
  const zonas = estado.kind === 'ok' ? estado.datos : []
  // Una zona de la URL que ya no está en la lista se mantiene, para que el filtro no mienta.
  const opciones = valor && !zonas.includes(valor) ? [valor, ...zonas] : zonas

  return (
    <Selector
      etiqueta="Zona"
      valor={valor}
      onCambiar={onCambiar}
      disabled={estado.kind === 'error' && !valor}
      ayuda={estado.kind === 'error' ? 'No se han podido cargar las zonas.' : undefined}
    >
      {opciones.map((zona) => (
        <option key={zona} value={zona}>
          {zona}
        </option>
      ))}
    </Selector>
  )
}
