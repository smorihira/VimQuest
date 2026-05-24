/**
 * TutorialScreen — standalone route wrapper for StageTutorial.
 * Delegates all rendering and step logic to StageTutorial (single source of truth).
 */

import { useParams, useNavigate } from 'react-router'
import { useSetAtom } from 'jotai'
import { getTutorial } from '../../data/tutorials'
import { getStage, getStagesByNode } from '../../data/stages'
import { gameProgressAtom } from '../../store/atoms'
import type { TutorialStatus } from '../../types/game'
import { StageTutorial } from '../play/StageTutorial'
import './TutorialScreen.css'

export function TutorialScreen() {
    const { nodeId } = useParams<{ nodeId: string }>()
    const navigate = useNavigate()
    const setProgress = useSetAtom(gameProgressAtom)

    const tutorial = nodeId ? getTutorial(nodeId) : undefined
    if (!tutorial) {
        return <div className="tutorial-error">Tutorial not found: {nodeId}</div>
    }

    const stage = tutorial.stageId ? getStage(tutorial.stageId) : undefined

    const handleComplete = (status: TutorialStatus) => {
        setProgress((prev) => ({
            ...prev,
            tutorialStatus: {
                ...prev.tutorialStatus,
                [tutorial.nodeId]: status,
            },
        }))

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
        />
    )
}
