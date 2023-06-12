import { DailyStats } from '../hooks/daily-stats'
import styles from './stats.module.css'
import React from 'react'

export interface StatsProps {
    stats: DailyStats
}

export function Stats({ stats }: StatsProps) {
    return (
        <table className={styles.root} style={{ '--max-games': stats.maxWins }}>
            <tbody>
                {stats.wins.map((count, clicks) => (
                    <tr key={clicks} style={{ '--games': count }}>
                        <th className={styles.clicks}>{clicks}</th>
                        <td className={styles.count}>{count}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
