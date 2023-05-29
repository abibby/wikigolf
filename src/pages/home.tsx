import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { dailyGame, randomGame } from '../game'
import { bind } from '@zwzn/spicy'
import { Game, db } from '../db'

export function Home() {
    const navigate = useNavigate()
    const play = useCallback(
        async (newGame: () => Promise<Game>) => {
            const game = await newGame()

            const hasGame = await db.games
                .where(['from', 'to'])
                .equals([game.from, game.to])
                .count()

            if (hasGame === 0) {
                await db.games.add(game)
            }
            navigate(`/from/${game.from}/to/${game.to}`)
        },
        [navigate],
    )

    return (
        <>
            <h1>WikiGolf</h1>
            <button onClick={bind(randomGame, play)}>Random</button>
            <button onClick={bind(dailyGame, play)}>Daily</button>
        </>
    )
}
