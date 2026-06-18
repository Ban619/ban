import React, { useEffect, useRef, useState } from 'react'

export default function Chat({ open, onClose, onToggle }){
  const [messages, setMessages] = useState([
  ])
  const [text, setText] = useState('')
  const panelRef = useRef(null)

  useEffect(()=>{
    if(open){
      const t = setTimeout(()=>{
        const input = panelRef.current && panelRef.current.querySelector('input')
        input && input.focus()
      },240)
      return ()=> clearTimeout(t)
    }
  },[open])

  const send = ()=>{
    if(!text.trim()) return
    setMessages(m => ([...m, { id:Date.now(), who:'me', name:'You', text: text.trim(), time:'now' }]))
    setText('')
  }

  // always render the chat root so it can animate in/out from the left
  return (
    <div className={`chat-backdrop ${open ? 'open' : 'closed'}`} onMouseDown={(e)=>{ if(e.target === e.currentTarget) onClose && onClose() }}>
      {/* small persistent handle so users can always grab/toggle the chat */}
      <button className={`chat-handle ${open ? 'open' : 'closed'}`} onClick={()=> onToggle && onToggle()} aria-label="Toggle chat">
        <svg viewBox="0 0 24 24" aria-hidden focusable="false">
          <polygon points="6,4 18,12 6,20" />
        </svg>
      </button>
      <div className={`chat-panel chat-panel-iso ${open ? 'open' : 'closed'}`} ref={panelRef} onMouseDown={(e)=>e.stopPropagation()}>
        <div className="chat-header">
          <div className="chat-title">Chat</div>
          <button className="close-btn" onClick={()=> onClose && onClose()}>×</button>
        </div>
        <div className="chat-body">
          {messages.map(m=> (
            <div key={m.id} className={`chat-row ${m.who==='me' ? 'me' : 'other'}`}>
              <div className="chat-avatar" aria-hidden></div>
              <div className="chat-bubble-wrap">
                <div className={`chat-bubble ${m.who==='other' ? 'bubble-other' : 'bubble-me'}`}>
                  <div className="bubble-name">{m.name}</div>
                  <div className="bubble-text">{m.text}</div>
                </div>
                <div className="bubble-time">{m.time}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="chat-input-row chat-input-iso">
          <input value={text} onChange={(e)=>setText(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter') send() }} placeholder="Type..." />
          <button className="btn-send" onClick={send}>🙂</button>
        </div>
      </div>
      </div>
  )
}
