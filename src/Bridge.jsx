import { useState } from 'react'
import Evidence from './Evidence'
import { bridgeFor } from './data/bridge'

function Step({ number, title, done, children }) {
  return (
    <div className="bridge-step">
      <span className={`bridge-number${done ? ' done' : ''}`} aria-hidden="true">{done ? '✓' : number}</span>
      <div className="bridge-step-content">
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  )
}

export default function Bridge({ o, owned, proof, learned, setLearned, saveProof, removeProof, r, onBack }) {
  const [rechecked, setRechecked] = useState(false)
  const missing = o.skills.filter((skill) => !owned.includes(skill))
  const matched = o.skills.length - missing.length

  return (
    <div>
      <div className="detail-top bridge-header">
        <button className="circle" aria-label="Back to opportunity" onClick={onBack}>←</button>
        <p className="brand">Cupid Bridge</p>
        <h1>Your bridge to {o.title}</h1>
        <p className="m">{o.employer}</p>
      </div>
      <div className="pad">
        <div className="card col">
          <p className="m bridge-intro">
            {missing.length
              ? `You’re not far off. Turn ${missing.join(', ')} into skills you can practise and demonstrate.`
              : 'You have evidence for every skill mentioned in this listing. Keep building and apply when you are ready.'}
          </p>
          <div className="bar" role="img" aria-label={`${matched} of ${o.skills.length} opportunity skills matched`}>
            {Array.from({ length: o.skills.length }, (_, index) => <i key={index} className={index < matched ? 'on' : ''} />)}
          </div>
          <div className="seg">
            {o.skills.map((skill) => (
              <span key={skill} className="p" style={owned.includes(skill) ? { background: '#BFF0DC' } : { border: '2px dashed var(--violet)' }}>
                {owned.includes(skill) ? '✓' : 'Bridge'} {skill}
              </span>
            ))}
          </div>
        </div>

        {missing.map((skill) => {
          const plan = bridgeFor(skill)
          const prerequisites = plan.prereq || []
          const known = prerequisites.filter((item) => owned.includes(item))
          const needed = prerequisites.filter((item) => !owned.includes(item))
          return (
            <section key={skill} className="card col bridge-card">
              <h2>{skill}</h2>
              {known.length > 0 && <p className="note">You already know {known.join(', ')}—that’s a great start.</p>}
              {needed.length > 0 && <p className="note">Start by getting comfortable with {needed.join(', ')}.</p>}
              <Step number="1" title="Learn" done={!!learned[skill]}>
                <p className="m">{plan.learn.text}</p>
                {plan.learn.link && <a className="linkbtn bridge-link" href={plan.learn.link} target="_blank" rel="noopener noreferrer">Open the free lesson</a>}
                <label className="chk"><input type="checkbox" checked={!!learned[skill]} onChange={() => setLearned({ ...learned, [skill]: !learned[skill] })} />I’ve completed this lesson</label>
              </Step>
              <Step number="2" title="Build" done={!!proof[skill]}>
                <p className="m">{plan.build}</p>
                <p className="note">About {plan.time}</p>
              </Step>
              <Step number="3" title="Demonstrate" done={!!proof[skill]}>
                <p className="m">{plan.demo}</p>
                <Evidence skill={skill} saved={proof[skill]} onSave={saveProof} onRemove={removeProof} />
              </Step>
              <Step number="4" title="Progress" done={!!proof[skill]}>
                <p className="m">{proof[skill] ? `${skill} is now backed by your proof and counts toward this match.` : 'Save evidence of your project, then recheck your match.'}</p>
              </Step>
            </section>
          )
        })}

        <button className="btn" onClick={() => setRechecked(true)}>Recheck my match</button>
        {rechecked && (
          <div className="card col" role="status">
            <h3>{r.got} of {r.total} ready</h3>
            <p className="m">{r.missing.length ? `Still to build: ${r.missing.join(', ')}.` : 'You have evidence for every skill in this listing. Keep going and check the official advert before applying.'}</p>
          </div>
        )}
        <p className="note">Proof is self-reported. Readiness helps you plan; it doesn’t predict whether you’ll be hired.</p>
      </div>
    </div>
  )
}
