import { useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { dailyGame, randomGame, parGame } from '../game'
import { bind } from '@zwzn/spicy'
import { Game, db } from '../db'
import styles from './home.module.css'
import { useLiveQuery } from 'dexie-react-hooks'
import differenceInCalendarDays from 'date-fns/esm/differenceInCalendarDays'

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

    const latestGames = useLiveQuery(
        () => db.games.orderBy('startedAt').reverse().limit(5).toArray(),
        [],
    )
    const dailyStats = useDailyStats()

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

            <h2>Latest Games</h2>
            <ul>
                {latestGames?.map(g => (
                    <li key={g.from + g.to}>
                        <Link to={`/from/${g.from}/to/${g.to}`}>
                            {g.from} &gt; {g.to}
                        </Link>
                    </li>
                ))}
            </ul>

            {dailyStats && (
                <>
                    <h2>Stats</h2>
                    <table style={{ '--total-games': dailyStats.totalWins }}>
                        <tbody>
                            {dailyStats.wins.map((count, clicks) => (
                                <tr key={clicks} style={{ '--games': count }}>
                                    <th>{clicks}</th>
                                    <td className={styles.count}>{count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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

interface DailyStats {
    wins: Array<number>
    totalWins: number
    winPercentage: number
    streak: number
}

function useDailyStats(): DailyStats | undefined {
    return useLiveQuery(async (): Promise<DailyStats | undefined> => {
        const games = await db.games.where('daily').equals(1).toArray()
        if (games === undefined) return undefined
        const dailyStats: DailyStats = {
            wins: new Array<number>(),
            totalWins: 0,
            winPercentage: 0,
            streak: 0,
        }
        let finishedGames = 0
        let lastDay: Date | null = null
        for (const game of games) {
            console.log(game)

            if (game.to === game.pages[game.pages.length - 1]) {
                game.finishedAt = new Date()
            }
            if (game.finishedAt !== null) {
                increment(dailyStats.wins, game.pages.length - 1)
                finishedGames++
                if (
                    lastDay === null ||
                    differenceInCalendarDays(lastDay, game.startedAt) > 1
                ) {
                    lastDay = new Date()
                }
            }
        }
        dailyStats.totalWins = finishedGames
        dailyStats.winPercentage = finishedGames / games.length
        if (lastDay) {
            dailyStats.streak = differenceInCalendarDays(lastDay, new Date())
        }
        return dailyStats
    }, [])
}

function increment(m: number[], key: number): void {
    m[key] = (m[key] ?? 0) + 1
}
