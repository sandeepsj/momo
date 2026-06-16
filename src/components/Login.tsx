export default function Login({
  onLogin,
  loading,
  error,
}: {
  onLogin: () => void
  loading: boolean
  error: string | null
}) {
  return (
    <div className="login-wrap">
      <div className="card pad login-card">
        <div className="paw">🐾</div>
        <h1>momo</h1>
        <p>
          A cozy home base for your pet — events, medical history, training and
          memories. Everything lives in <b>your own Google Drive</b>.
        </p>
        <button className="btn primary" style={{ width: '100%', justifyContent: 'center' }} onClick={onLogin} disabled={loading}>
          {loading ? <span className="spin" /> : 'Sign in with Google'}
        </button>
        {error && <div className="err">{error}</div>}
        <p className="faint" style={{ fontSize: '0.78rem', marginTop: '1rem' }}>
          We only request the <code>drive.file</code> scope — the app can see only
          the files it creates.
        </p>
      </div>
    </div>
  )
}
