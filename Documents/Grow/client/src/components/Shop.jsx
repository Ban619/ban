import React, { useState } from 'react'
// items to show in the stored decorations view — includes buildings and seeds
const defaultItems = [
  { id: 'barn', name: 'Barn', cost: 50, category: 'Building', defaultCount: 2 },
  { id: 'silo', name: 'Silo', cost: 120, category: 'Building', defaultCount: 1 },
  { id: 'soil', name: 'Soil', cost: 5, category: 'Building', defaultCount: 28 },
  { id: 'wheat', name: 'Wheat Seed', cost: 10, category: 'Seeds', defaultCount: 13 },
  { id: 'cabbage', name: 'Cabbage Seed', cost: 8, category: 'Seeds', defaultCount: 6 },
  { id: 'onion', name: 'Onion Seed', cost: 6, category: 'Seeds', defaultCount: 5 },
  { id: 'decor_a', name: 'Decor A', cost: 20, category: 'Decor', defaultCount: 3 },
  { id: 'decor_b', name: 'Decor B', cost: 18, category: 'Decor', defaultCount: 7 },
  { id: 'decor_c', name: 'Decor C', cost: 30, category: 'Decor', defaultCount: 9 }
]

export default function Shop(props){
  // support both `visible` and legacy `open` prop
  const open = props.visible || props.open
  const onClose = props.onClose || (()=>{})
  const onBuy = props.onBuy || (()=>{})
  const coins = typeof props.coins === 'number' ? props.coins : undefined
  const inventory = props.inventory || {}
  if(!open) return null

  const [activeCat, setActiveCat] = useState('All')

  const mapCategory = (label) => {
    if (label === 'Crops') return 'Seeds'
    if (label === 'Decors') return 'Decor'
    if (label === 'Builds') return 'Building'
    return null
  }

  const itemsToShow = defaultItems.filter(it => {
    if (activeCat === 'All') return true
    const mapped = mapCategory(activeCat)
    return mapped ? it.category === mapped : true
  })

  const handleBuy = (item) => {
    // item shape expected by App.handleShopBuy: { id, name, cost, category }
    const payload = { id: item.id, name: item.name, cost: item.cost || 0, category: item.category || 'Decoration' }
    onBuy && onBuy(payload)
  }

  return (
    <div className="shop-overlay" role="dialog" aria-modal>
      <div className="shop-wrapper">
        <div className="shop-categories-side" role="tablist" aria-label="Shop categories">
          <button
            className={`shop-cat ${activeCat === 'Crops' ? 'active' : ''}`}
            role="tab"
            aria-selected={activeCat === 'Crops'}
            aria-label="Crops"
            title="Crops"
            onClick={() => setActiveCat('Crops')}
          >
            <span className="shop-cat-icon" aria-hidden>🌾</span>
          </button>
          <button
            className={`shop-cat ${activeCat === 'Decors' ? 'active' : ''}`}
            role="tab"
            aria-selected={activeCat === 'Decors'}
            aria-label="Decors"
            title="Decors"
            onClick={() => setActiveCat('Decors')}
          >
            <span className="shop-cat-icon" aria-hidden>🏵️</span>
          </button>
          <button
            className={`shop-cat ${activeCat === 'Builds' ? 'active' : ''}`}
            role="tab"
            aria-selected={activeCat === 'Builds'}
            aria-label="Builds"
            title="Builds"
            onClick={() => setActiveCat('Builds')}
          >
            <span className="shop-cat-icon" aria-hidden>🏠</span>
          </button>
        </div>
        <div className="shop-panel">
        <div className="shop-header">
          <button className="shop-search">🔍</button>
          <div className="shop-title">Stored Decorations</div>
          <button className="shop-close" onClick={onClose}>✕</button>
        </div>

        

        <div className="shop-grid">
          {itemsToShow.map(it=> {
            const stored = inventory[it.id] ?? it.defaultCount
            const imgSrc = `/assets/${it.id}.svg`
            return (
              <div className="shop-card" key={it.id} onClick={()=>handleBuy(it)} style={{cursor: onBuy ? 'pointer' : 'default'}}>
                <div className="card-icon">
                  <img src={imgSrc} alt={it.name} className="shop-thumb" onError={(e)=>{ e.currentTarget.style.display='none' }} />
                  <div className="card-arrow">▸</div>
                </div>
                <div className="card-count">Stored: <span className="count-num">{stored}</span></div>
              </div>
            )
          })}
        </div>

        <div className="shop-bottom-spacer" />
      </div>
      </div>
    </div>
  )
}
