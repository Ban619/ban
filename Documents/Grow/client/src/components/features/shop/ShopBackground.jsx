import React from 'react'

export default function ShopBackground({children}){
  // Decorative frame elements (left/right) provide the clipboard-like edges.
  // Visuals are implemented in CSS so no images are needed.
  return (
    <div className="shop-bg">
      {children}
    </div>
  )
}
