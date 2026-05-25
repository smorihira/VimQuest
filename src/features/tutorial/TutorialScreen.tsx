/**
 * TutorialScreen — the single source of truth for tutorial completion.
 * Saves tutorialStatus and navigates to PlayScreen with appropriate PlayMode.
 */

import { useParams, useNavigate } from 'react-router'
import { useSetAtom } from 'jotai'
import { getTutorial } from '../../data/tutorials'
import { getStage } from '../../data/stages'
import { gameProgressAtom } from '../../store/atoms'
import type { TutorialStatus, PlayMode } from '../../types/game'
import type { EditorState } from '../../types/editor'
import { StageTutorial } from '../play/StageTutorial'
import './TutorialScreen.css'

export function TutorialScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const setProgress = useSetAtom(gameProgressAtom)

  const tutorial = id ? getTutorial(id) : undefined
  const isReview = new URLSearchParams(window.location.search).get('review') === '1'

  if (!tutorial) {
    return <div className="tutorial-error">Tutorial not found: {id}</div>
  }

  const stage = getStage(tutorial.stageId)

  const handleComplete = (status: TutorialStatus, editorState?: EditorState) => {
    // Save tutorialStatus (SSOT — only place this is written)
    setProgress((prev) => ({
      ...prev,
      tutorialStatus: {
        ...prev.tutorialStatus,
        [tutorial.stageId]: status,
      },
    }))

    const playMode: PlayMode = isReview ? 'practice' : 'fromTutorial'
    navigate(`/play/${tutorial.stageId}`, {
      state: { playMode, editorState },
      replace: true,
    })
  }

  return (
    <StageTutorial
      tutorial={tutorial}
      stage={stage}
      onComplete={handleComplete}
      isReview={isReview}
    />
  )
}
