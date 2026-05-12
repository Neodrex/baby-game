// ---------------------------------------------------------------------------
// Colouring mode outlines
// ---------------------------------------------------------------------------
export interface ColouringShape {
  id: string
  asset: string
  label: string
}

export const COLOURING_SHAPES: ColouringShape[] = [
  { id: 'balloon',  asset: 'col-balloon',  label: 'balloon' },
  { id: 'duck',     asset: 'col-duck',     label: 'duck' },
  { id: 'house',    asset: 'col-house',    label: 'house' },
  { id: 'flower',   asset: 'col-flower',   label: 'flower' },
]

// ---------------------------------------------------------------------------
// Catch mode items
// ---------------------------------------------------------------------------
export interface CatchItem {
  id: string
  asset: string
  label: string
}

export const CATCH_ITEMS: CatchItem[] = [
  { id: 'leaf',    asset: 'catch-leaf',    label: 'leaf' },
  { id: 'bubble',  asset: 'catch-bubble',  label: 'bubble' },
  { id: 'star',    asset: 'catch-star',    label: 'star' },
  { id: 'balloon', asset: 'catch-balloon', label: 'balloon' },
  { id: 'feather', asset: 'catch-feather', label: 'feather' },
]

// ---------------------------------------------------------------------------
// Sort mode categories and items
// ---------------------------------------------------------------------------
export interface SortCategory {
  id: string
  asset: string
  label: string
  colour: number
}

export interface SortItem {
  id: string
  asset: string
  label: string
  categoryId: string
}

export const SORT_CATEGORIES: SortCategory[] = [
  { id: 'red',    asset: 'basket-red',    label: 'red basket',   colour: 0xe05050 },
  { id: 'blue',   asset: 'basket-blue',   label: 'blue basket',  colour: 0x5080e0 },
  { id: 'yellow', asset: 'basket-yellow', label: 'yellow basket', colour: 0xe0c030 },
]

export const SORT_ITEMS: SortItem[] = [
  { id: 'red-circle',    asset: 'sort-red-circle',    label: 'red circle',    categoryId: 'red' },
  { id: 'red-square',    asset: 'sort-red-square',    label: 'red square',    categoryId: 'red' },
  { id: 'blue-circle',   asset: 'sort-blue-circle',   label: 'blue circle',   categoryId: 'blue' },
  { id: 'blue-square',   asset: 'sort-blue-square',   label: 'blue square',   categoryId: 'blue' },
  { id: 'yellow-circle', asset: 'sort-yellow-circle', label: 'yellow circle', categoryId: 'yellow' },
  { id: 'yellow-square', asset: 'sort-yellow-square', label: 'yellow square', categoryId: 'yellow' },
]

// ---------------------------------------------------------------------------
// Find mode objects
// ---------------------------------------------------------------------------
export interface FindObject {
  id: string
  asset: string
  label: string
  narration: string
}

export const FIND_OBJECTS: FindObject[] = [
  { id: 'duck',  asset: 'find-duck',  label: 'duck',  narration: 'Find the duck' },
  { id: 'ball',  asset: 'find-ball',  label: 'ball',  narration: 'Find the ball' },
  { id: 'cat',   asset: 'find-cat',   label: 'cat',   narration: 'Find the cat' },
  { id: 'car',   asset: 'find-car',   label: 'car',   narration: 'Find the car' },
  { id: 'apple', asset: 'find-apple', label: 'apple', narration: 'Find the apple' },
  { id: 'teddy', asset: 'find-teddy', label: 'teddy', narration: 'Find the teddy' },
]

// ---------------------------------------------------------------------------
// Scene builder stickers
// ---------------------------------------------------------------------------
export interface Sticker {
  id: string
  asset: string
  label: string
  narration: string
}

export const STICKERS: Sticker[] = [
  { id: 'cloud',  asset: 'sticker-cloud',  label: 'cloud',  narration: 'You added a cloud' },
  { id: 'sun',    asset: 'sticker-sun',    label: 'sun',    narration: 'You added a sun' },
  { id: 'tree',   asset: 'sticker-tree',   label: 'tree',   narration: 'You added a tree' },
  { id: 'flower', asset: 'sticker-flower', label: 'flower', narration: 'You added a flower' },
  { id: 'bird',   asset: 'sticker-bird',   label: 'bird',   narration: 'You added a bird' },
  { id: 'moon',   asset: 'sticker-moon',   label: 'moon',   narration: 'You added a moon' },
  { id: 'star',   asset: 'sticker-star',   label: 'star',   narration: 'You added a star' },
  { id: 'fish',   asset: 'sticker-fish',   label: 'fish',   narration: 'You added a fish' },
]
