interface TitleBadgeProps {
  title: { title: string; icon: string; color: string } | null | undefined
  size?: 'sm' | 'md'
}

/** Selo do título honorífico mais alto conquistado pelo usuário. */
export function TitleBadge({ title, size = 'sm' }: TitleBadgeProps) {
  if (!title) return null
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold border ${pad}`}
      style={{ background: `${title.color}1a`, color: title.color, borderColor: `${title.color}55` }}
      title={`Título: ${title.title}`}
    >
      <span>{title.icon}</span>
      {title.title}
    </span>
  )
}
