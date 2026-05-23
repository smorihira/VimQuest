import { Routes, Route, Navigate } from 'react-router'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Placeholder screen="Landing" />} />
      <Route path="/play/:stageId" element={<Placeholder screen="Play" />} />
      <Route path="/result/:stageId" element={<Placeholder screen="Result" />} />
      <Route path="/gameover/:stageId" element={<Placeholder screen="GameOver" />} />
      <Route path="/tree" element={<Placeholder screen="SkillTree" />} />
      <Route path="/weapon/:nodeId" element={<Placeholder screen="WeaponGet" />} />
      <Route path="/tutorial/:nodeId" element={<Placeholder screen="Tutorial" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function Placeholder({ screen }: { screen: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      fontFamily: 'var(--font-code)',
      color: 'var(--accent)',
      fontSize: '24px',
    }}>
      {screen}
    </div>
  )
}

export default App
