import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import GameCanvas from './components/GameCanvas'
import Shop from './components/Shop'
import Experience from './components/features/experience/lvl'
import Chat from './components/features/chat/Chat'
import Inbox from './components/features/inbox/Inbox'
import Settings from './components/features/settings/Settings'

export default function App(){
  const [coins, setCoins] = useState(1000)
  const [diamonds, setDiamonds] = useState(0)
  const [diamondAlerts, setDiamondAlerts] = useState(3)
  const [chatOpen, setChatOpen] = useState(false)
  const [inboxOpen, setInboxOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [inboxMessages, setInboxMessages] = useState([
    { id: 1, title: 'Update 1.02', body: 'New balance UI and bug fixes', read:false },
    { id: 2, title: 'Welcome', body: 'Thanks for playing!', read:false }
  ])
  const [level, setLevel] = useState(1)
  const [xp, setXp] = useState(0)
  const [player, setPlayer] = useState('player1')
  const [seeds, setSeeds] = useState({ wheat: 0, corn: 0, berry: 0, pumpkin: 0 })
  const [farm, setFarm] = useState(null)
  const [selectedSeed, setSelectedSeed] = useState('wheat')
  const [placingBuilding, setPlacingBuilding] = useState(null)
  const [showShop, setShowShop] = useState(false)
  const [purchaseMode, setPurchaseMode] = useState('reserve') // 'reserve' or 'confirm'

  useEffect(()=>{
    // attempt server load first, fallback to local
    let mounted = true
    ;(async ()=>{
      try{
        const r = await axios.get('/api/load',{ params:{ player } })
        if(!mounted) return
        if(r.data && r.data.state){
          const stRaw = r.data.state
          const st = migrateLoadedState(stRaw)
          setCoins(st.coins||1000)
          setLevel(st.level||1)
          setXp(st.xp||0)
          setSeeds(st.seeds||{wheat:0,corn:0})
          if(st.farm) window.dispatchEvent(new CustomEvent('grow:load', { detail: st }))
          return
        }
      }catch(e){ /* server load failed; fallback to local */ }

      // local fallback
      const s = localStorage.getItem('grow:state')
      if(s){
        try{
          const stRaw = JSON.parse(s)
          const st = migrateLoadedState(stRaw)
          setCoins(st.coins||1000)
          setLevel(st.level||1)
          setXp(st.xp||0)
          setSeeds(st.seeds||{wheat:0,corn:0})
          if(st.farm) window.dispatchEvent(new CustomEvent('grow:load',{detail:st}))
        }catch(e){console.warn('local load failed', e)}
      }
    })()
    return ()=> mounted = false
  },[])

  // migrate legacy saved farm state to new structured format
  function migrateLoadedState(raw){
    if(!raw) return raw
    const st = Object.assign({}, raw)
    if(st.farm && Array.isArray(st.farm)){
      const newFarm = st.farm.map(row => row.map(cell => {
        const nc = Object.assign({}, cell)
        const p = nc.placedItem
        // migrate legacy building string 'id@rot' to object {id,rot}
        if(typeof p === 'string'){
          if(p.includes('@')){
            const parts = p.split('@')
            nc.placedItem = { id: parts[0], rot: parseInt(parts[1],10) || 0 }
          }else if(p.startsWith('crop:')){
            const crop = p.split(':')[1]
            nc.placedItem = { crop, stage: 0 }
          }else{
            // keep other strings as-is
            nc.placedItem = p
          }
        }
        // already object -> ensure crop objects have stage
        if(typeof p === 'object' && p){
          if(p.crop && typeof p.stage === 'undefined') p.stage = 0
        }
        return nc
      }))
      st.farm = newFarm
    }
    return st
  }

  const buySoundRef = useRef(null)
  useEffect(()=>{
    try{
      buySoundRef.current = new Audio('/sfx/buy.mp3')
      buySoundRef.current.volume = 0.75
    }catch(e){ buySoundRef.current = null }
  },[])
    // level-up SFX
    const expSoundRef = useRef(null)
    const prevLevelRef = useRef(level)
    useEffect(()=>{
      try{
        expSoundRef.current = new Audio('/sfx/exp.mp3')
        expSoundRef.current.volume = 0.85
      }catch(e){ expSoundRef.current = null }
    },[])

    useEffect(()=>{
      // play sound only when level increases (not on mount)
      if(typeof prevLevelRef.current === 'number' && level > prevLevelRef.current){
        try{ expSoundRef.current && expSoundRef.current.play && expSoundRef.current.play().catch(()=>{}) }catch(e){}
      }
      prevLevelRef.current = level
    },[level])

  // lightweight toast to avoid blocking alert() modals
  const [toast, setToast] = useState(null)
  const showToast = (msg, ms = 1800) =>{
    setToast(msg)
    setTimeout(()=> setToast(null), ms)
  }

  useEffect(()=>{
    const onKey = (e)=>{
      if(e.key === '1') setSelectedSeed('wheat')
      if(e.key === '2') setSelectedSeed('corn')
      if(e.key === '3') setSelectedSeed('berry')
      if(e.key === '4') setSelectedSeed('pumpkin')
      if(e.key === 'b' || e.key === 'B') buySeed(selectedSeed)
    }
    window.addEventListener('keydown', onKey)
    return ()=>window.removeEventListener('keydown', onKey)
  },[selectedSeed, coins, seeds])

  useEffect(()=>{
    const onEsc = (e)=>{
      if(e.key === 'Escape' || e.key === 'Esc'){
        if(placingBuilding){
          // if we reserved coins on purchase, refund
          if(typeof placingBuilding === 'object' && placingBuilding.reserved){
            setCoins(c => c + (placingBuilding.cost || 0))
          }
          setPlacingBuilding(null)
          showToast('Placement canceled')
          // notify grid to clear any hover/preview state
          window.dispatchEvent(new Event('grow:cancelPlacement'))
        }
      }
    }
    window.addEventListener('keydown', onEsc)
    // open shop when requested by other components (EditMode)
    const onOpenShop = ()=> setShowShop(true)
    window.addEventListener('grow:openShop', onOpenShop)
    return ()=>{
      window.removeEventListener('keydown', onEsc)
      window.removeEventListener('grow:openShop', onOpenShop)
    }
  },[placingBuilding])

  const saveLocal = (state)=>{
    // state may be partial (farm) or full
    const full = Object.assign({}, { farm, coins, level, xp, seeds }, state)
    localStorage.setItem('grow:state', JSON.stringify(full))
    showToast('Saved locally')
  }

  const saveServer = async ()=>{
    try{
      const state = { farm, coins, level, xp, seeds }
      await axios.post('/api/save', { player, state })
      showToast('Saved to server')
    }catch(e){console.error(e); showToast('Server save failed')}
  }

  const loadServer = async ()=>{
    try{
      const r = await axios.get('/api/load',{ params:{ player } })
      if(r.data && r.data.state){
        const stRaw = r.data.state
        const st = migrateLoadedState(stRaw)
        setCoins(st.coins||1000)
        setLevel(st.level||1)
        setXp(st.xp||0)
        setSeeds(st.seeds||{wheat:0,corn:0})
        if(st.farm) window.dispatchEvent(new CustomEvent('grow:load', { detail: st }))
      }else showToast('No save found')
    }catch(e){console.error(e); showToast('Server load failed')}
  }

  const buySeed = (type)=>{
    const prices = { wheat:10, corn:20, berry:15, pumpkin:50 }
    const price = prices[type] || 10
    if(coins < price){ showToast('Not enough coins'); return }
    setCoins(c=>c-price)
    setSeeds(s=>({ ...s, [type]: (s[type]||0)+1 }))
    // play purchase sound (best-effort)
    try{ buySoundRef.current && buySoundRef.current.play && buySoundRef.current.play().catch(()=>{}) }catch(e){}
  }

  const formatNumber = (n) => {
    try{ return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') }catch(e){ return n }
  }

  const handleShopBuy = (item) => {
    if(!item) return
    if(item.category === 'Seeds'){
      buySeed(item.id)
      return
    }
    // Buildings: either reserve immediately or defer deduction until confirm
    if(purchaseMode === 'reserve'){
      if(coins < item.cost){ showToast('Not enough coins'); return }
      setCoins(c => c - item.cost)
      setPlacingBuilding({ type: item.id, cost: item.cost, reserved: true })
      setShowShop(false)
      showToast(`Purchased ${item.name} — place it on the farm`)
    }else{
      // confirm-on-place: enter placement mode but don't deduct yet
      setPlacingBuilding({ type: item.id, cost: item.cost, reserved: false, pending: true })
      setShowShop(false)
      showToast(`Purchase pending: place the ${item.name} to confirm purchase`)
    }
  }

  const handleMarkRead = (id)=>{
    setInboxMessages(m => m.map(msg => msg.id === id ? ({ ...msg, read: true }) : msg))
    setDiamondAlerts(a => Math.max(0, a-1))
  }

  const handleSettingsChange = (vals) =>{
    // store to localStorage for now
    localStorage.setItem('grow:settings', JSON.stringify(vals))
    showToast('Settings saved')
  }

  const confirmPlacement = (type,cost) => {
    // finalize placement called by GameCanvas after successful placement
    if(placingBuilding && typeof placingBuilding === 'object' && placingBuilding.type === type){
      if(placingBuilding.reserved){
        // already deducted (reserved) — play sound now that it's placed
        try{ buySoundRef.current && buySoundRef.current.play && buySoundRef.current.play().catch(()=>{}) }catch(e){}
        setPlacingBuilding(null)
        showToast(`${type} placed`)
        return
      }
      // need to deduct now
      if(coins < cost){
        showToast('Not enough coins to finalize placement')
        setPlacingBuilding(null)
        return
      }
      setCoins(c => c - cost)
      setPlacingBuilding(null)
      // play buy sound now that purchase is finalized
      try{ buySoundRef.current && buySoundRef.current.play && buySoundRef.current.play().catch(()=>{}) }catch(e){}
      showToast(`${type} placed`)
      return
    }
    // fallback: no placingBuilding tracked
    if(coins >= cost){ setCoins(c => c - cost); try{ buySoundRef.current && buySoundRef.current.play && buySoundRef.current.play().catch(()=>{}) }catch(e){} }
    showToast(`${type} placed`)
  }

  const addXP = (amount)=>{
    setXp(prevXp=>{
      let xpTotal = prevXp + amount
      let lvl = level
      while(xpTotal >= lvl * 100){ xpTotal -= lvl * 100; lvl++ }
      if(lvl !== level) setLevel(lvl)
      return xpTotal
    })
  }

  const handleFarmChange = (grid)=>{
    setFarm(grid)
    saveLocal({ farm: grid })
  }

  return (
    <div>

      <main className="container-fluid p-0">
        <GameCanvas onStateChange={handleFarmChange} setCoins={setCoins} addXP={addXP} seeds={seeds} setSeeds={setSeeds} selectedSeed={selectedSeed} showToast={showToast} placingBuilding={placingBuilding} setPlacingBuilding={setPlacingBuilding} onConfirmBuilding={confirmPlacement} />
      </main>

      {/* Experience feature (level + XP) */}
      <Experience level={level} xp={xp} goal={190000} />

      {/* Top-right HUD: Coins and Diamonds (updated template) */}
      <div className="top-right-hud" aria-hidden>
        <div className="hud-stack currency-stack">
          <div className="currency-card coins-card">
            <div className="currency-left">
              <div className="currency-icon">💰</div>
            </div>
            <div className="currency-center">
              <div className="currency-label">Coins</div>
              <div className="currency-amount">{formatNumber(coins)}</div>
            </div>
            <div className="currency-right">
              <button className="currency-plus" title="Buy coins" onClick={()=> showToast('Open store (not implemented)')}>+</button>
            </div>
          </div>

          <div style={{height:8}} />

          <div className="currency-card diamonds-card">
            <div className="currency-left">
              <div className="currency-icon">💎</div>
            </div>
            <div className="currency-center">
              <div className="currency-label">Gems</div>
              <div className="currency-amount small">{diamonds}</div>
            </div>
            <div className="currency-right">
              <button className="currency-plus" title="Buy gems" onClick={()=> showToast('Open gem store')}>+</button>
            </div>
            {diamondAlerts > 0 && (
              <div className="notify-badge">{diamondAlerts}</div>
            )}
          </div>

          {/* placement indicator under HUD */}
          {placingBuilding && (
            <div style={{marginTop:8}}>
              <div className="placing-indicator">
                <div className="dot" aria-hidden></div>
                <div style={{fontSize:13}}>
                  Placing: {typeof placingBuilding === 'string' ? placingBuilding : placingBuilding.type}
                  <div style={{fontSize:11,color:'#666'}}>
                    {typeof placingBuilding === 'object' ? (placingBuilding.reserved ? 'reserved' : (placingBuilding.pending ? 'pending' : 'placing')) : ''}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Left toolbar */}
      <div className="left-toolbar position-fixed">
        <button className="btn btn-light mb-2 shop-btn" title="Shop" onClick={()=>setShowShop(true)}>
          <img src="/shop.png" alt="Shop" style={{width:56,height:56,objectFit:'contain'}} onError={(e)=>{e.currentTarget.style.display='none'}} />
          <span className="shop-fallback" aria-hidden>🛒</span>
        </button>
      </div>

      {/* Side toolbar (right) */}
      <div className="side-toolbar position-fixed">
        <button className="side-btn mail" title="Inbox" onClick={()=> setInboxOpen(true)}>
          <div className="icon">✉️</div>
          {diamondAlerts > 0 && <div className="side-badge">{diamondAlerts}</div>}
        </button>
        <button className="side-btn settings" title="Settings" onClick={()=> setSettingsOpen(true)}>
          <div className="icon">⚙️</div>
        </button>
      </div>

      <Chat open={chatOpen} onClose={()=> setChatOpen(false)} onToggle={()=> setChatOpen(s => !s)} />
      <Inbox open={inboxOpen} onClose={()=> setInboxOpen(false)} messages={inboxMessages} onMarkRead={handleMarkRead} />
      <Settings open={settingsOpen} onClose={()=> setSettingsOpen(false)} values={JSON.parse(localStorage.getItem('grow:settings')||'{}')} onChange={handleSettingsChange} />

      {/* Shop overlay using feature component */}
      <Shop
        open={showShop}
        onClose={() => setShowShop(false)}
        onBuy={(item) => { handleShopBuy(item) }}
        coins={coins}
        inventory={seeds}
      />
      {toast && (
        <div className="app-toast position-fixed top-0 end-0 m-3 p-2 shadow rounded" style={{background:'rgba(0,0,0,0.85)',color:'#fff',zIndex:1200}}>
          {toast}
        </div>
      )}
    </div>
  )
}
