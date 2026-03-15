import { useState, useEffect } from 'react'
import { supabase } from './supabase'

const TEACHER_PASSWORD = 'Teacher2026'
const OFFICE_PASSWORD = 'Caff2026'

function getInitials(name) {
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function App() {
  const [screen, setScreen] = useState('login')
  const [password, setPassword] = useState('')
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [checked, setChecked] = useState({})
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchClasses() }, [])

  async function fetchClasses() {
    const { data } = await supabase.from('Classes').select('*')
    if (data) setClasses(data)
  }

  async function fetchStudents(classId) {
    const { data } = await supabase.from('Students').select('*').eq('class_id', classId)
    if (data) setStudents(data)
    const today = new Date().toISOString().split('T')[0]
    const { data: existing } = await supabase
      .from('Lunch Submissions')
      .select('*')
      .eq('class_id', parseInt(classId))
      .eq('submission_date', today)
    if (existing && existing.length > 0) setSubmitted(true)
  }

  async function fetchSubmissions() {
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase.from('Lunch Submissions').select('*').eq('submission_date', today)
    if (data) setSubmissions(data)
  }

  async function handleSubmit() {
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]
    const lunchCount = students.filter(s => checked[s.id]).length
    const { data: submission, error: err } = await supabase
      .from('Lunch Submissions')
      .insert({ class_id: selectedClass, submission_date: today, total_lunches: lunchCount })
      .select()
      .single()
    if (err) { console.log('Submit error:', err); setLoading(false); return }
    if (submission) {
      for (const student of students) {
        await supabase.from('Lunch Orders').insert({
          student_id: student.id,
          submission_id: submission.id,
          wants_lunch: !!checked[student.id]
        })
      }
      setSubmitted(true)
    }
    setLoading(false)
  }

  function handleLogin() {
    if (password === TEACHER_PASSWORD) { setScreen('teacher'); setError('') }
    else if (password === OFFICE_PASSWORD) { fetchSubmissions(); setScreen('office'); setError('') }
    else { setError('Incorrect password') }
  }

  function toggleAll() {
    if (students.every(s => checked[s.id])) {
      setChecked({})
    } else {
      const all = {}
      students.forEach(s => all[s.id] = true)
      setChecked(all)
    }
  }

  const lunchCount = students.filter(s => checked[s.id]).length
  const coldCount = students.length - lunchCount
  const totalLunches = submissions.reduce((sum, s) => sum + (s.total_lunches || 0), 0)
  const selectedClassName = classes.find(c => c.id == selectedClass)?.Class || ''
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const c = {
    bg: '#0e0e10', surface: '#161618', border: '#2a2a2e',
    text: '#e8e8e8', muted: '#666', green: '#5a9a5a',
    greenBg: '#1e2a1e', red: '#9a5a5a', redBg: '#2a1e1e'
  }

  const st = {
    app: { minHeight: '100vh', background: c.bg, color: c.text, fontFamily: 'system-ui, sans-serif' },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: `0.5px solid ${c.border}` },
    content: { maxWidth: '500px', margin: '0 auto', padding: '24px 20px' },
    greeting: { fontSize: '22px', fontWeight: '500', marginBottom: '3px' },
    sub: { fontSize: '13px', color: c.muted, marginBottom: '22px' },
    statsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' },
    statCard: { background: c.surface, border: `0.5px solid ${c.border}`, borderRadius: '8px', padding: '12px 14px' },
    statNum: { fontSize: '22px', fontWeight: '500' },
    statLabel: { fontSize: '11px', color: c.muted, marginTop: '3px' },
    select: { width: '100%', background: c.surface, border: `0.5px solid ${c.border}`, borderRadius: '8px', padding: '10px 12px', color: c.text, fontSize: '14px', marginBottom: '20px', boxSizing: 'border-box', outline: 'none' },
    list: { background: c.surface, border: `0.5px solid ${c.border}`, borderRadius: '8px', overflow: 'hidden', marginBottom: '14px' },
    row: { display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', borderBottom: `0.5px solid ${c.border}`, cursor: 'pointer' },
    avatar: { width: '32px', height: '32px', borderRadius: '50%', background: '#1e1e2e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '500', color: '#8888bb', flexShrink: 0 },
    checkbox: { width: '18px', height: '18px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    btn: { width: '100%', background: c.text, color: '#111', border: 'none', borderRadius: '8px', padding: '11px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
    input: { width: '100%', background: c.surface, border: `0.5px solid ${c.border}`, borderRadius: '8px', padding: '10px 12px', color: c.text, fontSize: '14px', marginBottom: '16px', boxSizing: 'border-box', outline: 'none' },
    label: { fontSize: '12px', color: c.muted, marginBottom: '6px', display: 'block', fontWeight: '500' },
    sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
    sectionLabel: { fontSize: '11px', color: c.muted, fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.06em' },
  }

  if (screen === 'login') return (
    <div style={st.app}>
      <div style={{ ...st.content, paddingTop: '60px' }}>
        <div style={{ fontSize: '11px', color: c.muted, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Gilmanton School</div>
        <div style={st.greeting}>Lunch Count 2026</div>
        <div style={st.sub}>{today}</div>
        <label style={st.label}>Password</label>
        <input style={st.input} type="password" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        {error && <div style={{ color: c.red, fontSize: '13px', marginBottom: '12px' }}>{error}</div>}
        <button style={st.btn} onClick={handleLogin}>Sign in</button>
      </div>
    </div>
  )

  if (screen === 'teacher') return (
    <div style={st.app}>
      <div style={st.header}>
        <div style={{ fontSize: '11px', color: c.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Gilmanton School</div>
        <div style={{ fontSize: '12px', color: c.muted }}>{today}</div>
      </div>
      <div style={st.content}>
        <div style={st.greeting}>Good morning</div>
        <div style={st.sub}>{selectedClassName || 'Select your class to begin'}</div>

        {selectedClass && (
          <div style={st.statsRow}>
            <div style={st.statCard}>
              <div style={st.statNum}>{students.length}</div>
              <div style={st.statLabel}>Students</div>
            </div>
            <div style={st.statCard}>
              <div style={{ ...st.statNum, color: lunchCount > 0 ? c.green : c.text }}>{lunchCount}</div>
              <div style={st.statLabel}>Hot lunch</div>
            </div>
            <div style={st.statCard}>
              <div style={st.statNum}>{coldCount}</div>
              <div style={st.statLabel}>Cold lunch</div>
            </div>
          </div>
        )}

        <label style={st.label}>Your classroom</label>
        <select style={st.select} value={selectedClass} onChange={e => { setSelectedClass(e.target.value); fetchStudents(e.target.value); setChecked({}); setSubmitted(false) }}>
          <option value="">-- Select class --</option>
          {classes.map(cl => <option key={cl.id} value={cl.id}>{cl.Class}</option>)}
        </select>

        {selectedClass && !submitted && (
          <>
            <div style={st.sectionHeader}>
              <div style={st.sectionLabel}>Who needs hot lunch?</div>
              <div style={{ fontSize: '12px', color: '#888', cursor: 'pointer' }} onClick={toggleAll}>
                {students.length > 0 && students.every(s => checked[s.id]) ? 'Deselect all' : 'Select all'}
              </div>
            </div>
            <div style={st.list}>
              {students.map((student, i) => (
                <div key={student.id}
                  style={{ ...st.row, borderBottom: i === students.length - 1 ? 'none' : `0.5px solid ${c.border}` }}
                  onClick={() => setChecked(prev => ({ ...prev, [student.id]: !prev[student.id] }))}>
                  <div style={st.avatar}>{getInitials(student.name)}</div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px' }}>{student.name}</span>
                    {student.allergies && student.allergies.toLowerCase() !== 'none' && student.allergies.trim() !== '' && (
                      <span style={{ fontSize: '10px', background: c.redBg, color: '#c07070', borderRadius: '3px', padding: '2px 6px' }}>{student.allergies}</span>
                    )}
                  </div>
                  <div style={{ ...st.checkbox, background: checked[student.id] ? c.text : 'transparent', border: checked[student.id] ? 'none' : `0.5px solid #3a3a3e` }}>
                    {checked[student.id] && <span style={{ color: '#111', fontSize: '11px', fontWeight: '700' }}>✓</span>}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: '12px', color: c.muted, marginBottom: '14px' }}>{lunchCount} hot lunch{lunchCount !== 1 ? 'es' : ''} selected</div>
            <button style={st.btn} onClick={handleSubmit} disabled={loading}>{loading ? 'Submitting...' : 'Submit lunch count'}</button>
          </>
        )}

        {submitted && (
          <div style={{ background: c.greenBg, border: `0.5px solid #2a3a2a`, borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '15px', fontWeight: '500', color: c.green, marginBottom: '4px' }}>Submitted!</div>
            <div style={{ fontSize: '13px', color: c.muted }}>Already submitted for today</div>
          </div>
        )}
      </div>
    </div>
  )

  if (screen === 'office') return (
    <div style={st.app}>
      <div style={st.header}>
        <div style={{ fontSize: '11px', color: c.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Kitchen Dashboard</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.green }}></div>
          <div style={{ fontSize: '12px', color: c.green }}>Live</div>
        </div>
      </div>
      <div style={st.content}>
        <div style={st.greeting}>Today's count</div>
        <div style={st.sub}>{today}</div>

        <div style={st.statsRow}>
          <div style={st.statCard}>
            <div style={st.statNum}>{totalLunches}</div>
            <div style={st.statLabel}>Hot lunches</div>
          </div>
          <div style={st.statCard}>
            <div style={{ ...st.statNum, color: submissions.length === classes.length ? c.green : c.text }}>{submissions.length}/{classes.length}</div>
            <div style={st.statLabel}>Reported</div>
          </div>
          <div style={st.statCard}>
            <div style={{ ...st.statNum, color: c.red }}>{classes.length - submissions.length}</div>
            <div style={st.statLabel}>Waiting</div>
          </div>
        </div>

        <div style={st.sectionLabel}>Class submissions</div>
        <div style={{ ...st.list, marginTop: '10px', marginBottom: '16px' }}>
          {classes.map((cl, i) => {
            const sub = submissions.find(s => s.class_id == cl.id)
            return (
              <div key={cl.id} style={{ ...st.row, cursor: 'default', borderBottom: i === classes.length - 1 ? 'none' : `0.5px solid ${c.border}` }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: sub ? c.green : c.red, flexShrink: 0 }}></div>
                <span style={{ flex: 1, fontSize: '14px' }}>{cl.Class}</span>
                {sub
                  ? <span style={{ fontSize: '11px', background: c.greenBg, color: c.green, borderRadius: '3px', padding: '2px 8px' }}>{sub.total_lunches} lunches</span>
                  : <span style={{ fontSize: '11px', background: c.redBg, color: c.red, borderRadius: '3px', padding: '2px 8px' }}>Not yet</span>
                }
              </div>
            )
          })}
        </div>
        <button style={st.btn} onClick={fetchSubmissions}>Refresh</button>
      </div>
    </div>
  )
}
```

**File → Save**, then push to GitHub and Vercel will auto-update!

To push updates type these in Command Prompt:
```
cd %USERPROFILE%\Documents\gilmanton-lunch
git add .
git commit -m "new design"
git push