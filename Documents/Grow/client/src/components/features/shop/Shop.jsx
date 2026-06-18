import React from 'react'
import './shop.css'
import ShopBackground from './ShopBackground'
import ShopItem from './ShopItem'


const DEFAULT_ITEMS = [
  {id: 'wheat', name: 'Wheat', cost: 10, category: 'Seeds'},
  {id: 'corn', name: 'Corn', cost: 20, category: 'Seeds'},
  {id: 'berry', name: 'Berry', cost: 15, category: 'Seeds'},
  {id: 'pumpkin', name: 'Pumpkin', cost: 50, category: 'Seeds'},
  {id: 'barn', name: 'Barn', cost: 50, category: 'Buildings'},
  {id: 'silo', name: 'Silo', cost: 120, category: 'Buildings'},
  {id: 'soil', name: 'Soil', cost: 5, category: 'Buildings'}
]
// abri sirado 
export default function Shop({open = false, onClose = ()=>{}, onBuy = ()=>{}, coins = 0, inventory = {}}) {
  if (!open) return null

  return (
    <div className="shop-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="shop-card" aria-label="Shop" onClick={(e)=>e.stopPropagation()}>
        <button className="shop-close" onClick={onClose}>Close</button>
        <ShopBackground>
          <div className="shop-content">
            <h3 className="shop-title">Shop</h3>

            <div className="shop-categories">
              <button className="cat active">Wheat</button>
              <button className="cat">Corn</button>
              <button className="cat">Berry</button>
              <button className="cat">Pumpkin</button>
            </div>

            <div className="shop-items">
              {DEFAULT_ITEMS.map(item => (
                <ShopItem
                  key={item.id}
                  item={item}
                  coins={coins}
                  owned={inventory[item.id] || 0}
                  onBuy={() => onBuy(item)}
                />
              ))}
            </div>
          </div>
        </ShopBackground>
      </div>
    </div>
  )
}
