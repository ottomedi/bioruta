import { useParams } from 'react-router'
import { PlaceholderPage } from './PlaceholderPage'

export function GranjaDetallePage() {
  const { id } = useParams()
  return (
    <PlaceholderPage
      title={`Granja ${id ?? ''}`.trim()}
      description="Datos, historial sanitario y últimas visitas."
    />
  )
}
