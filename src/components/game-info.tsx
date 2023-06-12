import { Game } from '../db'
import React from 'react'

export interface GameInfoProps {
    game: Game
}

export function GameInfo({ game }: GameInfoProps) {
    return (
        <div>
            <div>
                <strong>From:</strong> {game.from}
            </div>
            <div>
                <strong>To:</strong> {game.to}
            </div>
            <div>
                <strong>Clicks:</strong> {game.index}
            </div>
            {game.finishedAt && (
                <div>
                    <strong>Complete</strong>
                </div>
            )}
        </div>
    )
}
