import { useState } from 'react'

export default function Evidence({ skill, saved, onSave, onRemove }) {
  const [editing, setEditing] = useState(!saved)
  const [link, setLink] = useState(saved?.link || '')
  const [note, setNote] = useState(saved?.note || '')
  const [error, setError] = useState('')

  const submit = (event) => {
    event.preventDefault()
    if (link.trim() && !/^https?:\/\//i.test(link.trim())) {
      setError('Start the link with http:// or https://')
      return
    }
    if (!link.trim() && note.trim().length < 10) {
      setError('Add a link or a few words about what you made.')
      return
    }
    setError('')
    onSave(skill, { link: link.trim(), note: note.trim(), at: Date.now() })
    setEditing(false)
  }

  if (!editing) {
    return (
      <div className="card proof-card">
        <h3>✓ Proven: {skill}</h3>
        {saved.note && <p className="m">{saved.note}</p>}
        {saved.link && <a href={saved.link} target="_blank" rel="noopener noreferrer">{saved.link}</a>}
        <div className="seg">
          <button className="linkbtn" onClick={() => setEditing(true)}>Edit proof</button>
          <button className="linkbtn" onClick={() => { setEditing(true); onRemove(skill) }}>Remove proof</button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={submit} noValidate className="evidence-form">
      <label className="field">Link to your work (optional)<input value={link} onChange={(event) => setLink(event.target.value)} inputMode="url" placeholder="https://" /></label>
      <label className="field">What did you make or do?<textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="A sentence or two is enough" /></label>
      {error && <p className="err" role="alert">{error}</p>}
      <button className="btn" type="submit">Save my proof</button>
      <p className="note">This proof is self-reported and stays in this browser.</p>
    </form>
  )
}
