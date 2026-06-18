import React, { useEffect, useState } from 'react'

// EditMode component
// Props:
// - visible: boolean
// - x, y: screen coordinates to anchor the UI
// - type: string (item type being placed)
// - sprite: Image or src string to preview the item
// - initialRotation: 0..3
// - onRotate(rotation): called when rotate button pressed
// - onStore(): open store (optional)
// - onCancel(): cancel placement
// - onRequestPlace(): called when user taps the preview to finalize placement
export default function EditMode({ visible = false, x = 0, y = 0, type = '', sprite = null, initialRotation = 0, onRotate = ()=>{}, onStore = ()=>{}, onCancel = ()=>{}, onRequestPlace = ()=>{} }){
  const [rot, setRot] = useState(initialRotation || 0)

  useEffect(()=>{
    setRot(initialRotation || 0)
  },[initialRotation, visible])

  useEffect(()=>{
    if(!visible) return
    const onKey = (e) => {
      if(e.key === 'r' || e.key === 'R') handleRotate()
      if(e.key === 'Escape' || e.key === 'Esc') handleCancel()
    }
    window.addEventListener('keydown', onKey)
    return ()=> window.removeEventListener('keydown', onKey)
  },[visible, rot])

  const handleRotate = ()=>{
    const next = (rot + 1) % 4
    setRot(next)
    try{ onRotate(next) }catch(e){}
  }

  const handleStore = ()=>{
    try{ onStore() }catch(e){}
  }

  const handleCancel = ()=>{
    try{ onCancel() }catch(e){}
  }

  const handlePreviewClick = ()=>{
    try{ onRequestPlace() }catch(e){}
  }

  if(!visible) return null

  const containerStyle = {
    position: 'absolute',
    left: x,
    top: y,
    transform: 'translate(-50%, -110%)',
    zIndex: 2000,
    pointerEvents: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: 12
  }

  const previewStyle = {
    width: 88,
    height: 88,
    borderRadius: 10,
    background: 'rgba(255,255,255,0.95)',
    boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  }

  const btnStyle = {
    width: 52,
    height: 52,
    borderRadius: 28,
    background: 'linear-gradient(#fff,#eee)',
    boxShadow: '0 6px 14px rgba(0,0,0,0.18)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  }

  return (
    <div style={containerStyle} aria-hidden={!visible}>
      <div style={previewStyle} title={`Tap to place ${type}`} onClick={handlePreviewClick}>
        {sprite ? (
          typeof sprite === 'string' ? (
            <img src={sprite} alt={type} style={{maxWidth:'86%', maxHeight:'86%', transform:`rotate(${rot * 90}deg)`}} />
          ) : (
            <img src={sprite.src || ''} alt={type} style={{maxWidth:'86%', maxHeight:'86%', transform:`rotate(${rot * 90}deg)`}} />
          )
        ) : (
          <div style={{width:44,height:44,background:'#ddd',borderRadius:6}} />
        )}
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        <div style={btnStyle} title="Store" onClick={handleStore} aria-label="Store">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7h18" stroke="#333" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 7l-1 12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2L3 7" stroke="#333" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 3v4" stroke="#333" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 3v4" stroke="#333" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>

        <div style={btnStyle} title="Rotate" onClick={handleRotate} aria-label="Rotate">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 12a9 9 0 1 0-3.1 6.4" stroke="#333" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 3v6h-6" stroke="#333" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>

        <div style={{...btnStyle, background:'linear-gradient(#ffecec,#ffdede)'}} title="Cancel" onClick={handleCancel} aria-label="Cancel">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18" stroke="#a33" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 6l12 12" stroke="#a33" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      </div>
    </div>
  )
}
