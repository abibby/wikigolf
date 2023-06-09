import { Game } from '../db'

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
                <strong>Clicks:</strong> {game.pages.length - 1}
            </div>
            {game.finishedAt && (
                <div>
                    <strong>Complete</strong>
                </div>
            )}
        </div>
    )
}
