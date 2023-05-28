import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { daily, generate } from '../game'

export function Home() {
    const navigate = useNavigate()
    const playRandom = useCallback(async () => {
        const game = await generate()
        navigate(`/from/${game.start}/to/${game.end}`)
    }, [navigate])
    const playDaily = useCallback(async () => {
        const game = await daily()
        navigate(`/from/${game.start}/to/${game.end}`)
    }, [navigate])

    return (
        <>
            <h1>WikiGolf</h1>
            <button onClick={playRandom}>Play</button>
            <button onClick={playDaily}>Daily</button>
        </>
    )
}
