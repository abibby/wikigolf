import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { generate } from '../game'

export function Home() {
    const navigate = useNavigate()
    const play = useCallback(async () => {
        const game = await generate()
        navigate(`/wiki/${game.end}/${game.start}`)
    }, [navigate])

    return (
        <>
            <h1>WikiGolf</h1>
            <button onClick={play}>Play</button>
        </>
    )
}
