interface PlaceholderPageProps {
  readonly title: string
  readonly description: string
}

/** Pantalla vacía provisional. Cada una se sustituye por la real cuando esté hecha. */
export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section>
      <title>{`${title} · BioRuta`}</title>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-slate-600">{description}</p>
    </section>
  )
}
