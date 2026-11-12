import { AudioLines, BookOpen, Clapperboard, Dumbbell, LayoutGrid, type LucideIcon } from 'lucide-react'
import type { CategoryId } from '../data'

export const CATEGORY_ICON: Record<CategoryId, LucideIcon> = {
  streaming: Clapperboard,
  music: AudioLines,
  software: LayoutGrid,
  fitness: Dumbbell,
  reading: BookOpen,
}

/** A tinted circle with the whole glyph in the category's hue (identity lists only). */
export function CategoryIcon({ category, size = 36 }: { category: CategoryId; size?: number }) {
  const Icon = CATEGORY_ICON[category]
  return (
    <span className="cat-icon" data-cat={category} style={{ width: size, height: size }} aria-hidden="true">
      <Icon size={Math.round(size * 0.47)} strokeWidth={1.9} />
    </span>
  )
}
