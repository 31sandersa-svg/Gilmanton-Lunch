import { useState, useEffect } from 'react'
import { supabase } from './supabase'

const TEACHER_PASSWORD = 'Teacher2026'
const OFFICE_PASSWORD = 'Caff2026'

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

  const lunchCount = students.filter(s => checked[s.id]).length
  const totalLunches = submissions.reduce((sum, s) => sum + (s.total_lunches || 0), 0)

  const styles = {
    app: { minHeight: '100vh', background: '#0e0e10', color: '#e8e8e8', fontFamily: 'system-ui, sans-serif', display: 'flex', justifyContent: 'center', padding: '40px 16px' },
    card: { width: '100%', maxWidth: '420px' },
    title: { fontSize: '22px', fontWeight: '500', marginBottom: '4px' },
    sub: { fontSize: '13px', color: '#666', marginBottom: '28px' },
    label: { fontSize: '12px', color: '#888', marginBottom: '6px', display: 'block', fontWeight: '500' },
    input: { width: '100%', background: '#1a1a1e', border: '0.5px solid #2e2e32', borderRadius: '8px', padding: '10px 12px', color: '#e8e8e8', fontSize: '14px', marginBottom: '16px', boxSizing: 'border-box', outline: 'none' },
    select: { width: '100%', background: '#1a1a1e', border: '0.5px solid #2e2e32', borderRadius: '8px', padding: '10px 12px', color: '#e8e8e8', fontSize: '14px', marginBottom: '20px', boxSizing: 'border-box', outline: 'none' },
    btn: { width: '100%', background: '#e8e8e8', color: '#111', border: 'none', borderRadius: '8px', padding: '11px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
    list: { background: '#161618', border: '0.5px solid #2a2a2e', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' },
    row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '0.5px solid #2a2a2e' },
    error: { color: '#9a5a5a', fontSize: '13px', marginBottom: '12px' },
    success: { background: '#1e2a1e', border: '0.5px solid #2a3a2a', borderRadius: '8px', padding: '16px', textAlign: 'center' },
    statCard: { background: '#161618', border: '0.5px solid #2a2a2e', borderRadius: '8px', padding: '16px', marginBottom: '16px' }
  }

  if (screen === 'login') return (
    <div style={styles.app}>
      <div style={styles.card}>
        <div style={styles.title}>Gilmanton School</div>
        <div style={styles.sub}>Lunch Count 2026</div>
        <label style={styles.label}>Password</label>
        <input style={styles.input} type="password" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        {error && <div style={styles.error}>{error}</div>}
        <button style={styles.btn} onClick={handleLogin}>Sign in</button>
      </div>
    </div>
  )

  if (screen === 'teacher') return (
    <div style={styles.app}>
      <div style={styles.card}>
        <div style={styles.title}>Good morning</div>
        <div style={styles.sub}>Select your class to begin</div>
        <label style={styles.label}>Your classroom</label>
        <select style={styles.select} value={selectedClass} onChange={e => { setSelectedClass(e.target.value); fetchStudents(e.target.value); setChecked({}); setSubmitted(false) }}>
          <option value="">-- Select class --</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.Class}</option>)}
        </select>
        {selectedClass && !submitted && (
          <>
            <div style={{ fontSize: '12px', color: '#888', fontWeight: '500', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Who needs hot lunch?</div>
            <div style={styles.list}>
              {students.map((student, i) => (
                <div key={student.id} style={{ ...styles.row, borderBottom: i === students.length - 1 ? 'none' : '0.5px solid #2a2a2e', cursor: 'pointer' }} onClick={() => setChecked(prev => ({ ...prev, [student.id]: !prev[student.id] }))}>
                  <span style={{ fontSize: '14px' }}>{student.name}</span>
                  <div style={{ width: '18px', height: '18px', borderRadius: '4px', background: checked[student.id] ? '#e8e8e8' : 'transparent', border: checked[student.id] ? 'none' : '0.5px solid #3a3a3e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {checked[student.id] && <span style={{ color: '#111', fontSize: '11px', fontWeight: '700' }}>✓</span>}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '14px' }}>{lunchCount} hot lunch{lunchCount !== 1 ? 'es' : ''} selected</div>
            <button style={styles.btn} onClick={handleSubmit} disabled={loading}>{loading ? 'Submitting...' : 'Submit lunch count'}</button>
          </>
        )}
        {submitted && (
          <div style={styles.success}>
            <div style={{ fontSize: '15px', fontWeight: '500', color: '#5a9a5a', marginBottom: '4px' }}>Submitted!</div>
            <div style={{ fontSize: '13px', color: '#666' }}>Already submitted for today!</div>
          </div>
        )}
      </div>
    </div>
  )

  if (screen === 'office') return (
    <div style={styles.app}>
      <div style={styles.card}>
        <div style={styles.title}>Kitchen Dashboard</div>
        <div style={styles.sub}>Today's lunch count</div>
        <div style={styles.statCard}>
          <div style={{ fontSize: '32px', fontWeight: '500' }}>{totalLunches}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>Total lunches today</div>
        </div>
        <div style={{ fontSize: '12px', color: '#888', fontWeight: '500', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Class submissions</div>
        <div style={styles.list}>
          {classes.map((c, i) => {
            const sub = submissions.find(s => s.class_id == c.id)
            return (
              <div key={c.id} style={{ ...styles.row, borderBottom: i === classes.length - 1 ? 'none' : '0.5px solid #2a2a2e' }}>
                <span style={{ fontSize: '14px' }}>{c.Class}</span>
                {sub
                  ? <span style={{ fontSize: '11px', background: '#1e2a1e', color: '#5a9a5a', borderRadius: '3px', padding: '2px 8px' }}>{sub.total_lunches} lunches</span>
                  : <span style={{ fontSize: '11px', background: '#2a1e1e', color: '#9a5a5a', borderRadius: '3px', padding: '2px 8px' }}>Not yet</span>
                }
              </div>
            )
          })}
        </div>
        <button style={styles.btn} onClick={fetchSubmissions}>Refresh</button>
      </div>
    </div>
  )
}