import { useEffect, useState } from 'react'
import { opportunities, allSkills } from './data/opportunities'

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
  const days = Math.ceil((new Date(iso + 'T23:59:59') - Date.now()) / 86400000)
  if (days < 0) return { text: 'Closed', closed: true }
  if (days === 0) return { text: 'Closes today', closed: false }
  return { text: `${days} day${days === 1 ? '' : 's'} left`, closed: false }
}

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
        <p className="m">{o.employer} · {o.place}</p>
        <p className="m">{r.got} of {r.total} ready{status ? ` · ${status}` : ''}</p>
      </span>
    </button>
  )
}

function Home({ list, q, setQ, type, setType, pick, skills, getR, apps, open }) {
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
      <h2>{list.length ? 'Fresh today' : 'Nothing here yet'}</h2>
      {list.length === 0 && (
        <div className="empty">
          <Mascot size={64} />
          <h3>No matches for that</h3>
          <p className="m">Try a different word, or clear the filter to see everything.</p>
          <button className="btn" onClick={() => { setQ(''); setType('All') }}>Clear search</button>
        </div>
      )}
      {list.map((o) => <OppCard key={o.id} o={o} r={getR(o)} status={apps[o.id]} onOpen={open} />)}
      <p className="note">All listings are fictional demo data, not real vacancies.</p>
    </div>
  )
}

function Detail({ o, r, status, setStatus, remove, checks, toggleCheck, onBack, goPath, hasSkills }) {
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
          <span className="p" style={{ background: '#FFE58F' }}>Demo listing</span>
        </div>
        <h1>{o.title}</h1>
        <p className="m" style={{ color: 'var(--ink)' }}>{o.employer} · {o.place}</p>
      </div>
      <div className="pad">
        <div className="grid2">
          <div className="stat"><p className="m">Closing</p><h3>{c.text}</h3></div>
          <div className="stat"><p className="m">You earn</p><h3>{o.pay}</h3></div>
        </div>
        <div className="stat"><p className="m">Who can apply</p><h3>{o.eligibility}</h3></div>

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
          <div className="bubble"><p className="m" style={{ color: 'var(--ink)' }}>This is a demo listing. For a real vacancy, we'd send you to the employer's official application page.</p></div>
        </div>
      </div>
      {!status && <div className="fixed-cta"><button className="btn" style={{ width: '100%' }} onClick={() => setStatus(o.id, 'Saved')}>Save to my list</button></div>}
    </div>
  )
}

function Saved({ list, apps, getR, open, goHome }) {
  if (!list.length)
    return (
      <div className="pad">
        <h1>My list</h1>
        <div className="empty">
          <Mascot size={64} />
          <h3>Nothing saved yet</h3>
          <p className="m">Save an opportunity and track it from Saved to Applied to Interview.</p>
          <button className="btn" onClick={goHome}>Browse opportunities</button>
        </div>
      </div>
    )
  return (
    <div className="pad">
      <h1>My list</h1>
      {STATUSES.filter((s) => list.some((o) => apps[o.id] === s)).map((s) => (
        <section key={s} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h2>{s}</h2>
          {list.filter((o) => apps[o.id] === s).map((o) => <OppCard key={o.id} o={o} r={getR(o)} onOpen={open} />)}
        </section>
      ))}
    </div>
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

  const getR = (o) => readiness(o, checks, skills)
  const setStatus = (id, s) => setApps({ ...apps, [id]: s })
  const remove = (id) => {
    const next = { ...apps }
    delete next[id]
    setApps(next)
  }
  const toggleCheck = (id, req) => setChecks({ ...checks, [id]: { ...checks[id], [req]: !checks[id]?.[req] } })
  const toggleSkill = (s) => setSkills(skills.includes(s) ? skills.filter((x) => x !== s) : [...skills, s])
  const open = (id) => { setOpenId(id); window.scrollTo(0, 0) }
  const go = (t) => { setOpenId(null); setTab(t); window.scrollTo(0, 0) }

  const term = q.trim().toLowerCase()
  const list = opportunities.filter(
    (o) => (type === 'All' || o.type === type) &&
      (!term || [o.title, o.employer, o.type, o.place, ...o.skills].join(' ').toLowerCase().includes(term))
  )
  const ratio = (o) => getR(o).matched.length / o.skills.length
  const ranked = [...opportunities].sort((a, b) => ratio(b) - ratio(a))
  const pick = skills.length ? ranked[0] : opportunities[0]
  const saved = opportunities.filter((o) => apps[o.id])
  const current = opportunities.find((o) => o.id === openId)

  return (
    <div className="app">
      {current ? (
        <Detail o={current} r={getR(current)} status={apps[current.id]} setStatus={setStatus} remove={remove} checks={checks} toggleCheck={toggleCheck} onBack={() => setOpenId(null)} goPath={() => go('path')} hasSkills={skills.length > 0} />
      ) : tab === 'home' ? (
        <Home list={list} q={q} setQ={setQ} type={type} setType={setType} pick={pick} skills={skills} getR={getR} apps={apps} open={open} />
      ) : tab === 'saved' ? (
        <Saved list={saved} apps={apps} getR={getR} open={open} goHome={() => go('home')} />
      ) : (
        <Path skills={skills} toggleSkill={toggleSkill} best={ranked.slice(0, 3)} getR={getR} apps={apps} open={open} />
      )}
      {(!current || apps[current.id]) && (
        <nav className="nav" aria-label="Main">
          {[['home', 'Home'], ['saved', 'Saved'], ['path', 'My path']].map(([id, label]) => (
            <button key={id} className={!current && tab === id ? 'on' : ''} aria-current={!current && tab === id ? 'page' : undefined} onClick={() => go(id)}>{label}</button>
          ))}
        </nav>
      )}
    </div>
  )
}
