import React, { useEffect, useState } from 'react'

export default function Settings({ open, onClose, values = {}, onChange }){
  const [master, setMaster] = useState(values.master || 80)
  const [music, setMusic] = useState(values.music || 70)
  const [effects, setEffects] = useState(values.effects || 85)

  useEffect(()=>{ if(open){ setMaster(values.master||80); setMusic(values.music||70); setEffects(values.effects||85) } },[open])

  const apply = ()=>{
    onChange && onChange({ master, music, effects })
    onClose && onClose()
  }

  if(!open) return null
  return (
    <div className="settings-backdrop" onMouseDown={(e)=>{ if(e.target === e.currentTarget) onClose && onClose() }}>
      <div className="settings-panel settings-iso" onMouseDown={(e)=> e.stopPropagation()}>
        <div className="settings-header">
          <strong>Settings</strong>
          <button className="close-btn" onClick={()=> onClose && onClose()}>×</button>
        </div>
        <div className="settings-body">
          <div className="settings-grid">
            <button className="big-btn">Music<br/><span className="small">{music > 0 ? 'ON' : 'OFF'}</span></button>
            <button className="big-btn">Sounds<br/><span className="small">{effects > 0 ? 'ON' : 'OFF'}</span></button>
            <button className="big-btn">Language<br/><span className="small">English</span></button>
            <button className="big-btn">Credits</button>
            <button className="big-btn">Change Farm Name</button>
            <button className="big-btn">Advanced Settings</button>
          </div>

          <div style={{marginTop:12}}>
            <button className="btn-logout" onClick={()=>{ if(confirm('Switch account / logout?')) window.location.reload() }}>Switch / Logout</button>
          </div>

        </div>
        <div className="settings-footer">
          <button className="btn-apply" onClick={apply}>Apply</button>
        </div>
      </div>
    </div>
  )
}
