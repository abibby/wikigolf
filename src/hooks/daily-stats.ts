import { useLiveQuery } from 'dexie-react-hooks'
import { Game, db } from '../db'
import differenceInCalendarDays from 'date-fns/esm/differenceInCalendarDays'
import { useCallback } from 'react'

export interface DailyStats {
    wins: Array<number>
    totalWins: number
    maxWins: number
    winPercentage: number
    streak: number
}

export function useGameStats(
    querier: () => Promise<Game[]>,
    deps: React.DependencyList,
): DailyStats | undefined {
    const cb = useCallback(querier, deps)
    return useLiveQuery(async (): Promise<DailyStats | undefined> => {
        const games = await cb()
        if (games === undefined) return undefined
        const dailyStats: DailyStats = {
            wins: new Array<number>(),
            totalWins: 0,
            maxWins: 0,
            winPercentage: 0,
            streak: 0,
        }
        let finishedGames = 0
        let lastDay: Date | null = null
        for (const game of games) {
            if (game.to === game.pages[game.pages.length - 1]) {
                game.finishedAt = new Date()
            }
            if (game.finishedAt !== null) {
                const wins = increment(dailyStats.wins, game.pages.length - 1)
                console.log(wins)

                dailyStats.maxWins = Math.max(dailyStats.maxWins, wins)
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

function increment(m: number[], key: number): number {
    const value = (m[key] ?? 0) + 1
    m[key] = value
    return value
}
