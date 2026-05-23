import { Routes, Route, Navigate } from 'react-router'
import { PlayScreen } from './features/play/PlayScreen'
import { ResultScreen } from './features/result/ResultScreen'
import { GameOverScreen } from './features/gameover/GameOverScreen'
import { LandingScreen } from './features/landing/LandingScreen'
import { SkillTreeScreen } from './features/skillTree/SkillTreeScreen'
import { WeaponGetScreen } from './features/weaponGet/WeaponGetScreen'
import { TutorialScreen } from './features/tutorial/TutorialScreen'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingScreen />} />
      <Route path="/play/:stageId" element={<PlayScreen />} />
      <Route path="/result/:stageId" element={<ResultScreen />} />
      <Route path="/gameover/:stageId" element={<GameOverScreen />} />
      <Route path="/tree" element={<SkillTreeScreen />} />
      <Route path="/weapon/:nodeId" element={<WeaponGetScreen />} />
      <Route path="/tutorial/:nodeId" element={<TutorialScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
