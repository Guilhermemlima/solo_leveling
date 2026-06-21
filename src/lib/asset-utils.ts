type AssetType = 'enemies' | 'chests' | 'shields' | 'items' | 'rank-plates' |
  'weapons/staffs' | 'weapons/axes' | 'weapons/swords' | 'weapons/bows' |
  'weapons/daggers' | 'weapons/spears' | 'armors/full' | 'armors/helmets' |
  'armors/chestplates' | 'armors/shoulders' | 'armors/gauntlets' |
  'armors/boots' | 'armors/cloaks'

/** Returns the public asset path for a given type + slug + optional rank. */
export function getAssetPath(type: AssetType, slug: string, rank?: string): string {
  const rankSuffix = rank ? `-rank-${rank.toLowerCase()}` : ''
  return `/assets/${type}/${slug}${rankSuffix}.png`
}

/** Slugifies a Portuguese name to a URL-safe lowercase hyphenated string. */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}
