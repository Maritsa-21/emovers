'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { publicJobService } from '@/lib/services'

interface PublicJob {
  id: number
  title: string
  move_size: string
  move_size_display: string
  pickup_address: string
  dropoff_address: string
  estimated_distance_km: string
  scheduled_date: string
  scheduled_time: string | null
  requested_staff_count: number
  application_deadline: string | null
  max_applicants: number | null
  applicant_count: number
  is_open_for_applications: boolean
  special_instructions: string | null
}

function ApplyModal({
  job,
  onClose,
  onDone,
}: {
  job: PublicJob
  onClose: () => void
  onDone: (msg: string, isError?: boolean) => void
}) {
  const [email, setEmail] = useState('')
  const [action, setAction] = useState<'apply' | 'withdraw'>('apply')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) { setError('Please enter your email address.'); return }
    setError(''); setLoading(true)
    try {
      if (action === 'apply') {
        await publicJobService.apply(job.id, email.trim())
        onDone('Availability confirmed! The admin will review your application.')
      } else {
        await publicJobService.withdraw(job.id, email.trim())
        onDone('Your application has been withdrawn.')
      }
      onClose()
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Something went wrong. Please try again.'
      setError(msg)
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.55)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }} onClick={onClose}>
      <div style={{
        background: 'white', borderRadius: '0.75rem', width: '100%', maxWidth: '440px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden',
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ background: 'var(--color-navy)', color: 'white', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Confirm Availability</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.25rem' }}>{job.title}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: '1.25rem', cursor: 'pointer', padding: '0 0.25rem', lineHeight: 1 }}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Job summary */}
          <div style={{ background: 'var(--color-gray-light)', borderRadius: '0.5rem', padding: '0.875rem 1rem', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <i className="fa-solid fa-calendar" style={{ color: 'var(--color-orange)', width: '1rem' }} />
              <span style={{ color: 'var(--color-navy)', fontWeight: 600 }}>{new Date(job.scheduled_date).toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <i className="fa-solid fa-location-dot" style={{ color: 'var(--color-orange)', width: '1rem' }} />
              <span style={{ color: 'var(--color-text-body)' }}>{job.pickup_address} &rarr; {job.dropoff_address}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <i className="fa-solid fa-users" style={{ color: 'var(--color-orange)', width: '1rem' }} />
              <span style={{ color: 'var(--color-text-body)' }}>{job.applicant_count} / {job.max_applicants ?? '∞'} applicants</span>
            </div>
            {job.application_deadline && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <i className="fa-solid fa-clock" style={{ color: 'var(--color-warning)', width: '1rem' }} />
                <span style={{ color: 'var(--color-text-body)' }}>Deadline: {new Date(job.application_deadline).toLocaleString('en-KE')}</span>
              </div>
            )}
          </div>

          {/* Action toggle */}
          <div style={{ display: 'flex', gap: '0.625rem' }}>
            {(['apply', 'withdraw'] as const).map(a => (
              <button
                key={a}
                type="button"
                onClick={() => setAction(a)}
                style={{
                  flex: 1, padding: '0.625rem', borderRadius: '0.375rem', fontWeight: 600,
                  fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.15s',
                  border: `2px solid ${action === a ? 'var(--color-orange)' : 'var(--color-gray-mid)'}`,
                  background: action === a ? 'rgba(232,69,10,0.06)' : 'white',
                  color: action === a ? 'var(--color-orange)' : 'var(--color-text-muted)',
                }}
              >
                {a === 'apply' ? <><i className="fa-solid fa-check" style={{ marginRight: '0.375rem' }} />I&apos;m Available</> : <><i className="fa-solid fa-rotate-left" style={{ marginRight: '0.375rem' }} />Withdraw</>}
              </button>
            ))}
          </div>

          {/* Email field */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-navy)', marginBottom: '0.375rem' }}>
              Your Staff Email *
            </label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              placeholder="e.g. staff01@emovers.co.ke"
              disabled={loading}
              autoFocus
              required
            />
            <div style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)', marginTop: '0.375rem' }}>
              Use the email address registered with Smart-Movers.
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '0.375rem', padding: '0.75rem', fontSize: '0.875rem', color: 'var(--color-danger)', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <i className="fa-solid fa-circle-exclamation" style={{ marginTop: '0.125rem', flexShrink: 0 }} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email.trim()}
            style={{
              padding: '0.75rem', borderRadius: '0.375rem', fontWeight: 700,
              fontSize: '0.9rem', cursor: loading ? 'wait' : 'pointer',
              border: 'none', background: 'var(--color-orange)', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              opacity: loading || !email.trim() ? 0.6 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            {loading && <span style={{ width: '1rem', height: '1rem', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />}
            {action === 'apply' ? 'Confirm Availability' : 'Withdraw Application'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AvailableJobsPage() {
  const [jobs, setJobs] = useState<PublicJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedJob, setSelectedJob] = useState<PublicJob | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const load = () => {
    setLoading(true); setError('')
    publicJobService.listJobs()
      .then(data => setJobs(Array.isArray(data) ? data : data.results || []))
      .catch(() => setError('Could not load jobs. Please try again later.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  const showToast = (msg: string, isError = false) => {
    setToast({ msg, type: isError ? 'error' : 'success' })
    load()
  }

  const moveSizeColors: Record<string, string> = {
    studio: 'var(--color-info)',
    one_bedroom: 'var(--color-success)',
    two_bedroom: 'var(--color-warning)',
    three_bedroom: 'var(--color-orange)',
    office_small: 'var(--color-navy)',
    office_large: 'var(--color-navy)',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa' }}>
      {/* Top bar */}
      <header style={{ background: 'var(--color-navy)', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.5rem', textTransform: 'uppercase', letterSpacing: '-0.02em', textDecoration: 'none' }}>
          <span style={{ color: 'var(--color-yellow)' }}>Smart-</span>
          <span style={{ color: 'white' }}>Movers</span>
        </Link>
        <Link href="/auth/login" style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <i className="fa-solid fa-right-to-bracket" />Staff Login
        </Link>
      </header>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, var(--color-navy) 0%, #1e3a5f 100%)', color: 'white', padding: '3rem 1.5rem 2.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.12)', borderRadius: '2rem', padding: '0.375rem 1rem', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1.25rem', color: 'rgba(255,255,255,0.9)' }}>
            <i className="fa-solid fa-truck-moving" style={{ color: 'var(--color-yellow)' }} />
            Staff Availability Portal
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2.25rem', textTransform: 'uppercase', letterSpacing: '-0.02em', marginBottom: '0.75rem', lineHeight: 1.1 }}>
            Open Moving Jobs
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1rem', lineHeight: 1.6, marginBottom: 0 }}>
            Browse available jobs and confirm your availability — no login required. Just enter your staff email address.
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Toast */}
        {toast && (
          <div style={{
            marginBottom: '1.5rem', padding: '1rem 1.25rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
            background: toast.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${toast.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.25)'}`,
            color: toast.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
          }}>
            <i className={`fa-solid ${toast.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`} style={{ fontSize: '1.125rem', flexShrink: 0 }} />
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{toast.msg}</span>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-muted)' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '0.75rem', display: 'block' }} />
            Loading available jobs…
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '2.5rem', color: 'var(--color-warning)', display: 'block', marginBottom: '1rem' }} />
            <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-navy)' }}>Could not load jobs</div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>{error}</div>
            <button onClick={load} style={{ background: 'var(--color-orange)', color: 'white', border: 'none', borderRadius: '0.375rem', padding: '0.625rem 1.25rem', fontWeight: 700, cursor: 'pointer' }}>
              Try Again
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-muted)' }}>
            <i className="fa-solid fa-calendar-xmark" style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem', color: 'var(--color-gray-mid)' }} />
            <div style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--color-navy)', marginBottom: '0.5rem' }}>No open jobs right now</div>
            <div style={{ fontSize: '0.875rem' }}>Check back soon — new jobs are posted regularly.</div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                <strong style={{ color: 'var(--color-navy)' }}>{jobs.length}</strong> job{jobs.length !== 1 ? 's' : ''} open for applications
              </div>
              <button onClick={load} style={{ background: 'none', border: '1px solid var(--color-gray-mid)', borderRadius: '0.375rem', padding: '0.375rem 0.75rem', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <i className="fa-solid fa-arrows-rotate" />Refresh
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {jobs.map(job => {
                const deadlinePassed = job.application_deadline ? new Date(job.application_deadline) < new Date() : false
                const isFull = job.max_applicants != null && job.applicant_count >= job.max_applicants
                const open = job.is_open_for_applications && !deadlinePassed && !isFull

                return (
                  <div key={job.id} style={{
                    background: 'white', borderRadius: '0.75rem', overflow: 'hidden',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.04)',
                    border: '1px solid rgba(0,0,0,0.06)',
                    borderLeft: `4px solid ${open ? 'var(--color-orange)' : 'var(--color-gray-mid)'}`,
                  }}>
                    <div style={{ padding: '1.25rem 1.5rem' }}>
                      {/* Title row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.875rem' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-navy)', textTransform: 'uppercase', letterSpacing: '0.01em', marginBottom: '0.25rem', lineHeight: 1.2 }}>
                            {job.title}
                          </h3>
                          <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                              background: 'rgba(232,69,10,0.08)', color: moveSizeColors[job.move_size] || 'var(--color-orange)',
                              borderRadius: '0.25rem', padding: '0.2rem 0.5rem', fontSize: '0.75rem', fontWeight: 700,
                            }}>
                              {job.move_size_display}
                            </span>
                            {open ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(34,197,94,0.08)', color: 'var(--color-success)', borderRadius: '0.25rem', padding: '0.2rem 0.5rem', fontSize: '0.75rem', fontWeight: 700 }}>
                                <i className="fa-solid fa-circle" style={{ fontSize: '0.45rem' }} />Open
                              </span>
                            ) : deadlinePassed ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(239,68,68,0.08)', color: 'var(--color-danger)', borderRadius: '0.25rem', padding: '0.2rem 0.5rem', fontSize: '0.75rem', fontWeight: 700 }}>
                                Closed
                              </span>
                            ) : isFull ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(245,158,11,0.1)', color: 'var(--color-warning)', borderRadius: '0.25rem', padding: '0.2rem 0.5rem', fontSize: '0.75rem', fontWeight: 700 }}>
                                Full
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <button
                          onClick={() => open && setSelectedJob(job)}
                          disabled={!open}
                          style={{
                            flexShrink: 0, padding: '0.625rem 1.25rem', borderRadius: '0.375rem',
                            fontWeight: 700, fontSize: '0.875rem', cursor: open ? 'pointer' : 'not-allowed',
                            border: 'none', background: open ? 'var(--color-orange)' : 'var(--color-gray-mid)',
                            color: open ? 'white' : 'var(--color-text-muted)',
                            transition: 'background 0.15s',
                          }}
                        >
                          <i className="fa-solid fa-check" style={{ marginRight: '0.375rem' }} />
                          Confirm Availability
                        </button>
                      </div>

                      {/* Details grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.625rem 1.5rem', fontSize: '0.875rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                          <i className="fa-solid fa-calendar" style={{ color: 'var(--color-orange)', marginTop: '0.125rem', width: '0.875rem', flexShrink: 0 }} />
                          <span style={{ color: 'var(--color-text-body)' }}>
                            {new Date(job.scheduled_date).toLocaleDateString('en-KE', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                            {job.scheduled_time && <> at {job.scheduled_time.slice(0, 5)}</>}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                          <i className="fa-solid fa-route" style={{ color: 'var(--color-orange)', marginTop: '0.125rem', width: '0.875rem', flexShrink: 0 }} />
                          <span style={{ color: 'var(--color-text-body)' }}>{job.estimated_distance_km} km</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                          <i className="fa-solid fa-location-dot" style={{ color: 'var(--color-orange)', marginTop: '0.125rem', width: '0.875rem', flexShrink: 0 }} />
                          <span style={{ color: 'var(--color-text-body)' }}>{job.pickup_address} &rarr; {job.dropoff_address}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                          <i className="fa-solid fa-users" style={{ color: 'var(--color-orange)', marginTop: '0.125rem', width: '0.875rem', flexShrink: 0 }} />
                          <span style={{ color: 'var(--color-text-body)' }}>
                            {job.applicant_count} applicant{job.applicant_count !== 1 ? 's' : ''}
                            {job.max_applicants != null && ` (max ${job.max_applicants})`}
                          </span>
                        </div>
                        {job.application_deadline && (
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                            <i className="fa-solid fa-clock" style={{ color: deadlinePassed ? 'var(--color-danger)' : 'var(--color-warning)', marginTop: '0.125rem', width: '0.875rem', flexShrink: 0 }} />
                            <span style={{ color: deadlinePassed ? 'var(--color-danger)' : 'var(--color-text-body)' }}>
                              Deadline: {new Date(job.application_deadline).toLocaleString('en-KE', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        )}
                      </div>

                      {job.special_instructions && (
                        <div style={{ marginTop: '0.875rem', padding: '0.625rem 0.875rem', background: 'rgba(245,158,11,0.06)', borderRadius: '0.375rem', borderLeft: '3px solid var(--color-warning)', fontSize: '0.8rem', color: 'var(--color-text-body)', lineHeight: 1.5 }}>
                          <i className="fa-solid fa-triangle-exclamation" style={{ color: 'var(--color-warning)', marginRight: '0.375rem' }} />
                          <strong>Special instructions:</strong> {job.special_instructions}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        <div style={{ marginTop: '3rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
          <p>Questions? Contact your admin or log in to your staff dashboard.</p>
          <Link href="/auth/login" style={{ color: 'var(--color-orange)', fontWeight: 600, textDecoration: 'none' }}>
            Staff Login &rarr;
          </Link>
        </div>
      </div>

      {selectedJob && (
        <ApplyModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onDone={showToast}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
