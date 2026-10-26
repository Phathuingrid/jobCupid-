import { useEffect, useState } from 'react'
import { supabase, supabaseConfigured } from './lib/supabase'

const ROOMS = [
  ['general', 'Community chat', 'Say hello and connect with the JobCupid community.', '♡'],
  ['tech', 'Tech and digital', 'Learn about technology, coding and digital careers.', '</>'],
  ['careers', 'CVs and interviews', 'Share CV tips and practise for interviews.', 'CV'],
  ['opportunities', 'Jobs and learnerships', 'Discuss opportunities and application advice.', '↗'],
  ['support', 'Study and support', 'Encourage each other with learning and next steps.', '+'],
]
const PERSONAL = /\b\d{13}\b|(?:\+27|0)[\s-]?\d{2}[\s-]?\d{3}[\s-]?\d{4}|\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/i
const NAME_PATTERN = /^[\p{L}\p{N} _.-]{2,24}$/u

function storedName(userId) {
  try {
    return localStorage.getItem(`jc_circle_name_${userId}`) || ''
  } catch {
    return ''
  }
}

export default function Circle() {
  const [room, setRoom] = useState(null)
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authMode, setAuthMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [signupName, setSignupName] = useState('')
  const [authBusy, setAuthBusy] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [editingName, setEditingName] = useState(false)
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
      if (!active) return
      const account = session?.user && !session.user.is_anonymous ? session.user : null
      setUser(account)
      if (account) {
        const name = account.user_metadata?.display_name || storedName(account.id)
        setDisplayName(name)
        setNameInput(name)
        setEditingName(!name)
      } else {
        setRoom(null)
        setDisplayName('')
        setNameInput('')
        setEditingName(false)
      }
    })
    const restoreSession = async () => {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession()
        if (!active) return
        if (sessionError) {
          setError(`Could not restore your Circle session: ${sessionError.message}`)
          setAuthLoading(false)
          return
        }
        const account = data.session?.user
        if (account?.is_anonymous) {
          const { error: signOutError } = await supabase.auth.signOut()
          if (!active) return
          if (signOutError) setError(`Could not clear the old guest session: ${signOutError.message}`)
        } else if (account) {
          setUser(account)
          const name = account.user_metadata?.display_name || storedName(account.id)
          setDisplayName(name)
          setNameInput(name)
          setEditingName(!name)
        }
        setAuthLoading(false)
      } catch (authError) {
        if (!active) return
        const details = authError instanceof Error ? authError.message : 'Unexpected authentication error'
        setError(`Could not restore your Circle account: ${details}. Check your connection and Supabase settings.`)
        setAuthLoading(false)
      }
    }
    restoreSession()
    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!supabase || !user || !room) {
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

  const authenticate = async (event) => {
    event.preventDefault()
    const address = email.trim()
    if (!address || !password) {
      setError('Enter your email address and password.')
      return
    }
    if (authMode === 'signup' && password.length < 8) {
      setError('Use a password with at least 8 characters.')
      return
    }
    const name = signupName.trim()
    if (authMode === 'signup' && !NAME_PATTERN.test(name)) {
      setError('Choose a chat name with 2–24 letters, numbers, spaces, dots, dashes or underscores.')
      return
    }
    setAuthBusy(true)
    setError('')
    setNotice('')
    try {
      if (authMode === 'signup') {
        const { data, error: signupError } = await supabase.auth.signUp({
          email: address,
          password,
          options: {
            data: { display_name: name },
            emailRedirectTo: window.location.origin,
          },
        })
        if (signupError) {
          setError(`Could not create your account: ${signupError.message}`)
        } else if (data.session) {
          setUser(data.user)
          setDisplayName(name)
          setNameInput(name)
          setEditingName(false)
          setNotice('Your account is ready. Welcome to Cupid Circle!')
        } else {
          setAuthMode('signin')
          setPassword('')
          setNotice('Your account was created. Check your email to confirm it, then sign in with your password.')
        }
      } else {
        const { data, error: signinError } = await supabase.auth.signInWithPassword({
          email: address,
          password,
        })
        if (signinError) {
          setError(`Could not sign in: ${signinError.message}`)
        } else {
          setUser(data.user)
          const savedName = data.user.user_metadata?.display_name || storedName(data.user.id)
          setDisplayName(savedName)
          setNameInput(savedName)
          setEditingName(!savedName)
          setPassword('')
        }
      }
    } catch (authError) {
      const details = authError instanceof Error ? authError.message : 'Unexpected authentication error'
      setError(`Circle sign-in failed: ${details}`)
    } finally {
      setAuthBusy(false)
    }
  }

  const saveDisplayName = async (event) => {
    event.preventDefault()
    const name = nameInput.trim()
    if (!NAME_PATTERN.test(name)) {
      setError('Choose a chat name with 2–24 letters, numbers, spaces, dots, dashes or underscores.')
      return
    }
    if (!supabase || !user) return
    setAuthBusy(true)
    setError('')
    try {
      const { data, error: updateError } = await supabase.auth.updateUser({ data: { display_name: name } })
      if (updateError) {
        setError(`Could not save your chat name: ${updateError.message}`)
        return
      }
      try {
        localStorage.setItem(`jc_circle_name_${user.id}`, name)
      } catch {
        setError('Your chat name was saved to your account but could not be cached in this browser.')
      }
      setUser(data.user)
      setDisplayName(name)
      setEditingName(false)
    } catch (updateError) {
      const details = updateError instanceof Error ? updateError.message : 'Unexpected account update error'
      setError(`Could not save your chat name: ${details}`)
    } finally {
      setAuthBusy(false)
    }
  }

  const signOut = async () => {
    if (!supabase) return
    setError('')
    try {
      const { error: signoutError } = await supabase.auth.signOut()
      if (signoutError) setError(`Could not sign out: ${signoutError.message}`)
    } catch (signoutError) {
      const details = signoutError instanceof Error ? signoutError.message : 'Unexpected sign-out error'
      setError(`Could not sign out: ${details}`)
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
        <p className="m">Sign in with your email and password to join the shared groups. Never share your ID number, phone, address, passwords, or bank details. Be kind and report unsafe messages.</p>
      </div>

      {!supabaseConfigured ? (
        <div className="empty">
          <h2>Circle needs backend setup</h2>
          <p className="m">For the deployed site, add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in Vercel → Project Settings → Environment Variables for Production, then redeploy. For local testing, add them to .env.local and restart the dev server. In Supabase, enable Email sign-in.</p>
        </div>
      ) : authLoading ? (
        <p className="note" role="status">Checking your Circle account…</p>
      ) : !user ? (
        <form className="card col" onSubmit={authenticate}>
          <h2>{authMode === 'signup' ? 'Create your Circle account' : 'Sign in to Cupid Circle'}</h2>
          <p className="m">{authMode === 'signup' ? 'Create an account with your email, a password, and a chat name.' : 'Use your email and password to join the community groups.'}</p>
          {authMode === 'signup' && <label className="field">Chat name<input value={signupName} onChange={(event) => setSignupName(event.target.value)} maxLength={24} autoComplete="nickname" required /></label>}
          <label className="field">Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
          <label className="field">Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={authMode === 'signup' ? 8 : undefined} autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'} required /></label>
          <button className="btn" type="submit" disabled={authBusy}>{authBusy ? 'Please wait…' : authMode === 'signup' ? 'Create account' : 'Sign in'}</button>
          <button className="linkbtn" type="button" disabled={authBusy} onClick={() => { setAuthMode(authMode === 'signup' ? 'signin' : 'signup'); setError(''); setNotice('') }}>
            {authMode === 'signup' ? 'Already have an account? Sign in' : 'New to Cupid Circle? Create an account'}
          </button>
        </form>
      ) : editingName || !displayName ? (
        <form className="card col" onSubmit={saveDisplayName}>
          <h2>Choose your chat name</h2>
          <p className="m">Pick a nickname between 2 and 24 characters. It will appear beside your messages.</p>
          <label className="field">Chat name<input value={nameInput} onChange={(event) => setNameInput(event.target.value)} maxLength={24} autoComplete="nickname" required /></label>
          <button className="btn" type="submit" disabled={authBusy}>{authBusy ? 'Saving…' : 'Save chat name'}</button>
        </form>
      ) : (
        <>
          <div className="circle-account">
            <p className="note">Chatting as <strong>{displayName}</strong></p>
            <div className="seg">
              <button className="linkbtn" onClick={() => { setNameInput(displayName); setEditingName(true) }}>Change name</button>
              <button className="linkbtn" onClick={signOut}>Sign out</button>
            </div>
          </div>
          {!room ? (
            <section className="circle-room-list" aria-labelledby="circle-groups-heading">
              <div>
                <h2 id="circle-groups-heading">Your communities</h2>
                <p className="m">Choose a group to join the conversation.</p>
              </div>
              {ROOMS.map(([id, name, description, mark]) => (
                <button key={id} className="circle-room-card" onClick={() => { setRoom(id); setMessages([]); setNotice(''); setError('') }}>
                  <span className="circle-room-icon" aria-hidden="true">{mark}</span>
                  <span className="circle-room-copy">
                    <strong>{name}</strong>
                    <span className="m">{description}</span>
                  </span>
                  <span className="circle-room-arrow" aria-hidden="true">›</span>
                </button>
              ))}
            </section>
          ) : (
            <section className="circle-chat" aria-label={`${ROOMS.find(([id]) => id === room)?.[1]} group chat`}>
              <header className="circle-chat-header">
                <button className="circle" aria-label="Back to communities" onClick={() => { setRoom(null); setMessages([]); setNotice(''); setError('') }}>←</button>
                <span className="circle-room-icon" aria-hidden="true">{ROOMS.find(([id]) => id === room)?.[3]}</span>
                <div>
                  <h2>{ROOMS.find(([id]) => id === room)?.[1]}</h2>
                  <p className="note">Community group chat</p>
                </div>
              </header>
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
            </section>
          )}
        </>
      )}
      {error && <p className="err" role="alert">{error}</p>}
      {notice && <p className="note" role="status">{notice}</p>}
      <p className="note">If someone is in immediate danger, contact local emergency services or a trusted adult.</p>
    </div>
  )
}
