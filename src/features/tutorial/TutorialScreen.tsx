/**
 * TutorialScreen — standalone route wrapper for StageTutorial.
 * Accepts stageId or nodeId as route param. Delegates to StageTutorial (SSOT).
 */

import { useParams, useNavigate } from 'react-router'
import { useSetAtom } from 'jotai'
import { getTutorial } from '../../data/tutorials'
import { getStage, getStagesByNode } from '../../data/stages'
import { gameProgressAtom } from '../../store/atoms'
import type { TutorialStatus } from '../../types/game'
import type { EditorState } from '../../types/editor'
import { StageTutorial } from '../play/StageTutorial'
import './TutorialScreen.css'

export function TutorialScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const setProgress = useSetAtom(gameProgressAtom)

  // Try stageId first, then nodeId fallback
  const tutorial = id ? (getTutorial(id) ?? getTutorial(id, id)) : undefined
  const isReview = new URLSearchParams(window.location.search).get('review') === '1'

  if (!tutorial) {
    return <div className="tutorial-error">Tutorial not found: {id}</div>
  }

  const stage = getStage(tutorial.stageId)

  const handleComplete = (status: TutorialStatus, editorState?: EditorState) => {
    // Always save tutorialStatus so the tutorial won't replay on normal play
    setProgress((prev) => ({
      ...prev,
      tutorialStatus: {
        ...prev.tutorialStatus,
        [tutorial.stageId]: status,
      },
    }))

    if (isReview) {
      // Navigate to play screen in practice mode with editor state from tutorial
      navigate(`/play/${tutorial.stageId}`, {
        state: { practiceMode: true, reviewEditorState: editorState },
        replace: true,
      })
      return
    }

    const stages = getStagesByNode(tutorial.nodeId)
    if (stages.length > 0) {
      navigate(`/play/${stages[0].id}`)
    } else {
      navigate('/tree')
    }
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
