import { useEffect, useState } from 'react'
import { supabase, supabaseConfigured } from './lib/supabase'

const ROOMS = [
  ['general', 'Community chat'],
  ['tech', 'Tech and digital'],
  ['careers', 'CVs and interviews'],
  ['opportunities', 'Jobs and learnerships'],
  ['support', 'Study and support'],
]
const PERSONAL = /\b\d{13}\b|(?:\+27|0)[\s-]?\d{2}[\s-]?\d{3}[\s-]?\d{4}|\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/i
const NAME_PATTERN = /^[\p{L}\p{N} _.-]{2,24}$/u

function storedName() {
  try {
    return localStorage.getItem('jc_circle_name') || ''
  } catch {
    return ''
  }
}

export default function Circle() {
  const [room, setRoom] = useState('general')
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [displayName, setDisplayName] = useState(storedName)
  const [nameInput, setNameInput] = useState(storedName)
  const [editingName, setEditingName] = useState(!storedName())
  const [messages, setMessages] = useState([])
  const [reported, setReported] = useState({})
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!supabase) return undefined
    let active = true
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })
    const startAnonymousSession = async () => {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession()
        if (!active) return
        if (sessionError) {
          setError(`Could not restore your Circle session: ${sessionError.message}`)
          setAuthLoading(false)
          return
        }
        if (data.session?.user) {
          setUser(data.session.user)
          setAuthLoading(false)
          return
        }
        const { data: anonymousData, error: authError } = await supabase.auth.signInAnonymously()
        if (!active) return
        if (authError) setError(`Could not join the chat: ${authError.message}. Enable Anonymous Sign-Ins in Supabase Authentication settings.`)
        else setUser(anonymousData.user)
        setAuthLoading(false)
      } catch (authError) {
        if (!active) return
        const details = authError instanceof Error ? authError.message : 'Unexpected authentication error'
        setError(`Could not join the chat: ${details}. Check your connection and Supabase Anonymous Sign-In settings.`)
        setAuthLoading(false)
      }
    }
    startAnonymousSession()
    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!supabase || !user) {
      setMessages([])
      return undefined
    }

    let active = true
    setLoading(true)
    setError('')

    const loadMessages = async () => {
      const { data, error: queryError } = await supabase
        .from('circle_messages')
        .select('id, room, user_id, display_name, text, created_at')
        .eq('room', room)
        .order('created_at', { ascending: true })
        .limit(100)
      if (!active) return
      if (queryError) setError(`Could not load messages: ${queryError.message}`)
      else setMessages(data || [])
      setLoading(false)
    }

    const channel = supabase
      .channel(`circle-${room}-${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'circle_messages', filter: `room=eq.${room}` }, ({ new: message }) => {
        setMessages((current) => current.some((item) => item.id === message.id)
          ? current
          : [...current, message].slice(-100))
      })
      .subscribe((state) => {
        if (active && (state === 'CHANNEL_ERROR' || state === 'TIMED_OUT')) {
          setError('Live updates are unavailable. Check that Circle messages are enabled for Supabase Realtime.')
        }
      })

    loadMessages()
    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [room, user])

  const joinWithName = (event) => {
    event.preventDefault()
    const name = nameInput.trim()
    if (!NAME_PATTERN.test(name)) {
      setError('Choose a chat name with 2–24 letters, numbers, spaces, dots, dashes or underscores.')
      return
    }
    try {
      localStorage.setItem('jc_circle_name', name)
    } catch {
      setError('Your chat name could not be saved in this browser. Check your browser storage settings and try again.')
      return
    }
    setDisplayName(name)
    setEditingName(false)
    setError('')
    setNotice('')
  }

  const retryJoin = async () => {
    if (!supabase) return
    setAuthLoading(true)
    setError('')
    try {
      const { data, error: authError } = await supabase.auth.signInAnonymously()
      if (authError) setError(`Could not join the chat: ${authError.message}. Enable Anonymous Sign-Ins in Supabase Authentication settings.`)
      else setUser(data.user)
    } catch (authError) {
      const details = authError instanceof Error ? authError.message : 'Unexpected authentication error'
      setError(`Could not join the chat: ${details}. Check your connection and Supabase settings.`)
    } finally {
      setAuthLoading(false)
    }
  }

  const send = async (event) => {
    event.preventDefault()
    if (!supabase || !user || !displayName) return
    const message = text.trim().slice(0, 300)
    if (!message) return
    if (PERSONAL.test(message)) {
      setError('For your safety, remove ID numbers, phone numbers, or email addresses before posting.')
      return
    }
    setSending(true)
    setError('')
    const { data, error: insertError } = await supabase
      .from('circle_messages')
      .insert({ room, user_id: user.id, display_name: displayName, text: message })
      .select('id, room, user_id, display_name, text, created_at')
      .single()
    setSending(false)
    if (insertError) {
      setError(`Your message could not be sent: ${insertError.message}`)
      return
    }
    setMessages((current) => current.some((item) => item.id === data.id) ? current : [...current, data].slice(-100))
    setText('')
  }

  const report = async (messageId) => {
    if (!supabase || !user) return
    setError('')
    const { error: reportError } = await supabase.from('circle_reports').insert({
      message_id: messageId,
      reporter_id: user.id,
      reason: 'Reported by a community member',
    })
    if (reportError) {
      setError(`The report could not be sent: ${reportError.message}`)
      return
    }
    setReported((current) => ({ ...current, [messageId]: true }))
    setNotice('Thanks for reporting. The report was recorded for review.')
  }

  return (
    <div className="pad">
      <div className="row"><div className="circle-mark" aria-hidden="true">♡</div><div><p className="brand">Cupid Circle</p><h1>Community group chats</h1></div></div>
      <div className="circle-safety">
        <h3>Keep each other safe</h3>
        <p className="m">Chat without an email address. Messages are shared with everyone in each group. Never share your ID number, phone, address, passwords, or bank details. Be kind and report unsafe messages.</p>
      </div>

      {!supabaseConfigured ? (
        <div className="empty">
          <h2>Circle needs backend setup</h2>
          <p className="m">Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env.local, enable Anonymous Sign-Ins in Supabase Authentication settings, run the SQL setup in supabase/circle.sql, then restart the development server.</p>
        </div>
      ) : authLoading ? (
        <p className="note" role="status">Joining the community chat…</p>
      ) : !user ? (
        <div className="empty">
          <h2>Could not join the chat</h2>
          <p className="m">Check the Supabase settings and make sure Anonymous Sign-Ins are enabled.</p>
          <button className="btn" onClick={retryJoin}>Try again</button>
        </div>
      ) : editingName || !displayName ? (
        <form className="card col" onSubmit={joinWithName}>
          <h2>Choose your chat name</h2>
          <p className="m">No email or public profile is needed. Pick a nickname between 2 and 24 characters. It will appear beside your messages.</p>
          <label className="field">Chat name<input value={nameInput} onChange={(event) => setNameInput(event.target.value)} maxLength={24} autoComplete="nickname" required /></label>
          <button className="btn" type="submit">Join the groups</button>
        </form>
      ) : (
        <>
          <div className="circle-account">
            <p className="note">Chatting as <strong>{displayName}</strong></p>
            <button className="linkbtn" onClick={() => { setNameInput(displayName); setEditingName(true) }}>Change name</button>
          </div>
          <div className="chips" role="group" aria-label="Circle chat rooms">
            {ROOMS.map(([id, name]) => <button key={id} className={`p chip ${room === id ? 'on' : ''}`} aria-pressed={room === id} onClick={() => { setRoom(id); setNotice('') }}>{name}</button>)}
          </div>
          <div className="circle-messages" aria-live="polite">
            {loading && <p className="note">Loading messages…</p>}
            {!loading && messages.length === 0 && <p className="note">No messages yet. Start a kind, helpful conversation.</p>}
            {messages.map((message) => {
              const mine = message.user_id === user.id
              return (
                <article key={message.id} className={`circle-message${mine ? ' mine' : ''}`}>
                  <p className="note">{mine ? 'You' : message.display_name || 'Community member'} · {new Date(message.created_at).toLocaleString()}</p>
                  <div className="bubble"><p>{message.text}</p></div>
                  {!mine && !reported[message.id] && <button className="linkbtn report-button" onClick={() => report(message.id)}>Report message</button>}
                  {!mine && reported[message.id] && <p className="note" role="status">Reported for review</p>}
                </article>
              )
            })}
          </div>
          <form onSubmit={send} className="composer">
            <label className="sr-only" htmlFor="circle-message">Message</label>
            <input id="circle-message" value={text} onChange={(event) => setText(event.target.value)} placeholder="Message the group…" maxLength={300} disabled={sending} />
            <button className="btn" type="submit" disabled={sending}>{sending ? 'Sending…' : 'Send'}</button>
          </form>
        </>
      )}
      {error && <p className="err" role="alert">{error}</p>}
      {notice && <p className="note" role="status">{notice}</p>}
      <p className="note">If someone is in immediate danger, contact local emergency services or a trusted adult.</p>
    </div>
  )
}
