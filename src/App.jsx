import logo from './assets/logo.png'

function App() {
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#fff',
      }}
    >
      <img
        src={logo}
        alt="albuera Design"
        style={{
          position: 'absolute',
          top: '32px',
          left: '32px',
          height: '48px',
        }}
      />
    </div>
  )
}

export default App