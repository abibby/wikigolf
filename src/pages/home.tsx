import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { dailyGame, randomGame, parGame } from '../game'
import { bind } from '@zwzn/spicy'
import { Game, db } from '../db'

export function Home() {
    const [loading, setLoading] = useState(false)
    const [par, setPar] = useState(5)
    const navigate = useNavigate()
    const play = useCallback(
        async (newGame: () => Promise<Game>) => {
            setLoading(true)
            const game = await newGame()

            const hasGame = await db.games
                .where(['from', 'to'])
                .equals([game.from, game.to])
                .count()

            if (hasGame === 0) {
                await db.games.add(game)
            }
            setLoading(false)
            navigate(`/from/${game.from}/to/${game.to}`)
        },
        [navigate],
    )

    const addPar = useCallback(() => setPar(p => p + 1), [])
    const subPar = useCallback(() => setPar(p => p - 1), [])

    const parGameWithPar = useCallback(() => {
        return parGame(par)
    }, [par])

    return (
        <>
            <h1>WikiGolf</h1>
            <p>
                <button onClick={bind(randomGame, play)}>Random</button>
            </p>
            <p>
                <button onClick={bind(dailyGame, play)}>Daily</button>
            </p>
            <p>
                <button onClick={subPar}>-</button>
                <button onClick={bind(parGameWithPar, play)}>Par {par}</button>
                <button onClick={addPar}>+</button>
            </p>
            {loading && <p>loading new game</p>}
        </>
    )
}
