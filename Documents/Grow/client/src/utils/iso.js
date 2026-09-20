export const MAP_SIZE = 30
export const TILE_W = 128
export const TILE_H = 64

// Convert grid (col, row) to screen pixel coordinates (top vertex of the diamond)
export const gridToScreen = (col, row) => {
  const x = (col - row) * (TILE_W / 2)
  const y = (col + row) * (TILE_H / 2)
  return { x, y }
}

// Convert screen (x, y) (relative to canvas origin) to grid (col, row)
export const screenToGrid = (screenX, screenY) => {
  const col = Math.floor((screenX / (TILE_W / 2) + screenY / (TILE_H / 2)) / 2)
  const row = Math.floor((screenY / (TILE_H / 2) - screenX / (TILE_W / 2)) / 2)
  return { col, row }
}
