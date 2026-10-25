import { useState } from 'react'
import Evidence from './Evidence'
import { allSkills } from './lib/skills'
import { bridgeFor } from './data/bridge'

export default function Quests({ proof, saveProof, removeProof, learned, setLearned }) {
  const [active, setActive] = useState(null)
  const proven = allSkills.filter((skill) => proof[skill]).length

  if (active) {
    const plan = bridgeFor(active)
    return (
      <div className="pad">
        <button className="circle" aria-label="Back to quests" onClick={() => setActive(null)}>←</button>
        <span className="p" style={{ background: '#FFE58F', alignSelf: 'flex-start' }}>Quest · {plan.time}</span>
        <h1>{active} challenge</h1>
        <div className="card col"><h3>Your mission</h3><p className="m">{plan.build}</p></div>
        <div className="card col"><h3>Show what you did</h3><p className="m">{plan.demo}</p></div>
        {plan.learn.link && <a className="linkbtn bridge-link" href={plan.learn.link} target="_blank" rel="noopener noreferrer">Need a hand? Open a free lesson</a>}
        <label className="chk"><input type="checkbox" checked={!!learned[active]} onChange={() => setLearned({ ...learned, [active]: !learned[active] })} />I completed the lesson</label>
        <Evidence skill={active} saved={proof[active]} onSave={saveProof} onRemove={removeProof} />
      </div>
    )
  }

  const skills = [...allSkills].sort((left, right) => Number(!!proof[left]) - Number(!!proof[right]))
  return (
    <div className="pad">
      <div className="row"><div className="quest-mark" aria-hidden="true">★</div><div><p className="brand">Cupid Quest</p><h1>Show what you can do</h1></div></div>
      <div className="card col">
        <h3>{proven} of {allSkills.length} skills demonstrated</h3>
        <div className="bar" role="img" aria-label={`${proven} of ${allSkills.length} skills demonstrated`}>
          {Array.from({ length: allSkills.length }, (_, index) => <i key={index} className={index < proven ? 'on' : ''} />)}
        </div>
        <p className="note">Try a small practical challenge, then save a link or a short note as evidence. Proven skills count toward opportunity matches.</p>
      </div>
      {skills.map((skill) => {
        const plan = bridgeFor(skill)
        return (
          <button key={skill} className="card quest-card" onClick={() => setActive(skill)}>
            <span className="dot" style={{ background: proof[skill] ? '#BFF0DC' : '#FFE58F' }} aria-hidden="true">{proof[skill] ? '✓' : '?'}</span>
            <span className="quest-copy"><h3>{skill}</h3><p className="m">{proof[skill] ? 'Evidence saved · try another challenge' : `${plan.time} · ${plan.build}`}</p></span>
          </button>
        )
      })}
      <p className="note">Your evidence is self-reported and stored on this device. Don’t include private information in your proof.</p>
    </div>
  )
}
