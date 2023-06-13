import React, { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { dailyGame, randomGame, parGame, link } from '../game'
import { bind } from '@zwzn/spicy'
import { Game, db } from '../db'
import styles from './home.module.css'
import { useLiveQuery } from 'dexie-react-hooks'
import { Stats } from '../components/stats'
import { useGameStats } from '../hooks/daily-stats'
import { GameInfo } from '../components/game-info'

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
            navigate(link(game))
        },
        [navigate],
    )

    const addPar = useCallback(() => setPar(p => p + 1), [])
    const subPar = useCallback(() => setPar(p => p - 1), [])

    const parGameWithPar = useCallback(() => {
        return parGame(par)
    }, [par])
    const getDailyGame = useCallback(async () => daily ?? dailyGame(), [daily])

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
            <h2>Daily Game</h2>
            <div>
                {daily && (
                    <a onClick={bind(getDailyGame, play)}>
                        <GameInfo game={daily} />
                    </a>
                )}
            </div>
            <h2>New Game</h2>
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
                            <GameInfo game={g} />
                            {/* {g.from} &gt; {g.to} | {g.pages.length - 1} */}
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
