import React from 'react'

export default function SeedPicker({ x=0, y=0, seeds={}, onPick, onClose }){
  const style = {
    position: 'absolute',
    left: x + 8,
    top: y + 8,
    background: 'rgba(255,255,255,0.95)',
    border: '1px solid rgba(0,0,0,0.08)',
    padding: 8,
    borderRadius: 6,
    boxShadow: '0 6px 18px rgba(0,0,0,0.12)'
  }
  return (
    <div style={style}>
      <div style={{fontSize:12, marginBottom:6}}>Seeds</div>
      <div style={{display:'flex',gap:8}}>
        {Object.keys(seeds || {}).map(k=> (
          <button key={k} onClick={()=>onPick(k)} style={{padding:'6px 8px'}}>{k} ({seeds[k]})</button>
        ))}
        {Object.keys(seeds || {}).length === 0 && <div style={{color:'#666'}}>No seeds</div>}
      </div>
      <div style={{textAlign:'right', marginTop:6}}>
        <button onClick={onClose} style={{padding:'4px 6px'}}>Close</button>
      </div>
    </div>
  )
}
