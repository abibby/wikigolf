import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { dailyGame, randomGame, parGame } from '../game'
import { bind } from '@zwzn/spicy'
import { Game, db } from '../db'
import styles from './home.module.css'
import { useLiveQuery } from 'dexie-react-hooks'
import differenceInCalendarDays from 'date-fns/esm/differenceInCalendarDays'
import { Stats } from '../components/stats'
import { useGameStats } from '../hooks/daily-stats'

export function Home() {
    const [loading, setLoading] = useState(false)
    const [par, setPar] = useState(5)
    const [daily, setDaily] = useState<Game>()
    const navigate = useNavigate()

    useEffect(() => {
        dailyGame().then(async game => {
            const g = await db.games
                .where(['from', 'to'])
                .equals([game.from, game.to])
                .toArray()
            setDaily(g[0] ?? game)
        })
    }, [])

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

    const latestGames = useLiveQuery(
        () => db.games.orderBy('startedAt').reverse().limit(5).toArray(),
        [],
    )
    const dailyStats = useGameStats(
        () => db.games.where('daily').equals(1).toArray(),
        [],
    )
    const allStats = useGameStats(() => db.games.toArray(), [])

    return (
        <>
            <h1>WikiGolf</h1>
            <p>
                <button onClick={bind(dailyGame, play)}>Daily</button>
                {daily && (
                    <div>
                        {daily.from}
                        {' > '}
                        {daily.to}
                        {' | '}
                        {daily.pages.length - 1}
                    </div>
                )}
            </p>
            <p>
                <button onClick={bind(randomGame, play)}>Random</button>
            </p>
            <p>
                <button onClick={subPar}>-</button>
                <button onClick={bind(parGameWithPar, play)}>Par {par}</button>
                <button onClick={addPar}>+</button>
            </p>

            <h2>Latest Games</h2>
            <ul>
                {latestGames?.map(g => (
                    <li key={g.from + g.to}>
                        <Link to={`/from/${g.from}/to/${g.to}`}>
                            {g.from} &gt; {g.to} | {g.pages.length - 1}
                        </Link>
                    </li>
                ))}
            </ul>

            {dailyStats && (
                <>
                    <h2>Daily Stats</h2>
                    <Stats stats={dailyStats} />
                </>
            )}
            {allStats && (
                <>
                    <h2>Stats</h2>
                    <Stats stats={allStats} />
                </>
            )}
            {loading && (
                <>
                    <div className={styles.screen}></div>
                    <div className={styles.loading}>Loading new game...</div>
                </>
            )}
        </>
    )
}
