import { useEffect, useRef, useState } from 'react'
import { allSkills, skillsIn, DEFAULT_DOCS } from './lib/skills'
import { fetchLive } from './lib/live'
import Bridge from './Bridge'
import Quests from './Quests'
import Circle from './Circle'

const STATUSES = ['Saved', 'Applied', 'Interview', 'Closed']
const TYPES = ['All', 'Internship', 'Learnership', 'Graduate programme', 'Entry-level']
const TINT = { Internship: '#FFE58F', Learnership: '#BFF0DC', 'Graduate programme': '#C9E4FF', 'Entry-level': '#FFD3C2' }

function useStored(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : initial
    } catch {
      return initial
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* storage unavailable: app still works for this session */
    }
  }, [key, value])
  return [value, setValue]
}

function Mascot({ size = 56 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" aria-hidden="true" style={{ flex: 'none' }}>
      <path d="M28 10c0-6 5-8 9-7-1 5-4 8-9 7z" fill="#5BD3A0" />
      <circle cx="28" cy="32" r="22" fill="#FFD25E" />
      <circle cx="20" cy="30" r="3" fill="#2B2350" />
      <circle cx="36" cy="30" r="3" fill="#2B2350" />
      <path d="M22 39q6 6 12 0" stroke="#2B2350" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="13" cy="37" r="3.5" fill="#FF9DB5" />
      <circle cx="43" cy="37" r="3.5" fill="#FF9DB5" />
    </svg>
  )
}

function readiness(o, checks, skills) {
  const done = o.requirements.filter((r) => checks[o.id]?.[r])
  const matched = o.skills.filter((s) => skills.includes(s))
  const missing = o.skills.filter((s) => !skills.includes(s))
  const total = o.requirements.length + o.skills.length
  return { done, matched, missing, got: done.length + matched.length, total }
}

function closing(iso) {
  if (!iso) return { text: 'Not listed', closed: false }
  const days = Math.ceil((new Date(iso + 'T23:59:59') - Date.now()) / 86400000)
  if (days < 0) return { text: 'Closed', closed: true }
  if (days === 0) return { text: 'Closes today', closed: false }
  return { text: `${days} day${days === 1 ? '' : 's'} left`, closed: false }
}

const kind = (o) => (o.live ? 'Live · Adzuna' : 'Added by you')
const safeLink = (u) => (u && /^https?:\/\//i.test(u) ? u : null)
const where = (o) => [o.employer, o.place].filter(Boolean).join(' · ')
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)

function Bar({ got, total }) {
  return (
    <div className="bar" role="img" aria-label={`${got} of ${total} ready`}>
      {Array.from({ length: total }, (_, i) => (
        <i key={i} className={i < got ? 'on' : ''} />
      ))}
    </div>
  )
}

function OppCard({ o, r, status, onOpen }) {
  return (
    <button className="card" onClick={() => onOpen(o.id)}>
      <span className="dot" style={{ background: TINT[o.type] }} aria-hidden="true">{o.type[0]}</span>
      <span style={{ flex: 1 }}>
        <h3>{o.title}</h3>
        <p className="m">{where(o)}</p>
        <p className="m">{r.got} of {r.total} ready{status ? ` · ${status}` : ''}</p>
      </span>
    </button>
  )
}

function Home({ list, q, setQ, type, setType, pick, skills, getR, apps, open, liveState, onRetry }) {
  return (
    <div className="pad">
      <div className="row">
        <Mascot size={56} />
        <div>
          <p className="brand">JobCupid <span aria-hidden="true">♥</span></p>
          <h1>What do you want to try next?</h1>
        </div>
      </div>
      <label className="search">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search roles, skills, places" aria-label="Search opportunities" />
      </label>
      <div className="chips" role="group" aria-label="Filter by type">
        {TYPES.map((t) => (
          <button key={t} className={`p chip ${type === t ? 'on' : ''}`} aria-pressed={type === t} onClick={() => setType(t)}>{t}</button>
        ))}
      </div>
      {pick && !q && type === 'All' && (
        <div className="hero">
          <span className="p" style={{ background: '#FFD25E' }}>{skills.length ? 'Picked for you' : 'Start here'}</span>
          <h2>{pick.title}</h2>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{pick.employer} · {getR(pick).got} of {getR(pick).total} ready</p>
          <button className="btn light" onClick={() => open(pick.id)}>Take a look</button>
          <div className="mascot"><Mascot size={76} /></div>
        </div>
      )}
      <h2>{list.length ? 'Fresh today' : liveState === 'loading' ? 'Loading opportunities' : liveState === 'error' ? 'Live listings unavailable' : 'No opportunities found'}</h2>
      {list.length === 0 && (
        <div className="empty">
          <Mascot size={64} />
          {liveState === 'error' ? (
            <>
              <h3>We couldn't load live opportunities</h3>
              <p className="m">For local listings, configure ADZUNA_APP_ID and ADZUNA_APP_KEY in .env.local and run `npx vercel dev`. For deployment, add them to your hosting environment.</p>
              <button className="btn" onClick={onRetry}>Try again</button>
            </>
          ) : liveState === 'loading' ? (
            <>
              <h3>Connecting to live listings…</h3>
              <p className="m">Please wait while we fetch current opportunities.</p>
            </>
          ) : (
            <>
              <h3>No live opportunities match</h3>
              <p className="m">Try a different search, or clear the filter to see all available listings.</p>
              <button className="btn" onClick={() => { setQ(''); setType('All') }}>Clear search</button>
            </>
          )}
        </div>
      )}
      {list.map((o) => <OppCard key={o.id} o={o} r={getR(o)} status={apps[o.id]} onOpen={open} />)}
      {liveState === 'ok' && <p className="note">Jobs by Adzuna. Always check the details on the employer's official page before you apply.</p>}
    </div>
  )
}

function Detail({ o, r, status, setStatus, remove, checks, toggleCheck, onBack, goPath, onBridge, hasSkills }) {
  const c = closing(o.closes)
  return (
    <div>
      <div className="detail-top">
        <div className="row" style={{ justifyContent: 'space-between', width: '100%' }}>
          <button className="circle" aria-label="Back" onClick={onBack}>←</button>
          <button className="circle" aria-label={status ? 'Remove from my list' : 'Save to my list'} onClick={() => (status ? remove(o.id) : setStatus(o.id, 'Saved'))}>{status ? '♥' : '♡'}</button>
        </div>
        <div className="seg">
          <span className="p">{o.type}</span>
          <span className="p" style={{ background: '#FFE58F' }}>{kind(o)}</span>
        </div>
        <h1>{o.title}</h1>
        <p className="m" style={{ color: 'var(--ink)' }}>{where(o)}</p>
      </div>
      <div className="pad">
        <div className="grid2">
          <div className="stat"><p className="m">Closing</p><h3>{c.text}</h3></div>
          <div className="stat"><p className="m">You earn</p><h3>{o.pay}</h3></div>
        </div>
        <div className="stat"><p className="m">Who can apply</p><h3>{o.eligibility}</h3></div>
        {o.description && <div className="stat"><p className="m">From the listing</p><p className="m" style={{ color: 'var(--ink)' }}>{o.description.slice(0, 320)}{o.description.length > 320 ? '…' : ''}</p></div>}
        {o.live && <p className="note">Source: Adzuna · Checked {new Date(o.checked).toLocaleDateString('en-ZA')}</p>}
        {safeLink(o.link) && <a className="btn" href={safeLink(o.link)} target="_blank" rel="noopener noreferrer">{o.live ? 'Apply on the official page' : 'Open the original page'}</a>}

        <div className="card col">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h2>Your readiness</h2>
            <span className="p" style={{ background: '#FFE58F' }}>{r.got} of {r.total} ready</span>
          </div>
          <Bar got={r.got} total={r.total} />
          <h3>Documents to prepare</h3>
          {o.requirements.map((req) => (
            <label key={req} className="chk">
              <input type="checkbox" checked={!!checks[o.id]?.[req]} onChange={() => toggleCheck(o.id, req)} />
              {req}
            </label>
          ))}
          <h3>Skills</h3>
          <div className="seg">
            {r.matched.map((s) => <span key={s} className="p" style={{ background: '#BFF0DC' }}>✓ {s}</span>)}
            {r.missing.map((s) => <span key={s} className="p missing">Add: {s}</span>)}
          </div>
          {r.missing.length > 0 && <button className="btn" onClick={onBridge}>Build a bridge to these skills</button>}
          {r.missing.length === 0 && o.skills.length > 0 && <p className="note">You are matched on all the skills mentioned in this listing.</p>}
          {!o.skills.length && <p className="note">No specific skills were mentioned in this listing.</p>}
          {!hasSkills && <button className="p" style={{ background: '#E8E3FF', alignSelf: 'flex-start' }} onClick={goPath}>Pick your skills</button>}
          <p className="note">A simple count of what you've ticked and picked. It doesn't predict whether you'll be hired.</p>
        </div>

        {status && (
          <div className="card col">
            <h2>Where are you with this?</h2>
            <div className="seg" role="group" aria-label="Application status">
              {STATUSES.map((s) => (
                <button key={s} className={status === s ? 'on' : ''} aria-pressed={status === s} onClick={() => setStatus(o.id, s)}>{s}</button>
              ))}
            </div>
          </div>
        )}

        <div className="row" style={{ alignItems: 'flex-end' }}>
          <Mascot size={52} />
          <div className="bubble"><p className="m" style={{ color: 'var(--ink)' }}>Check the closing date and requirements on the official page before you apply. We only help you organise what you find.</p></div>
        </div>
      </div>
      {!status && <div className="fixed-cta"><button className="btn" style={{ width: '100%' }} onClick={() => setStatus(o.id, 'Saved')}>Save to my list</button></div>}
    </div>
  )
}

function Backup({ onExport, onImport, msg }) {
  const ref = useRef(null)
  return (
    <div className="card col">
      <h3>Back up your list</h3>
      <p className="m">Your list lives in this browser only. Download it to keep a copy or move to another device.</p>
      <div className="seg">
        <button className="linkbtn" onClick={onExport}>Download my list</button>
        <button className="linkbtn" onClick={() => ref.current.click()}>Load a saved list</button>
        <input ref={ref} type="file" accept="application/json" hidden onChange={(e) => e.target.files[0] && onImport(e.target.files[0])} />
      </div>
      {msg && <p className="note" role="status">{msg}</p>}
    </div>
  )
}

function Saved({ list, apps, getR, open, goAdd, onExport, onImport, msg }) {
  return (
    <div className="pad">
      <h1>My list</h1>
      {!list.length && (
        <div className="empty">
          <Mascot size={64} />
          <h3>Nothing saved yet</h3>
          <p className="m">Save an opportunity, or add one you found online, and track it from Saved to Applied to Interview.</p>
          <button className="btn" onClick={goAdd}>Add one by link</button>
        </div>
      )}
      {STATUSES.filter((s) => list.some((o) => apps[o.id] === s)).map((s) => (
        <section key={s} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h2>{s}</h2>
          {list.filter((o) => apps[o.id] === s).map((o) => <OppCard key={o.id} o={o} r={getR(o)} onOpen={open} />)}
        </section>
      ))}
      <Backup onExport={onExport} onImport={onImport} msg={msg} />
    </div>
  )
}

function AddForm({ onAdd }) {
  const blank = { title: '', employer: '', link: '', closes: '', type: 'Entry-level', notes: '' }
  const [f, setF] = useState(blank)
  const [err, setErr] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const submit = (e) => {
    e.preventDefault()
    if (!f.title.trim()) return setErr('Add a title so you can find it later.')
    if (f.link.trim() && !/^https?:\/\//i.test(f.link.trim())) return setErr('Start the link with http:// or https://')
    setErr('')
    onAdd(f)
    setF(blank)
  }
  return (
    <form className="pad" onSubmit={submit} noValidate>
      <div className="row"><Mascot size={56} /><div><p className="m">Found one online?</p><h1>Add it to your list</h1></div></div>
      <label className="field">Title<input value={f.title} onChange={set('title')} placeholder="e.g. Finance Graduate Programme" /></label>
      <label className="field">Employer<input value={f.employer} onChange={set('employer')} placeholder="Company name" /></label>
      <label className="field">Link to the listing<input value={f.link} onChange={set('link')} inputMode="url" placeholder="https://" /></label>
      <label className="field">Closing date<input type="date" value={f.closes} onChange={set('closes')} /></label>
      <label className="field">Type<select value={f.type} onChange={set('type')}>{TYPES.slice(1).map((t) => <option key={t}>{t}</option>)}</select></label>
      <label className="field">Paste the description (optional)<textarea value={f.notes} onChange={set('notes')} placeholder="We'll spot skills mentioned in it" /></label>
      {err && <p className="err" role="alert">{err}</p>}
      <button className="btn" type="submit">Save to my list</button>
    </form>
  )
}

function Path({ skills, toggleSkill, best, getR, apps, open }) {
  return (
    <div className="pad">
      <div className="row">
        <Mascot size={60} />
        <div>
          <p className="m">Your journey</p>
          <h1>{skills.length ? `${skills.length} skill${skills.length === 1 ? '' : 's'} picked, nice!` : 'Pick what you’re good at'}</h1>
        </div>
      </div>
      <div className="seg" role="group" aria-label="Your skills">
        {allSkills.map((s) => (
          <button key={s} className={skills.includes(s) ? 'on' : ''} aria-pressed={skills.includes(s)} onClick={() => toggleSkill(s)}>{s}</button>
        ))}
      </div>
      <h2>Closest to your skills</h2>
      {best.map((o) => <OppCard key={o.id} o={o} r={getR(o)} status={apps[o.id]} onOpen={open} />)}
      <p className="note">Your picks and progress stay in this browser on this device. There's no account and nothing is uploaded.</p>
    </div>
  )
}

export default function App() {
  const [tab, setTab] = useState('home')
  const [openId, setOpenId] = useState(null)
  const [q, setQ] = useState('')
  const [type, setType] = useState('All')
  const [apps, setApps] = useStored('jc_apps', {})
  const [checks, setChecks] = useStored('jc_checks', {})
  const [skills, setSkills] = useStored('jc_skills', [])
  const [proof, setProof] = useStored('jc_proof', {})
  const [learned, setLearned] = useStored('jc_learned', {})
  const [snap, setSnap] = useStored('jc_snap', {})
  const [custom, setCustom] = useStored('jc_custom', [])
  const [live, setLive] = useState([])
  const [liveState, setLiveState] = useState('loading')
  const [msg, setMsg] = useState('')
  const [bridgeId, setBridgeId] = useState(null)

  const loadLive = async () => {
    setLiveState('loading')
    try {
      setLive(await fetchLive())
      setLiveState('ok')
    } catch {
      setLive([])
      setLiveState('error')
    }
  }

  useEffect(() => {
    loadLive()
  }, [])

  const feed = [...custom, ...live]
  const find = (id) => feed.find((o) => String(o.id) === String(id)) || snap[id]
  const owned = [...new Set([...skills, ...Object.keys(proof)])]
  const getR = (o) => readiness(o, checks, owned)
  const setStatus = (id, s, o) => {
    setApps({ ...apps, [id]: s })
    const l = o || find(id)
    if (l) setSnap({ ...snap, [id]: l })
  }
  const remove = (id) => {
    const next = { ...apps }
    delete next[id]
    setApps(next)
  }
  const toggleCheck = (id, req) => setChecks({ ...checks, [id]: { ...checks[id], [req]: !checks[id]?.[req] } })
  const toggleSkill = (s) => setSkills(skills.includes(s) ? skills.filter((x) => x !== s) : [...skills, s])
  const open = (id) => { setOpenId(id); window.scrollTo(0, 0) }
  const go = (t) => { setOpenId(null); setBridgeId(null); setTab(t); setMsg(''); window.scrollTo(0, 0) }
  const saveProof = (skill, evidence) => setProof({ ...proof, [skill]: evidence })
  const removeProof = (skill) => {
    const next = { ...proof }
    delete next[skill]
    setProof(next)
  }

  const addCustom = (f) => {
    const o = {
      id: 'my-' + Date.now(), title: f.title.trim(), employer: f.employer.trim() || 'Employer not listed', place: '',
      type: f.type, closes: f.closes || null, pay: 'See listing', eligibility: 'See the original listing',
      skills: skillsIn(f.title + ' ' + f.notes), requirements: DEFAULT_DOCS, description: f.notes.trim(), link: f.link.trim() || null, custom: true,
    }
    setCustom([o, ...custom])
    setStatus(o.id, 'Saved', o)
    open(o.id)
  }

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ apps, snap, checks, skills, custom, proof, learned }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'jobcupid-my-list.json'
    a.click()
    URL.revokeObjectURL(a.href)
    setMsg('Downloaded. Keep the file somewhere safe.')
  }
  const importData = async (file) => {
    try {
      const d = JSON.parse(await file.text())
      if (!isRecord(d) || !isRecord(d.apps) ||
        (d.snap !== undefined && !isRecord(d.snap)) ||
        (d.checks !== undefined && !isRecord(d.checks)) ||
        (d.skills !== undefined && !Array.isArray(d.skills)) ||
        (d.custom !== undefined && !Array.isArray(d.custom)) ||
        (d.proof !== undefined && !isRecord(d.proof)) ||
        (d.learned !== undefined && !isRecord(d.learned))) {
        throw new Error('Invalid JobCupid backup')
      }
      setApps(d.apps || {}); setSnap(d.snap || {}); setChecks(d.checks || {}); setSkills(d.skills || []); setCustom(d.custom || []); setProof(d.proof || {}); setLearned(d.learned || {})
      setMsg('Your list was loaded.')
    } catch {
      setMsg('That file could not be read. Choose a file you downloaded from JobCupid.')
    }
  }

  const term = q.trim().toLowerCase()
  const list = feed.filter(
    (o) => (type === 'All' || o.type === type) &&
      (!term || [o.title, o.employer, o.type, o.place, ...o.skills].join(' ').toLowerCase().includes(term))
  )
  const ratio = (o) => (o.skills.length ? getR(o).matched.length / o.skills.length : 0)
  const ranked = [...feed].sort((a, b) => ratio(b) - ratio(a))
  const pick = owned.length ? ranked[0] : feed.find((o) => !o.custom)
  const saved = Object.keys(apps).map(find).filter(Boolean)
  const current = openId ? find(openId) : null
  const bridgeO = bridgeId ? find(bridgeId) : null

  return (
    <div className="app">
      {bridgeO ? (
        <Bridge o={bridgeO} owned={owned} proof={proof} learned={learned} setLearned={setLearned} saveProof={saveProof} removeProof={removeProof} r={getR(bridgeO)} onBack={() => setBridgeId(null)} />
      ) : current ? (
        <Detail o={current} r={getR(current)} status={apps[current.id]} setStatus={setStatus} remove={remove} checks={checks} toggleCheck={toggleCheck} onBack={() => setOpenId(null)} goPath={() => go('path')} onBridge={() => { setBridgeId(current.id); window.scrollTo(0, 0) }} hasSkills={owned.length > 0} />
      ) : tab === 'home' ? (
        <Home list={list} q={q} setQ={setQ} type={type} setType={setType} pick={pick} skills={owned} getR={getR} apps={apps} open={open} liveState={liveState} onRetry={loadLive} />
      ) : tab === 'quests' ? (
        <Quests proof={proof} saveProof={saveProof} removeProof={removeProof} learned={learned} setLearned={setLearned} />
      ) : tab === 'circle' ? (
        <Circle />
      ) : tab === 'add' ? (
        <AddForm onAdd={addCustom} />
      ) : tab === 'saved' ? (
        <Saved list={saved} apps={apps} getR={getR} open={open} goAdd={() => go('add')} onExport={exportData} onImport={importData} msg={msg} />
      ) : (
        <Path skills={owned} toggleSkill={toggleSkill} best={ranked.slice(0, 3)} getR={getR} apps={apps} open={open} />
      )}
      {!bridgeO && (!current || apps[current.id]) && (
        <nav className="nav" aria-label="Main">
          {[['home', 'Home'], ['quests', 'Quests'], ['circle', 'Circle'], ['add', 'Add'], ['saved', 'Saved'], ['path', 'Path']].map(([id, label]) => (
            <button key={id} className={!current && tab === id ? 'on' : ''} aria-current={!current && tab === id ? 'page' : undefined} onClick={() => go(id)}>{label}</button>
          ))}
        </nav>
      )}
    </div>
  )
}
