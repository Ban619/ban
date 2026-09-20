import React, { useRef, useEffect, useState } from 'react'
import EditMode from './editMode'
import SeedPicker from './SeedPicker'
import SoilActions from './SoilActions'
import { MAP_SIZE, TILE_W, TILE_H, gridToScreen, screenToGrid } from '../utils/iso'

const makeEmptyGrid = () => {
  const g = []
  for (let r = 0; r < MAP_SIZE; r++){
    const row = []
    for (let c = 0; c < MAP_SIZE; c++) row.push({ type: 'grass', placedItem: null, isAnchor: false })
    g.push(row)
  }
  return g
}

const buildingSpecs = {
  barn: { w: 2, h: 2, color: '#8B4513', cost: 50, previewScale: 0.5, previewCap: 90, verticalOffset: -8 },
  silo: { w: 2, h: 2, color: '#C19A6B', cost: 120, previewScale: 0.6, previewCap: 96, verticalOffset: -28 },
  soil: { w: 1, h: 1, color: '#a67c4a', cost: 5, previewScale: 0.6, previewCap: 48, verticalOffset: -6 }
}

const DEFAULT_CAMERA = { x: 600, y: 60 }
const DEFAULT_SCALE = 1

const BUILDING_SPRITES = {
  barn: '/assets/buildings/barn.png',
  silo: '/assets/buildings/silo.png'
}

// seed growth specs (milliseconds)
const seedSpecs = {
  sunflower: { grow: 60 * 1000 },
  cabbage: { grow: 45 * 1000 },
  onion: { grow: 30 * 1000 }
}

export default function GameCanvas({ onStateChange, setCoins, addXP, seeds, setSeeds, selectedSeed, showToast, placingBuilding, setPlacingBuilding, onConfirmBuilding }){
  const canvasRef = useRef(null)
  const [grid, setGrid] = useState(makeEmptyGrid)
  const [camera, setCamera] = useState(DEFAULT_CAMERA)
  const [hover, setHover] = useState(null)
  const [placing, setPlacing] = useState(null) // local temporary placement type
  const [sprites, setSprites] = useState({})
  const [previewAlpha, setPreviewAlpha] = useState(0)
  const [editMode, setEditMode] = useState({ visible: false, col: 0, row: 0, screenX: 0, screenY: 0, rotation: 0 })
  const [seedPicker, setSeedPicker] = useState({ visible: false, col: 0, row: 0, x:0, y:0 })
  const [soilActions, setSoilActions] = useState({ visible: false, col: 0, row: 0, x:0, y:0 })
  const [movingSoil, setMovingSoil] = useState(null) // { srcCol, srcRow }
  const [sickleMode, setSickleMode] = useState(false)
  const [sickleActive, setSickleActive] = useState(false)
  const [sicklePath, setSicklePath] = useState([])
  const sickleAnimRef = useRef({ active: false, points: [], start: 0, duration: 300 })
  const lastSoilTap = useRef({ time: 0, col: -1, row: -1 })
  const lastTapRef = useRef({ t:0, col:-1, row:-1 })
  const [timeNow, setTimeNow] = useState(Date.now())
  // refs to access latest state inside RAF loop
  const gridRef = useRef(grid)
  const animStateRef = useRef(new WeakMap())
  const sickleModeRef = useRef(sickleMode)
  const sickleActiveRef = useRef(sickleActive)
  const sicklePathRef = useRef(sicklePath)
  const panningRef = useRef({ active:false, pointerId:null, lastX:0, lastY:0, vx:0, vy:0 })
  const momentumRef = useRef({ x:0, y:0 })
  const sickleHarvestedRef = useRef(new Set())
  // tuning
  const PAN_DECAY = 4.0 // higher = quicker stop
  const MOMENTUM_SCALE = 0.5 // scale applied to released velocity
  const OVERSCROLL_ALLOWANCE = 32 // pixels allowed before hard clamp
  const PAN_SENSITIVITY = 1.0 // multiply pointer deltas
  const MIN_SCALE = 0.6
  const MAX_SCALE = 1.8
  const cameraTweenRef = useRef(null)
  const cameraRef = useRef(camera)
  const [scale, setScale] = useState(DEFAULT_SCALE)
  const scaleRef = useRef(DEFAULT_SCALE)
  const pointersRef = useRef(new Map())
  const pinchRef = useRef(null)
  const hoverRef = useRef(hover)
  const placingRef = useRef(placing)
  const placingBuildingRef = useRef(placingBuilding)
  const editModeRef = useRef(editMode)
  const spritesRef = useRef(sprites)
  const previewAlphaRef = useRef(previewAlpha)
  const timeNowRef = useRef(timeNow)

  // clock tick to update crop timers
  useEffect(()=>{
    const id = setInterval(()=> setTimeNow(Date.now()), 1000)
    return ()=> clearInterval(id)
  },[])

  // keep refs in sync
  useEffect(()=>{ gridRef.current = grid },[grid])
  useEffect(()=>{ cameraRef.current = camera },[camera])
  useEffect(()=>{ hoverRef.current = hover },[hover])
  useEffect(()=>{ placingRef.current = placing },[placing])
  useEffect(()=>{ placingBuildingRef.current = placingBuilding },[placingBuilding])
  useEffect(()=>{ editModeRef.current = editMode },[editMode])
  useEffect(()=>{ spritesRef.current = sprites },[sprites])
  useEffect(()=>{ previewAlphaRef.current = previewAlpha },[previewAlpha])
  useEffect(()=>{ timeNowRef.current = timeNow },[timeNow])
  useEffect(()=>{ sickleModeRef.current = sickleMode },[sickleMode])
  useEffect(()=>{ sickleActiveRef.current = sickleActive },[sickleActive])
  useEffect(()=>{ sicklePathRef.current = sicklePath },[sicklePath])
  useEffect(()=>{ panningRef.current = panningRef.current },[])
  useEffect(()=>{ scaleRef.current = scale },[scale])

  // preload building sprites from a set of candidate paths (best-effort; falls back to block if missing)
  useEffect(()=>{
    const candidatesFor = (k) => ([`/${k}.png`, `/assets/buildings/${k}.png`, `/icons/${k}.png`])
    Object.keys(buildingSpecs).forEach(key=>{
      const candidates = candidatesFor(key)
      let loaded = false
      candidates.forEach(src => {
        if(loaded) return
        const img = new Image()
        img.src = src
        img.onload = ()=>{
          if(loaded) return
          loaded = true
          setSprites(s => ({ ...s, [key]: img }))
        }
        img.onerror = ()=>{
          // try next candidate
        }
      })
    })
    // preload sickle sprite specifically (public/sick.png)
    ;(() => {
      const img = new Image()
      img.src = '/sick.png'
      img.onload = ()=> setSprites(s => ({ ...s, sick: img }))
    })()
  },[])

  // load persisted grid from localStorage on mount (simple best-effort)
  useEffect(()=>{
    try{
      const raw = localStorage.getItem('grow:grid')
      if(raw){
        const parsed = JSON.parse(raw)
        if(Array.isArray(parsed)){
            if(parsed.length === MAP_SIZE) {
              setGrid(parsed)
            } else if(parsed.length < MAP_SIZE){
              // migrate smaller saved grid into a new larger grid (centered copy)
              const ng = makeEmptyGrid()
              const oldRows = parsed.length
              const oldCols = (parsed[0] && parsed[0].length) || oldRows
              const rowOffset = Math.max(0, Math.floor((MAP_SIZE - oldRows) / 2))
              const colOffset = Math.max(0, Math.floor((MAP_SIZE - oldCols) / 2))
              for(let r=0;r<oldRows;r++){
                const cols = Math.min(parsed[r].length || 0, oldCols)
                for(let c=0;c<cols;c++){
                  try{ ng[rowOffset + r][colOffset + c] = parsed[r][c] }catch(_){ ng[rowOffset + r][colOffset + c] = { type: 'grass', placedItem: null, isAnchor: false } }
                }
              }
              setGrid(ng)
              try{ localStorage.setItem('grow:grid', JSON.stringify(ng)) }catch(_){ }
            } else {
              // larger saved grid - trim to MAP_SIZE
              const ng = makeEmptyGrid()
              for(let r=0;r<MAP_SIZE;r++){
                for(let c=0;c<MAP_SIZE;c++){
                  try{ ng[r][c] = parsed[r][c] }catch(_){ ng[r][c] = { type: 'grass', placedItem: null, isAnchor: false } }
                }
              }
              setGrid(ng)
            }
        }
      }
    }catch(e){ }
  },[])

  // compute and store runtime default camera centered on the map (depends on canvas size)
  const defaultCameraRef = useRef(DEFAULT_CAMERA)
  useEffect(()=>{
    const computeDefault = ()=>{
      const canvas = canvasRef.current
      if(!canvas) return
      const rect = canvas.getBoundingClientRect()
      // center on map midpoint tile
      const mid = Math.floor((MAP_SIZE - 1) / 2)
      const scr = gridToScreen(mid, mid)
      const s = scaleRef.current || DEFAULT_SCALE
      const camX = Math.round((rect.width / 2) - (scr.x * s))
      const camY = Math.round((rect.height / 2) - ((scr.y + TILE_H/2) * s))
      defaultCameraRef.current = { x: camX, y: camY }
      // only set camera automatically if user hasn't moved it (still at initial default)
      if(cameraRef.current && cameraRef.current.x === DEFAULT_CAMERA.x && cameraRef.current.y === DEFAULT_CAMERA.y){
        cameraRef.current = { x: camX, y: camY }
        setCamera({ x: camX, y: camY })
      }
    }
    // compute once after mount and on resize
    computeDefault()
    const onResize = ()=> computeDefault()
    window.addEventListener('resize', onResize)
    return ()=> window.removeEventListener('resize', onResize)
  },[MAP_SIZE])

  useEffect(()=>{ if(onStateChange) onStateChange(grid) },[grid])

  // persist grid to localStorage so plantedAt survives reloads
  useEffect(()=>{
    try{
      localStorage.setItem('grow:grid', JSON.stringify(grid))
    }catch(e){/* ignore */}
  },[grid])

  // animate preview alpha on placingBuilding state changes
  useEffect(()=>{
    let raf = null
    let start = null
    const duration = 220
    const from = previewAlpha
    const to = placingBuilding ? 0.55 : 0
    function step(ts){
      if(!start) start = ts
      const t = Math.min(1, (ts - start) / duration)
      const eased = t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t // simple ease
      const v = from + (to - from) * eased
      setPreviewAlpha(v)
      if(t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return ()=> raf && cancelAnimationFrame(raf)
  },[placingBuilding])

  // continuous RAF render loop for smooth animations
  useEffect(()=>{
    let raf = null
    const canvas = canvasRef.current
    if(!canvas) return
    const ctx = canvas.getContext('2d')

    function resizeIfNeeded(){
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      const w = Math.floor(rect.width * dpr)
      const h = Math.floor(rect.height * dpr)
      if(canvas.width !== w || canvas.height !== h){
        canvas.width = w
        canvas.height = h
        ctx.setTransform(dpr,0,0,dpr,0,0)
      }
      return { rect }
    }

    let lastRenderTs = performance.now()
    function render(nowTs){
      const { rect } = resizeIfNeeded()
      const cam = cameraRef.current
      const dt = Math.max(0.001, (nowTs - lastRenderTs) / 1000)
      lastRenderTs = nowTs
      // no automatic momentum: camera moves only while user drags

      // camera tween (double-tap center)
      const tween = cameraTweenRef.current
      if(tween && tween.active){
        const t = Math.min(1, (nowTs - tween.start) / tween.duration)
        const ease = t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t
        cam.x = tween.from.x + (tween.to.x - tween.from.x) * ease
        cam.y = tween.from.y + (tween.to.y - tween.from.y) * ease
        // support optional scale animation alongside camera
        if(tween.from.scale !== undefined && tween.to.scale !== undefined){
          const newScale = tween.from.scale + (tween.to.scale - tween.from.scale) * ease
          scaleRef.current = newScale
          setScale(newScale)
        }
        if(t >= 1) tween.active = false
        cameraRef.current = cam
        setCamera(s => ({ ...s, x: cam.x, y: cam.y }))
      }

      // clamp camera to farm bounds so empty space never shows
      const mapMinX = -(MAP_SIZE - 1) * (TILE_W / 2)
      const mapMaxX = (MAP_SIZE - 1) * (TILE_W / 2)
      const mapMinY = 0
      const mapMaxY = (MAP_SIZE - 1) * TILE_H
      const extraW = TILE_W/2
      const extraH = TILE_H
      const worldLeft = mapMinX - extraW
      const worldRight = mapMaxX + extraW
      const worldTop = mapMinY
      const worldBottom = mapMaxY + extraH
      const minCamX = rect.width - worldRight - OVERSCROLL_ALLOWANCE
      const maxCamX = -worldLeft + OVERSCROLL_ALLOWANCE
      const minCamY = rect.height - worldBottom - OVERSCROLL_ALLOWANCE
      const maxCamY = -worldTop + OVERSCROLL_ALLOWANCE
      // hard clamp with small allowance
      if(cam.x < minCamX) { cam.x = minCamX; momentumRef.current.x = 0 }
      if(cam.x > maxCamX) { cam.x = maxCamX; momentumRef.current.x = 0 }
      if(cam.y < minCamY) { cam.y = minCamY; momentumRef.current.y = 0 }
      if(cam.y > maxCamY) { cam.y = maxCamY; momentumRef.current.y = 0 }
      const g = gridRef.current
      const h = hoverRef.current
      const placeType = getPlaceType(placingRef.current, placingBuildingRef.current)
      const em = editModeRef.current
      ctx.clearRect(0,0,rect.width,rect.height)
      ctx.save()
      ctx.translate(cam.x, cam.y)
      // apply scale for zooming
      const s = scaleRef.current || 1
      ctx.scale(s, s)

      // 1) ground
      for (let r = 0; r < MAP_SIZE; r++){
        for (let c = 0; c < MAP_SIZE; c++){
          const { x, y } = gridToScreen(c, r)
          drawTile(ctx, x, y, g[r][c].type)
        }
      }

      // 2) crops
      for (let r = 0; r < MAP_SIZE; r++){
        for (let c = 0; c < MAP_SIZE; c++){
          const cell = g[r][c]
          if(cell.placedItem && typeof cell.placedItem === 'object' && cell.placedItem.crop){
            const { x, y } = gridToScreen(c, r)
            drawCrop(ctx, x, y, cell)
          }
        }
      }

      // 3) ghost
      const rotation = em && em.visible ? em.rotation : 0
      if(h && placeType){
        const spec = buildingSpecs[placeType]
        if(spec){
          const wR = (rotation % 2) ? spec.h : spec.w
          const hR = (rotation % 2) ? spec.w : spec.h
          const can = canPlaceAt(g, h.col, h.row, wR, hR)
          drawGhost(ctx, h.col, h.row, wR, hR, can, placeType, rotation)
        }
      }

      // 4) buildings
      const anchors = []
      for (let r = 0; r < MAP_SIZE; r++){
        for (let c = 0; c < MAP_SIZE; c++){
          const cell = g[r][c]
          const placed = cell.placedItem
          if(placed && cell.isAnchor && typeof placed === 'object' && placed.id){
            anchors.push({ r, c, id: placed.id, rot: placed.rot || 0 })
          }
        }
      }
      anchors.sort((a,b)=> (a.r + a.c) - (b.r + b.c) )
      for (const a of anchors){
        drawBuilding(ctx, a.c, a.r, a.id, a.rot || 0)
      }

      // sickle overlay: draw current path and animate swipe if active
      try{
        const sPath = sicklePathRef.current || []
        const sAnim = sickleAnimRef.current || { active:false }
        const sickImg = spritesRef.current && spritesRef.current.sick
        if(sPath && sPath.length > 0){
          ctx.save()
          ctx.lineWidth = 6
          ctx.lineCap = 'round'
          ctx.strokeStyle = 'rgba(255,255,255,0.35)'
          ctx.beginPath()
          ctx.moveTo(sPath[0].x, sPath[0].y)
          for(let i=1;i<sPath.length;i++) ctx.lineTo(sPath[i].x, sPath[i].y)
          ctx.stroke()
          ctx.restore()
          // draw sickle at last pointer
          const last = sPath[sPath.length-1]
          if(sickImg && sickImg.naturalWidth){
            const iw = 48
            const ih = (sickImg.naturalHeight / sickImg.naturalWidth) * iw
            let angle = 0
            if(sPath.length >= 2){ const a = sPath[sPath.length-2]; angle = Math.atan2(last.y - a.y, last.x - a.x) }
            ctx.save()
            ctx.translate(last.x, last.y)
            ctx.rotate(angle)
            ctx.drawImage(sickImg, -iw/2, -ih/2, iw, ih)
            ctx.restore()
          }
        }

        // play swipe animation along recorded points
        if(sAnim && sAnim.active && sAnim.points && sAnim.points.length >= 2){
          const pts = sAnim.points
          const dur = sAnim.duration || 300
          const t = Math.min(1, (Date.now() - sAnim.start) / dur)
          // compute total length
          let total = 0
          const segs = []
          for(let i=1;i<pts.length;i++){ const dx = pts[i].x - pts[i-1].x; const dy = pts[i].y - pts[i-1].y; const l = Math.hypot(dx,dy); segs.push({dx,dy,l, x1:pts[i-1].x, y1:pts[i-1].y}); total += l }
          let target = total * t
          let pos = { x: pts[pts.length-1].x, y: pts[pts.length-1].y, angle:0 }
          let acc = 0
          for(const s of segs){ if(target <= s.l + acc){ const segT = (target - acc) / s.l; pos.x = s.x1 + s.dx * segT; pos.y = s.y1 + s.dy * segT; pos.angle = Math.atan2(s.dy, s.dx); break } acc += s.l }
          // draw animated sickle
          const sickImg2 = spritesRef.current && spritesRef.current.sick
          if(sickImg2 && sickImg2.naturalWidth){
            const iw = 56
            const ih = (sickImg2.naturalHeight / sickImg2.naturalWidth) * iw
            ctx.save()
            ctx.translate(pos.x, pos.y)
            ctx.rotate(pos.angle)
            ctx.globalAlpha = 1
            ctx.drawImage(sickImg2, -iw/2, -ih/2, iw, ih)
            ctx.restore()
          }
          if(t >= 1) sickleAnimRef.current.active = false
        }
      }catch(e){/* overlay draw safe */}

      ctx.restore()
      raf = requestAnimationFrame(render)
    }

    raf = requestAnimationFrame(render)
    return ()=> raf && cancelAnimationFrame(raf)
  },[])

  // helpers for drawing
  const drawTile = (ctx, x, y, type)=>{
    // diamond with top at (x,y)
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + TILE_W/2, y + TILE_H/2)
    ctx.lineTo(x, y + TILE_H)
    ctx.lineTo(x - TILE_W/2, y + TILE_H/2)
    ctx.closePath()
    if(type === 'grass') ctx.fillStyle = '#7ec850'
    else if(type === 'soil') ctx.fillStyle = '#b57a39'
    else ctx.fillStyle = '#9ec8b8'
    ctx.fill()
    ctx.strokeStyle = 'rgba(0,0,0,0.08)'
    ctx.stroke()
    ctx.restore()
  }

  const drawBuilding = (ctx, anchorCol, anchorRow, itemId, rotation = 0)=>{
    const spec = buildingSpecs[itemId] || { w:1,h:1, color:'#a00' }
    // compute rotated footprint
    const wR = (rotation % 2) ? spec.h : spec.w
    const hR = (rotation % 2) ? spec.w : spec.h
    const topLeft = gridToScreen(anchorCol, anchorRow)
    const center = gridToScreen(anchorCol + (wR - 1) / 2, anchorRow + (hR - 1) / 2)
    const bottomRight = gridToScreen(anchorCol + (wR - 1), anchorRow + (hR - 1))
    // draw sprite if available, otherwise a simple block
    const img = sprites[itemId]
    if(img && img.complete && img.naturalWidth){
      // use per-spec previewScale/previewCap/verticalOffset so final placed sprites match the ghost preview
      const wUnits = spec.w || 1
      const specScale = spec.previewScale ?? 0.45
      const footprintWidth = TILE_W * wUnits * specScale
      const absoluteCap = spec.previewCap ?? 100
      const targetWidth = Math.max(40, Math.min(footprintWidth, absoluteCap))
      const aspect = img.naturalHeight / img.naturalWidth
      const targetHeight = targetWidth * aspect
      const vOff = spec.verticalOffset || 0
      // draw rotated around center if rotation requested
      const drawX = center.x - targetWidth / 2
      const drawY = bottomRight.y + TILE_H - targetHeight + vOff
      ctx.save()
      ctx.shadowColor = 'rgba(0,0,0,0.35)'
      ctx.shadowBlur = 8
      if(rotation && rotation % 4 !== 0){
        const cx = center.x
        const cy = bottomRight.y + TILE_H - targetHeight/2 + vOff
        ctx.translate(cx, cy)
        ctx.rotate((rotation * Math.PI) / 2)
        ctx.drawImage(img, -targetWidth/2, -targetHeight/2, targetWidth, targetHeight)
      }else{
        ctx.drawImage(img, drawX, drawY, targetWidth, targetHeight)
      }
      ctx.restore()
    }else{
      // fallback block
      ctx.save()
      const bw = TILE_W/2 + (spec.w-1)*(TILE_W/2)
      const bh = TILE_H + (spec.h-1)*(TILE_H/2)
      const bx = center.x - bw/2
      const by = bottomRight.y + TILE_H - bh
      ctx.fillStyle = spec.color
      ctx.shadowColor = 'rgba(0,0,0,0.3)'
      ctx.shadowBlur = 6
      ctx.fillRect(bx, by, bw, bh)
      ctx.restore()
    }
  }

  const itemProgressPercent = (cell) =>{
    if(!cell || !cell.placedItem) return 0
    const it = cell.placedItem
    const plantedAt = it.plantedAt || 0
    const dur = it.growthDuration || 60000
    if(dur <= 0) return 100
    const now = Date.now()
    const elapsed = Math.max(0, now - plantedAt)
    return Math.min(100, Math.round((elapsed / dur) * 100))
  }

  const roundRect = (ctx, x, y, w, h, r) =>{
    const radius = r || 6
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + w - radius, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius)
    ctx.lineTo(x + w, y + h - radius)
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
    ctx.lineTo(x + radius, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
  }

  const drawCrop = (ctx, x, y, cell)=>{
    // cell.placedItem expected with { crop, plantedAt, growthDuration }
    const item = cell.placedItem || {}
    const crop = item.crop || 'seed'
    const plantedAt = item.plantedAt || 0
    const grow = item.growthDuration || 60000
    const now = Date.now()
    const readyAt = plantedAt + grow
    const remainingMs = Math.max(0, readyAt - now)
    const isRipe = remainingMs <= 0

    // animated state per-cell (displayProgress, pulsePhase)
    const stateMap = animStateRef.current
    let st = stateMap.get(cell)
    if(!st){ st = { displayPct: 0, pulsePhase: 0, lastTs: now }; stateMap.set(cell, st) }
    const dt = Math.max(0, (now - st.lastTs) / 1000)
    st.lastTs = now
    const actualPct = itemProgressPercent(cell)
    const factor = Math.min(1, dt * 12)
    st.displayPct = st.displayPct + (actualPct - st.displayPct) * factor
    if(isRipe){ st.pulsePhase += dt * 4 } else { st.pulsePhase *= Math.max(0, 1 - dt * 6) }
    const pulseScale = isRipe ? 1 + Math.sin(st.pulsePhase) * 0.06 : 1

    // center of the tile (top vertex y + TILE_H/2)
    const cx = x
    const cy = y + TILE_H/2
    ctx.save()
    ctx.translate(cx, cy)

    // draw a small plant sprite (simple sprout)
    const leafW = TILE_W / 12
    const leafH = TILE_H / 8
    const topOffset = -TILE_H / 6
    ctx.fillStyle = isRipe ? '#1e9b3a' : '#2e8b57'
    ctx.beginPath()
    ctx.ellipse(0, topOffset, leafW, leafH, 0, 0, Math.PI*2)
    ctx.fill()
    ctx.fillStyle = isRipe ? '#0f5a20' : '#145a2b'
    ctx.fillRect(-3, topOffset, 6, 10)

    // draw floating progress bar + label above the plant
    const barWidth = 140
    const barHeight = 14
    const barX = -barWidth/2
    const barY = topOffset - 26

    // background track (rounded)
    ctx.save()
    roundRect(ctx, barX - 2, barY - 2, barWidth + 4, barHeight + 8, 8)
    ctx.fillStyle = 'rgba(255,255,255,0.95)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(0,0,0,0.15)'
    ctx.lineWidth = 2
    ctx.stroke()

    // inner empty track
    roundRect(ctx, barX, barY, barWidth, barHeight, 6)
    ctx.fillStyle = 'rgba(255,255,255,0.98)'
    ctx.fill()

    // filled progress (use animated displayPct)
    const fillW = Math.max(0, Math.min(barWidth, Math.round((st.displayPct / 100) * barWidth)))
    if(fillW > 0){
      ctx.save()
      // apply subtle pulse when ripe
      ctx.translate(0, barY + barHeight/2)
      ctx.scale(pulseScale, pulseScale)
      ctx.translate(0, -(barY + barHeight/2))
      roundRect(ctx, barX, barY, fillW, barHeight, 6)
      const g = ctx.createLinearGradient(barX, barY, barX + barWidth, barY)
      g.addColorStop(0,'#4ea6ff')
      g.addColorStop(1,'#0b6ed1')
      ctx.fillStyle = g
      ctx.fill()
      ctx.restore()
    }

    // crop label centered on bar
    ctx.fillStyle = '#111'
    ctx.font = 'bold 12px sans-serif'
    ctx.textAlign = 'center'
    const label = (cell.placedItem && cell.placedItem.crop) ? cell.placedItem.crop.toUpperCase() : ''
    ctx.fillText(label, 0, barY + 10)

    // time label below the bar (MM:SS)
    let timeText = ''
    if(isRipe) timeText = 'READY'
    else{
      const secs = Math.ceil(remainingMs / 1000)
      const mm = Math.floor(secs/60)
      const ss = secs % 60
      timeText = `${mm}m ${ss.toString().padStart(2,'0')}s`
    }
    ctx.font = 'bold 14px sans-serif'
    ctx.fillStyle = '#fff'
    ctx.lineWidth = 3
    ctx.strokeStyle = 'rgba(0,0,0,0.6)'
    ctx.strokeText(timeText, 0, barY + barHeight + 22)
    ctx.fillText(timeText, 0, barY + barHeight + 22)

    ctx.restore()
    ctx.restore()
  }

  const drawGhost = (ctx, startCol, startRow, w, h, ok, type, rotation = 0)=>{
    const color = ok ? 'rgba(50,200,50,0.28)' : 'rgba(200,50,50,0.28)'
    // draw highlighted tiles first (under the sprite)
    for (let r = 0; r < h; r++){
      for (let c = 0; c < w; c++){
        const { x, y } = gridToScreen(startCol + c, startRow + r)
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + TILE_W/2, y + TILE_H/2)
        ctx.lineTo(x, y + TILE_H)
        ctx.lineTo(x - TILE_W/2, y + TILE_H/2)
        ctx.closePath()
        ctx.fillStyle = color
        ctx.fill()
        ctx.restore()
      }
    }

    // then draw a semi-transparent preview sprite centered on the anchor (so it looks like the real building)
    if(type){
      const img = sprites[type]
      if(img && img.complete && img.naturalWidth){
        const spec = buildingSpecs[type] || { w: w, h: h }
        const scale = spec.previewScale ?? 0.45
        const footprintWidth = TILE_W * spec.w * scale
        const absoluteCap = spec.previewCap ?? 100
        const targetWidth = Math.max(40, Math.min(footprintWidth, absoluteCap))
        const aspect = img.naturalHeight / img.naturalWidth
        const targetHeight = targetWidth * aspect
        const topLeft = gridToScreen(startCol, startRow)
        const center = gridToScreen(startCol + (w - 1) / 2, startRow + (h - 1) / 2)
        const bottomRight = gridToScreen(startCol + (w - 1), startRow + (h - 1))
        const vOff = spec.verticalOffset || 0
        const drawX = center.x - targetWidth / 2
        const drawY = bottomRight.y + TILE_H - targetHeight + vOff
        ctx.save()
        ctx.globalAlpha = previewAlpha || 0.55
        if(rotation && rotation % 4 !== 0){
          const cx = center.x
          const cy = bottomRight.y + TILE_H - targetHeight/2 + vOff
          ctx.translate(cx, cy)
          ctx.rotate((rotation * Math.PI) / 2)
          ctx.drawImage(img, -targetWidth/2, -targetHeight/2, targetWidth, targetHeight)
        }else{
          ctx.drawImage(img, drawX, drawY, targetWidth, targetHeight)
        }
        ctx.globalAlpha = 1
        ctx.restore()
      }else{
        // fallback: for soil we don't draw a separate block — the tile itself becomes soil
        if(type === 'soil'){
          // no extra sprite or block; tiles under the sprite already indicate placement
        }else{
          const spec = buildingSpecs[type] || { w: w, h: h, color:'#999' }
          const bw = TILE_W/2 + (spec.w-1)*(TILE_W/2)
          const bh = TILE_H + (spec.h-1)*(TILE_H/2)
          const anchorScreen = gridToScreen(startCol, startRow)
          const bottomRight = gridToScreen(startCol + (w - 1), startRow + (h - 1))
          const bx = center.x - bw/2
          const by = bottomRight.y + TILE_H - bh
          ctx.save()
          ctx.globalAlpha = 0.55
          ctx.fillStyle = spec.color
          ctx.fillRect(bx, by, bw, bh)
          ctx.globalAlpha = 1
          ctx.restore()
        }
      }
    }
  }

  // placement logic
  const canPlaceAt = (grid, startCol, startRow, w, h)=>{
    if(startCol < 0 || startRow < 0) return false
    if(startCol + w > MAP_SIZE) return false
    if(startRow + h > MAP_SIZE) return false
    for (let r = 0; r < h; r++){
      for (let c = 0; c < w; c++){
        if(grid[startRow + r][startCol + c].placedItem) return false
      }
    }
    return true
  }


  const placeStructure = (startCol, startRow, type, rotation = 0)=>{
    const spec = buildingSpecs[type]
    if(!spec) return false
    // adjust footprint for rotation
    const wR = (rotation % 2) ? spec.h : spec.w
    const hR = (rotation % 2) ? spec.w : spec.h
    if(!canPlaceAt(grid, startCol, startRow, wR, hR)) return false
    if(type === 'soil'){
      // soil is represented as a tile type rather than a placed object
      setGrid(prev => {
        const ng = prev.map(row => row.map(cell => ({...cell})))
        for (let r = 0; r < hR; r++){
          for (let c = 0; c < wR; c++){
            ng[startRow + r][startCol + c].type = 'soil'
            ng[startRow + r][startCol + c].placedItem = null
            ng[startRow + r][startCol + c].isAnchor = false
          }
        }
        return ng
      })
    }else{
      setGrid(prev => {
        const ng = prev.map(row => row.map(cell => ({...cell})))
        for (let r = 0; r < hR; r++){
          for (let c = 0; c < wR; c++){
            ng[startRow + r][startCol + c].placedItem = { id: type, rot: rotation }
            ng[startRow + r][startCol + c].isAnchor = (r === 0 && c === 0)
          }
        }
        return ng
      })
    }
    if(onConfirmBuilding) onConfirmBuilding(type, spec.cost)
    return true
  }

  // pointer handlers
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

  const getPlaceType = (localPlacing, remotePlacing) => {
    if(localPlacing) return localPlacing
    if(!remotePlacing) return null
    if(typeof remotePlacing === 'string') return remotePlacing
    if(typeof remotePlacing === 'object' && remotePlacing.type) return remotePlacing.type
    return null
  }

  // edit mode state is declared earlier above to avoid TDZ issues

  const handlePointerMove = (e)=>{
    if(!canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const clientX = e.clientX
    const clientY = e.clientY

    // update tracked pointer position for multitouch
    if(pointersRef.current.has(e.pointerId)) pointersRef.current.set(e.pointerId, { x: clientX, y: clientY })
    // handle pinch-to-zoom when active
    if(pinchRef.current && pointersRef.current.size >= 2){
      const it = pointersRef.current.values()
      const a = it.next().value
      const b = it.next().value
      if(a && b){
        const dx = a.x - b.x
        const dy = a.y - b.y
        const dist = Math.hypot(dx, dy)
        const start = pinchRef.current.startDist || 1
        const startScale = pinchRef.current.startScale || (scaleRef.current || 1)
        let newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, startScale * (dist / start)))
        const mx = (a.x + b.x) / 2 - rect.left
        const my = (a.y + b.y) / 2 - rect.top
        const oldScale = scaleRef.current || 1
        const cam = cameraRef.current
        const worldX = (mx - cam.x) / oldScale
        const worldY = (my - cam.y) / oldScale
        cam.x = mx - worldX * newScale
        cam.y = my - worldY * newScale
        clampCamera(cam, rect)
        cameraRef.current = cam
        setCamera({ x: cam.x, y: cam.y })
        setScale(newScale)
        scaleRef.current = newScale
      }
      return
    }

    // if currently panning, update camera and velocity
    const pan = panningRef.current
    if(pan && pan.active && pan.pointerId === e.pointerId){
      const now = performance.now()
      const dx = clientX - pan.lastX
      const dy = clientY - pan.lastY
      const dt = Math.max(1, now - (pan.lastTime || now)) / 1000
      pan.lastX = clientX
      pan.lastY = clientY
      pan.lastTime = now
      // update camera (inverse because we move world opposite to drag)
      const cam = cameraRef.current
      cam.x += dx
      cam.y += dy
      cameraRef.current = cam
      setCamera(s => ({ ...s, x: cam.x, y: cam.y }))
      pan.vx = dx / dt
      pan.vy = dy / dt
      return
    }

    const scl = scaleRef.current || 1
    const x = (clientX - rect.left - camera.x) / scl
    const y = (clientY - rect.top - camera.y) / scl
    // if sickle active, append to path and harvest nearby crops immediately
    if(sickleActiveRef.current){
      const p = { x, y }
      sicklePathRef.current = sicklePathRef.current || []
      sicklePathRef.current.push(p)
      // update state occasionally (keeps UI responsive)
      setSicklePath(sicklePathRef.current.slice(-200))
      // harvest any ripe crops near this point (prevent duplicates using sickleHarvestedRef)
      harvestNearbyAtPoint(x, y)
      return
    }
    // compute fractional grid coords for precise anchoring
    const rawColF = (x / (TILE_W / 2) + y / (TILE_H / 2)) / 2
    const rawRowF = (y / (TILE_H / 2) - x / (TILE_W / 2)) / 2
    const rawCol = Math.floor(rawColF)
    const rawRow = Math.floor(rawRowF)
    const placeType = getPlaceType(placing, placingBuilding)
    if(placeType && buildingSpecs[placeType]){
      const spec = buildingSpecs[placeType]
      // choose top-left anchor so the footprint centers under the cursor
      const anchorCol = clamp(Math.round(rawColF - (spec.w - 1) / 2), 0, MAP_SIZE - spec.w)
      const anchorRow = clamp(Math.round(rawRowF - (spec.h - 1) / 2), 0, MAP_SIZE - spec.h)
      setHover({ col: anchorCol, row: anchorRow, rawCol: rawColF, rawRow: rawRowF })
      return
    }

    if(rawCol >= 0 && rawCol < MAP_SIZE && rawRow >= 0 && rawRow < MAP_SIZE) setHover({ col: rawCol, row: rawRow })
    else setHover(null)
  }

  const handleWheel = (e) =>{
    if(!canvasRef.current) return
    e.preventDefault()
    const rect = canvasRef.current.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const oldScale = scaleRef.current || 1
    const sensitivity = 0.0016
    const factor = Math.pow(1.0 - sensitivity, e.deltaY)
    let newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, oldScale * factor))
    if(newScale === oldScale) return
    // keep mouse world point stable
    const cam = cameraRef.current
    const worldX = (mx - cam.x) / oldScale
    const worldY = (my - cam.y) / oldScale
    cam.x = mx - worldX * newScale
    cam.y = my - worldY * newScale
    const rect2 = canvasRef.current.getBoundingClientRect()
    clampCamera(cam, rect2)
    cameraRef.current = cam
    setCamera({ x: cam.x, y: cam.y })
    setScale(newScale)
    scaleRef.current = newScale
  }

  const handleClick = (e)=>{
    // if sickle is active or mode is on, ignore normal clicks
    if(sickleModeRef.current || sickleActiveRef.current) return
    if(!canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const scl = scaleRef.current || 1
    const x = (e.clientX - rect.left - camera.x) / scl
    const y = (e.clientY - rect.top - camera.y) / scl
    const { col, row } = screenToGrid(x, y)
    if(col < 0 || col >= MAP_SIZE || row < 0 || row >= MAP_SIZE) return

    // double-tap to center this tile
    try{
      const now = Date.now()
      const last = lastTapRef.current || { t:0, col:-1, row:-1 }
      if(last.col === col && last.row === row && (now - last.t) < 350){
        // double-tap: reset view (zoom out to default camera & scale)
        cameraTweenRef.current = {
          active: true,
          start: performance.now(),
          duration: 420,
          from: { x: cameraRef.current.x, y: cameraRef.current.y, scale: scaleRef.current || 1 },
          to: { x: defaultCameraRef.current.x, y: defaultCameraRef.current.y, scale: DEFAULT_SCALE }
        }
        lastTapRef.current = { t: 0, col: -1, row: -1 }
        return
      }
      lastTapRef.current = { t: now, col, row }
    }catch(e){ }

    const type = getPlaceType(placing, placingBuilding)
    if(type){
      // If edit mode is already visible for this anchor, ignore canvas clicks (finalize via EditMode preview)
      if(editMode && editMode.visible){
        return
      }

      // first tap: show edit UI anchored to the chosen tile instead of placing immediately
      const anchorCol = (hover && typeof hover.col === 'number') ? hover.col : col
      const anchorRow = (hover && typeof hover.row === 'number') ? hover.row : row
      const spec = buildingSpecs[type]
      const wR = (0 % 2) ? spec.h : spec.w
      const hR = (0 % 2) ? spec.w : spec.h
      const topLeft = gridToScreen(anchorCol, anchorRow)
      const center = gridToScreen(anchorCol + (wR - 1) / 2, anchorRow + (hR - 1) / 2)
      const canvasRect = canvasRef.current.getBoundingClientRect()
      const s = scaleRef.current || 1
      const screenX = canvasRect.left + camera.x + center.x * s
      const screenY = canvasRect.top + camera.y + center.y * s
      setEditMode({ visible: true, col: anchorCol, row: anchorRow, screenX, screenY, rotation: 0 })
      return
    }

    // otherwise, simple interaction: harvest/plant if seeds available
    const cell = grid[row][col]

    // if there's a crop object here, handle harvest/sickle reveal first
    if(cell && cell.placedItem && (typeof cell.placedItem === 'object' && cell.placedItem.crop)){
      // reveal sickle when ripe (user must tap ripe crop to reveal tool)
      const crop = cell.placedItem
      const readyAt = (crop.plantedAt || 0) + (crop.growthDuration || 0)
      const now = Date.now()
      if(now >= readyAt){
        // reveal sickle anchored to this tile's world position
        const scr = gridToScreen(col, row)
        // store origin in sickleModeRef for pointer-start checks (world coords)
        sickleModeRef.current = true
        sickleModeRef.currentOrigin = { col, row, x: scr.x, y: scr.y }
        setSickleMode(true)
        setSicklePath([])
        sicklePathRef.current = []
        showToast && showToast('Sickle ready — swipe to harvest')
      }else{
        const remaining = Math.max(0, Math.ceil((readyAt - now)/1000))
        showToast && showToast(`Not ready (${remaining}s)`)
      }
      return
    }

    if(cell && cell.type === 'soil'){
      // If we're currently moving a soil source, place it here
      if(movingSoil){
        // only place on empty (non-soil) tiles
        if(grid[row][col].type === 'grass' && !grid[row][col].placedItem){
          setGrid(prev=>{
            const ng = prev.map(r=>r.map(c=>({...c})))
            ng[row][col].type = 'soil'
            return ng
          })
          // clear original source
          setGrid(prev=>{
            const ng = prev.map(r=>r.map(c=>({...c})))
            ng[movingSoil.srcRow][movingSoil.srcCol].type = 'grass'
            return ng
          })
          setMovingSoil(null)
          setPlacing && setPlacing(null)
          showToast && showToast('Soil moved')
        }else{
          showToast && showToast('Cannot move soil here')
        }
        return
      }

      // handle single vs double tap on soil: show seed picker on first tap, actions on rapid second tap
      const now = Date.now()
      if(lastSoilTap.current.col === col && lastSoilTap.current.row === row && (now - lastSoilTap.current.time) < 420){
        // double-tap: show soil actions popup
        const scr = gridToScreen(col, row)
        const canvasRect = canvasRef.current.getBoundingClientRect()
        const s = scaleRef.current || 1
        setSoilActions({ visible: true, col, row, x: canvasRect.left + camera.x + scr.x * s, y: canvasRect.top + camera.y + scr.y * s })
        // clear last tap
        lastSoilTap.current = { time: 0, col: -1, row: -1 }
        return
      }

      // single tap: show seed picker at tile
      const scr = gridToScreen(col, row)
      const canvasRect = canvasRef.current.getBoundingClientRect()
      const s2 = scaleRef.current || 1
      setSeedPicker({ visible: true, col, row, x: canvasRect.left + camera.x + scr.x * s2, y: canvasRect.top + camera.y + scr.y * s2 })
      lastSoilTap.current = { time: now, col, row }
      return
    }

    // not soil, not crop — guide the player
    if(!cell || !cell.placedItem) showToast && showToast('Place soil here first')
    else showToast && showToast('Cannot plant here')
  }

  // Harvest helper used by HUD and clicks
  const harvestAt = (row, col) =>{
    const cell = grid[row] && grid[row][col]
    if(!cell || !cell.placedItem) { showToast && showToast('Nothing to harvest'); return false }
    const cropObj = cell.placedItem
    if(!cropObj || !cropObj.crop) { showToast && showToast('Nothing to harvest'); return false }
    const readyAt = (cropObj.plantedAt || 0) + (cropObj.growthDuration || 0)
    const nowCheck = (timeNowRef.current || Date.now())
    if(nowCheck < readyAt){
      const remaining = Math.max(0, Math.ceil((readyAt - nowCheck)/1000))
      showToast && showToast(`Not ready (${remaining}s)`)
      return false
    }
    // harvest
    setGrid(prev=>{
      const ng = prev.map(r=>r.map(c=>({...c})))
      ng[row][col].placedItem = null
      ng[row][col].isAnchor = false
      return ng
    })
    setCoins && setCoins(c=>c+5)
    addXP && addXP(5)
    showToast && showToast(`Harvested ${cropObj.crop}`)
    return true
  }

  // Camera clamping: ensure world bounds cover viewport (prevent empty edges)
  const clampCamera = (cam, rect) =>{
    if(!rect) return
    // world extents based on grid corners (account for current scale)
    const s = scaleRef.current || 1
    const minWorldX = gridToScreen(0, MAP_SIZE-1).x - OVERSCROLL_ALLOWANCE
    const maxWorldX = gridToScreen(MAP_SIZE-1, 0).x + OVERSCROLL_ALLOWANCE
    const minWorldY = gridToScreen(0,0).y - OVERSCROLL_ALLOWANCE
    const maxWorldY = gridToScreen(MAP_SIZE-1, MAP_SIZE-1).y + TILE_H + OVERSCROLL_ALLOWANCE
    const minCamX = -minWorldX * s
    const maxCamX = rect.width - maxWorldX * s
    const minCamY = -minWorldY * s
    const maxCamY = rect.height - maxWorldY * s
    cam.x = Math.max(minCamX, Math.min(maxCamX, cam.x))
    cam.y = Math.max(minCamY, Math.min(maxCamY, cam.y))
  }

  // harvest any ripe crops near a world point (x,y). Uses a small neighborhood and
  // a per-swipe set to avoid repeating the same tile multiple times while holding.
  const harvestNearbyAtPoint = (x, y) =>{
    const threshold = 36
    const g = gridRef.current
    // map point to nearest grid cell and search small neighborhood
    const { col: baseCol, row: baseRow } = screenToGrid(x, y)
    for(let rr = baseRow - 1; rr <= baseRow + 1; rr++){
      for(let cc = baseCol - 1; cc <= baseCol + 1; cc++){
        if(rr < 0 || cc < 0 || rr >= MAP_SIZE || cc >= MAP_SIZE) continue
        const center = gridToScreen(cc, rr)
        const dx = center.x - x
        const dy = center.y - y
        if(Math.hypot(dx, dy) <= threshold){
          const key = `${rr},${cc}`
          if(sickleHarvestedRef.current.has(key)) continue
          const cell = g[rr] && g[rr][cc]
          if(cell && cell.placedItem && cell.placedItem.crop){
            const crop = cell.placedItem
            const readyAt = (crop.plantedAt || 0) + (crop.growthDuration || 0)
            const now = Date.now()
            if(now >= readyAt){
              const ok = harvestAt(rr, cc)
              if(ok){
                sickleHarvestedRef.current.add(key)
              }
            }
          }
        }
      }
    }
  }

  // animate camera to a target (smooth easing)
  const animateCameraTo = (tx, ty, duration = 420) =>{
    if(!canvasRef.current) return
    if(cameraTweenRef.current && cameraTweenRef.current.cancel) cameraTweenRef.current.cancel()
    const start = { x: cameraRef.current.x, y: cameraRef.current.y }
    const startTs = performance.now()
    let rafId = null
    const step = (nowTs) =>{
      const t = Math.min(1, (nowTs - startTs) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      cameraRef.current.x = start.x + (tx - start.x) * eased
      cameraRef.current.y = start.y + (ty - start.y) * eased
      const rect = canvasRef.current.getBoundingClientRect()
      clampCamera(cameraRef.current, rect)
      setCamera(s => ({ ...s, x: cameraRef.current.x, y: cameraRef.current.y }))
      if(t < 1) rafId = requestAnimationFrame(step)
      else cameraTweenRef.current = null
    }
    cameraTweenRef.current = { cancel: ()=> rafId && cancelAnimationFrame(rafId) }
    rafId = requestAnimationFrame(step)
  }

  // seed picker handlers
  const onSeedPick = (seedKey) =>{
    const row = seedPicker.row
    const col = seedPicker.col
    if(!seedKey) return
    if(!seeds || !seeds[seedKey] || seeds[seedKey] <= 0){ showToast && showToast('No seeds') ; setSeedPicker({ ...seedPicker, visible:false }); return }
    const grow = (seedSpecs[seedKey] && seedSpecs[seedKey].grow) || (60*1000)
    setGrid(prev=>{
      const ng = prev.map(r=>r.map(c=>({...c})))
      ng[row][col].placedItem = { crop: seedKey, stage: 0, plantedAt: Date.now(), growthDuration: grow }
      ng[row][col].isAnchor = true
      return ng
    })
    setSeeds && setSeeds(s => ({ ...s, [seedKey]: s[seedKey]-1 }))
    showToast && showToast(`${seedKey} planted`)
    setSeedPicker({ ...seedPicker, visible:false })
  }

  const onSeedPickerClose = ()=> setSeedPicker({ ...seedPicker, visible:false })

  // soil actions handlers
  const onSoilMove = ()=>{
    setSoilActions({ ...soilActions, visible:false })
    // pick soil up from source
    setMovingSoil({ srcCol: soilActions.col, srcRow: soilActions.row })
    // mark placing preview locally so ghost shows
    setPlacing('soil')
    showToast && showToast('Tap destination to place soil')
  }

  const onSoilStore = ()=>{
    // remove soil tile and close popup
    setGrid(prev=>{
      const ng = prev.map(r=>r.map(c=>({...c})))
      ng[soilActions.row][soilActions.col].type = 'grass'
      ng[soilActions.row][soilActions.col].placedItem = null
      ng[soilActions.row][soilActions.col].isAnchor = false
      return ng
    })
    setSoilActions({ ...soilActions, visible:false })
    showToast && showToast('Soil stored')
  }

  const onSoilActionsClose = ()=> setSoilActions({ ...soilActions, visible:false })

  // EditMode callbacks
  const onEditRotate = (nextRotation) => {
    setEditMode(em => ({ ...em, rotation: nextRotation }))
  }

  const onEditStore = ()=>{
    // ask the app to open shop
    window.dispatchEvent(new CustomEvent('grow:openShop'))
  }

  const onEditCancel = ()=>{
    // refund if it was a reserved purchase
    if(placingBuilding && typeof placingBuilding === 'object' && placingBuilding.reserved){
      setCoins && setCoins(c => c + (placingBuilding.cost || 0))
    }
    setPlacingBuilding && setPlacingBuilding(null)
    setEditMode({ visible:false, col:0, row:0, screenX:0, screenY:0, rotation:0 })
    window.dispatchEvent(new Event('grow:cancelPlacement'))
  }

  const onEditRequestPlace = ()=>{
    if(!editMode.visible) return
    const type = getPlaceType(placing, placingBuilding)
    if(!type) return
    const ok = placeStructure(editMode.col, editMode.row, type, editMode.rotation)
    if(ok){
      setPlacing && setPlacing(null)
      setPlacingBuilding && setPlacingBuilding(null)
      setEditMode({ visible:false, col:0, row:0, screenX:0, screenY:0, rotation:0 })
      showToast && showToast(`${type} placed`)
    }else{
      showToast && showToast('Cannot place here')
    }
  }

  // sickle pointer handlers for swipe harvesting
  const handlePointerDown = (e) =>{
    // track pointer for pinch gestures
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if(pointersRef.current.size === 2){
      const it = pointersRef.current.values()
      const a = it.next().value
      const b = it.next().value
      const dx = a.x - b.x
      const dy = a.y - b.y
      pinchRef.current = { startDist: Math.hypot(dx,dy), startScale: scaleRef.current || 1 }
      // capture both pointers if possible
      try{ e.currentTarget.setPointerCapture && e.currentTarget.setPointerCapture(e.pointerId) }catch(_){ }
      return
    }

    // If sickle was revealed, prefer starting a sickle swipe when touching near origin;
    // otherwise allow panning to begin immediately (single-tap + drag).
    if(sickleModeRef.current){
      if(canvasRef.current){
        const rect = canvasRef.current.getBoundingClientRect()
        const scl = scaleRef.current || 1
        const x = (e.clientX - rect.left - camera.x) / scl
        const y = (e.clientY - rect.top - camera.y) / scl
        const origin = sickleModeRef.currentOrigin
        if(origin){
          const dx = x - origin.x
          const dy = y - origin.y
          if(Math.hypot(dx,dy) <= 112){
            setSickleActive(true)
            // reset per-swipe harvested set
            sickleHarvestedRef.current = new Set()
            const pts = [{ x, y }]
            setSicklePath(pts)
            sicklePathRef.current = pts
            // harvest immediate at initial touch
            harvestNearbyAtPoint(x, y)
            try{ e.currentTarget.setPointerCapture && e.currentTarget.setPointerCapture(e.pointerId) }catch(_){ }
            return
          }
        }
      }
      
      // fall through to panning (allow user to drag view normally)
    }

    // otherwise begin panning if not interacting (no placing, no edit UI, no seed/soil popups)
    if(placing || placingBuilding || editMode.visible || seedPicker.visible || soilActions.visible) return
    panningRef.current = { active: true, pointerId: e.pointerId, lastX: e.clientX, lastY: e.clientY, lastTime: performance.now(), vx: 0, vy: 0 }
    try{ e.currentTarget.setPointerCapture && e.currentTarget.setPointerCapture(e.pointerId) }catch(_){ }
  }

  const handleDoubleClick = (e) =>{
    // double-tap/double-click: reset view to runtime default scale and camera
    if(!canvasRef.current) return
    // create a combined camera+scale tween so render loop animates both
    cameraTweenRef.current = {
      active: true,
      start: performance.now(),
      duration: 420,
      from: { x: cameraRef.current.x, y: cameraRef.current.y, scale: scaleRef.current || 1 },
      to: { x: defaultCameraRef.current.x, y: defaultCameraRef.current.y, scale: DEFAULT_SCALE }
    }
  }

  const handlePointerUp = (e) =>{
    // remove tracked pointer
    pointersRef.current.delete(e.pointerId)
    if(pinchRef.current && pointersRef.current.size < 2) pinchRef.current = null

    // finish panning if active
    const pan = panningRef.current
    if(pan && pan.active && pan.pointerId === e.pointerId){
      // stop panning immediately; no inertia
      momentumRef.current.x = 0
      momentumRef.current.y = 0
      pan.active = false
      panningRef.current = pan
      try{ e.currentTarget.releasePointerCapture && e.currentTarget.releasePointerCapture(e.pointerId) }catch(_){ }
      return
    }

    if(!sickleActiveRef.current) return
    const path = (sicklePathRef.current || []).slice()
    if(path.length < 2){ setSickleActive(false); setSicklePath([]); sicklePathRef.current = []; return }
    const g = gridRef.current
    const now = Date.now()
    const threshold = 36
    const touched = []
    for (let r = 0; r < MAP_SIZE; r++){
      for (let c = 0; c < MAP_SIZE; c++){
        const center = gridToScreen(c, r)
        for (const p of path){
          const dx = center.x - p.x
          const dy = center.y - p.y
          if(Math.hypot(dx, dy) <= threshold){ touched.push([r,c]); break }
        }
      }
    }
    // unique and harvest ripe
    const seen = new Set()
    let harvested = 0
    for (const [r,c] of touched){
      const key = `${r},${c}`
      if(seen.has(key)) continue
      seen.add(key)
      const cell = g[r] && g[r][c]
      if(cell && cell.placedItem && cell.placedItem.crop){
        const crop = cell.placedItem
        const readyAt = (crop.plantedAt || 0) + (crop.growthDuration || 0)
        if(now >= readyAt){
          const ok = harvestAt(r, c)
          if(ok) harvested++
        }
      }
    }
    if(harvested > 0) showToast && showToast(`Harvested ${harvested} crop${harvested>1 ? 's' : ''}`)

    // play sickle swipe animation along path
    sickleAnimRef.current = { active: true, points: path.slice(), start: Date.now(), duration: Math.min(800, path.length * 8 + 200) }

    setSickleActive(false)
    setSicklePath([])
    sicklePathRef.current = []
    // exit sickle mode after use and clear origin
    setSickleMode(false)
    sickleModeRef.current = false
    sickleModeRef.currentOrigin = null
  }

  // render canvas full-size (fills viewport)
  return (
    <div style={{position:'fixed', inset:0, width: '100%', height: '100%', overflow: 'hidden'}}>
      <canvas ref={canvasRef} style={{width:'100%',height:'100%',display:'block',background:'#cfe7ff'}} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerMove={handlePointerMove} onPointerLeave={handlePointerUp} onClick={handleClick} onDoubleClick={handleDoubleClick} onWheel={handleWheel} />
      <EditMode
        visible={editMode.visible}
        x={editMode.screenX}
        y={editMode.screenY}
        type={getPlaceType(placing, placingBuilding)}
        sprite={ sprites[getPlaceType(placing, placingBuilding)] }
        initialRotation={editMode.rotation}
        onRotate={onEditRotate}
        onStore={onEditStore}
        onCancel={onEditCancel}
        onRequestPlace={onEditRequestPlace}
      />
      {seedPicker.visible && (
        <SeedPicker
          x={seedPicker.x}
          y={seedPicker.y}
          seeds={seeds}
          onPick={onSeedPick}
          onClose={onSeedPickerClose}
        />
      )}
      {soilActions.visible && (
        <SoilActions
          x={soilActions.x}
          y={soilActions.y}
          onMove={onSoilMove}
          onStore={onSoilStore}
          onClose={onSoilActionsClose}
        />
      )}
    </div>
  )
}
