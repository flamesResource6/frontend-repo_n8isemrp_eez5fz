import { useEffect, useState } from 'react'
import Spline from '@splinetool/react-spline'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Navbar() {
  return (
    <div className="w-full flex items-center justify-between py-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 via-blue-500 to-orange-400" />
        <span className="text-xl font-semibold">VectorTutor</span>
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-300">
        <a href="#features" className="hover:text-white">Features</a>
        <a href="/test" className="hover:text-white">Backend Test</a>
        <a href="#upload" className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20">Upload</a>
      </div>
    </div>
  )
}

function Upload() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [topics, setTopics] = useState([])
  const [docId, setDocId] = useState(null)

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('mode', 'openai')
      const res = await fetch(`${BACKEND_URL}/api/upload`, { method: 'POST', body: form })
      const data = await res.json()
      setTopics(data.topics || [])
      setDocId(data.document_id)
    } catch (err) {
      console.error(err)
      alert('Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const genFlashcards = async (topic) => {
    const res = await fetch(`${BACKEND_URL}/api/flashcards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document_id: docId, topic })
    })
    const data = await res.json()
    alert(`Generated ${data.flashcards?.length || 0} flashcards`)
  }

  const genQuiz = async (topic) => {
    const res = await fetch(`${BACKEND_URL}/api/quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document_id: docId, topic, difficulty: 'Easy' })
    })
    const data = await res.json()
    alert(`Quiz ready with ${data.questions?.length || 0} questions`)
  }

  return (
    <div id="upload" className="bg-white/5 rounded-xl p-5 border border-white/10">
      <form onSubmit={handleUpload} className="flex flex-col gap-3">
        <label className="text-sm text-gray-300">Upload PDF</label>
        <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files?.[0] || null)} className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-white/10 file:text-white hover:file:bg-white/20 text-sm" />
        <button disabled={loading || !file} className="px-4 py-2 rounded bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 disabled:opacity-50">{loading ? 'Processing…' : 'Process Material'}</button>
      </form>

      {topics.length > 0 && (
        <div className="mt-6 space-y-2">
          <div className="text-sm text-gray-300">Detected topics</div>
          <div className="flex flex-wrap gap-2">
            {topics.map((t, i) => (
              <div key={i} className="px-3 py-1.5 rounded-full bg-white/10 text-sm flex items-center gap-2">
                <span>{t}</span>
                <button onClick={() => genFlashcards(t)} className="text-xs text-purple-300 hover:text-white">Flashcards</button>
                <button onClick={() => genQuiz(t)} className="text-xs text-blue-300 hover:text-white">Quiz</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [status, setStatus] = useState('Checking…')
  useEffect(() => {
    fetch(`${BACKEND_URL}`)
      .then(r => r.json())
      .then(() => setStatus('Online'))
      .catch(() => setStatus('Offline'))
  }, [])

  return (
    <div className="min-h-screen bg-[#0b0b10] text-white">
      <div className="relative h-[70vh]">
        <div className="absolute inset-0">
          <Spline scene="https://prod.spline.design/4cHQr84zOGAHOehh/scene.splinecode" style={{ width: '100%', height: '100%' }} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0b10]/10 via-[#0b0b10]/40 to-[#0b0b10] pointer-events-none" />
        <div className="relative z-10 container mx-auto px-6 pt-8">
          <Navbar />
          <div className="mt-16 max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-semibold leading-tight">Your multi‑agent study copilot</h1>
            <p className="mt-4 text-gray-300">Upload notes, auto‑generate flashcards and adaptive quizzes, and get a smart revision plan – all powered by collaborating AI agents.</p>
            <div className="mt-6 text-sm text-gray-400">Backend status: {status}</div>
          </div>
          <div className="mt-10 max-w-3xl">
            <Upload />
          </div>
        </div>
      </div>

      <div id="features" className="container mx-auto px-6 py-16 grid md:grid-cols-3 gap-6">
        {[
          {t:'Reader Agent', d:'Extracts text and segments topics from PDFs and notes.'},
          {t:'Flashcard Agent', d:'Creates concise Q/A cards; you can refine later.'},
          {t:'Quiz Agent', d:'Builds adaptive quizzes with explanations.'},
          {t:'Planner Agent', d:'Generates a personalized 7‑day revision plan.'},
          {t:'Chat Agent', d:'Ask contextual questions from your material.'},
          {t:'Analytics', d:'Track progress and weak areas over time.'},
        ].map((f,i)=> (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="text-lg font-medium">{f.t}</div>
            <div className="mt-1 text-sm text-gray-300">{f.d}</div>
          </div>
        ))}
      </div>

      <footer className="py-10 text-center text-xs text-gray-400">
        Built with ❤ for focused learning.
      </footer>
    </div>
  )
}
