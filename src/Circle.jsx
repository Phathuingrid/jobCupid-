import { useEffect, useState } from 'react'
import { supabase, supabaseConfigured } from './lib/supabase'

const ROOMS = [
  ['tech', 'Software and tech'],
  ['service', 'Customer service'],
  ['cv', 'CV and interviews'],
  ['new', 'New here'],
]
const PERSONAL = /\b\d{13}\b|(?:\+27|0)[\s-]?\d{2}[\s-]?\d{3}[\s-]?\d{4}|\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/i

export default function Circle() {
  const [room, setRoom] = useState('tech')
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)
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
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return
      if (sessionError) setError(`Could not restore your Circle session: ${sessionError.message}`)
      setUser(data.session?.user || null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      setEmailSent(false)
    })
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
        .select('id, room, user_id, text, created_at')
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

  const signIn = async (event) => {
    event.preventDefault()
    if (!supabase) return
    setError('')
    setNotice('')
    const address = email.trim()
    if (!address) {
      setError('Enter your email address to receive a sign-in link.')
      return
    }
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: address,
      options: { emailRedirectTo: window.location.origin },
    })
    if (authError) setError(`Could not send the sign-in link: ${authError.message}`)
    else setEmailSent(true)
  }

  const send = async (event) => {
    event.preventDefault()
    if (!supabase || !user) return
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
      .insert({ room, user_id: user.id, text: message })
      .select('id, room, user_id, text, created_at')
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

  const signOut = async () => {
    if (!supabase) return
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) setError(`Could not sign out: ${signOutError.message}`)
  }

  return (
    <div className="pad">
      <div className="row"><div className="circle-mark" aria-hidden="true">♡</div><div><p className="brand">Cupid Circle</p><h1>Talk to people like you</h1></div></div>
      <div className="circle-safety">
        <h3>Keep each other safe</h3>
        <p className="m">Never share your ID number, phone, address, passwords, or bank details. Be kind, report unsafe messages, and verify opportunities on official pages. Messages are visible to signed-in Circle members.</p>
      </div>

      {!supabaseConfigured ? (
        <div className="empty">
          <h2>Circle needs backend setup</h2>
          <p className="m">Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local, run the SQL setup in supabase/circle.sql, then restart the development server.</p>
        </div>
      ) : !user ? (
        <form className="card col" onSubmit={signIn}>
          <h2>Sign in to join the Circle</h2>
          <p className="m">We’ll email you a one-time sign-in link. Your email is used for sign-in and is not shown in chat.</p>
          <label className="field">Email address<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <button className="btn" type="submit">Email me a sign-in link</button>
          {emailSent && <p className="note" role="status">Check your email for a sign-in link, then return here.</p>}
        </form>
      ) : (
        <>
          <div className="circle-account">
            <p className="note">Signed in as a Circle member</p>
            <button className="linkbtn" onClick={signOut}>Sign out</button>
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
                  <p className="note">{mine ? 'You' : `Member ${message.user_id.slice(0, 6)}`} · {new Date(message.created_at).toLocaleString()}</p>
                  <div className="bubble"><p>{message.text}</p></div>
                  {!mine && !reported[message.id] && <button className="linkbtn report-button" onClick={() => report(message.id)}>Report message</button>}
                  {!mine && reported[message.id] && <p className="note" role="status">Reported for review</p>}
                </article>
              )
            })}
          </div>
          <form onSubmit={send} className="composer">
            <label className="sr-only" htmlFor="circle-message">Message</label>
            <input id="circle-message" value={text} onChange={(event) => setText(event.target.value)} placeholder="Say something kind or helpful" maxLength={300} />
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
