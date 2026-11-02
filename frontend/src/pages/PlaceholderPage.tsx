interface PlaceholderPageProps {
  readonly title: string
  readonly description: string
}

/** Pantalla vacía del día 1. Cada una se sustituye por la real en su día del plan. */
export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section>
      <title>{`${title} · BioRuta`}</title>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-slate-600">{description}</p>
    </section>
  )
}
