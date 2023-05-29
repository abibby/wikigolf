import { Link, useParams } from 'react-router-dom'
import { WikiPage } from '../components/wiki-page'
import styles from './game.module.css'
import { useCallback, useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Game as DBGame, db } from '../db'
import { bind } from '@zwzn/spicy'

export function Game() {
    const { goal = '', start = '' } = useParams()

    const game = useLiveQuery(async (): Promise<DBGame> => {
        const game = await db.games
            .where(['from', 'to'])
            .equals([start, goal])
            .first()
        if (game === undefined) {
            return {
                from: start,
                to: goal,
                pages: [start],
                startedAt: new Date(),
                finishedAt: null,
                daily: 0,
            }
        }
        return game
    }, [start, goal])

    const current = game?.pages[game.pages.length - 1].replace(/_/g, ' ')

    const match =
        goal.replace(/_/g, ' ').toLowerCase() === current?.toLowerCase()

    const pages = game?.pages ?? []
    const redirect = useCallback(
        (newPage: string) => {
            if (game === undefined) {
                return
            }
            db.games.put({
                ...game,
                pages: game.pages.slice(0, -1).concat([newPage]),
            })
        },
        [game],
    )

    const navigate = useCallback(
        (newPage: string) => {
            if (game === undefined) {
                return
            }

            const pages = game.pages
            const newPages = []
            let found = false
            for (const page of pages) {
                newPages.push(page)
                if (page === newPage) {
                    found = true
                    break
                }
            }
            if (!found) {
                newPages.push(newPage)
            }

            if (arrayEqual(pages, newPages)) {
                return
            }

            db.games.put({
                ...game,
                pages: newPages,
            })
        },
        [game, start, goal],
    )

    return (
        <>
            <nav className={styles.nav}>
                <h4>
                    {start} -&gt; {goal}
                </h4>
                <div>
                    <Link to='/'>Home</Link> Clicks: {pages.length - 1}
                </div>
                <ul className={styles.pages}>
                    {pages.map(page => (
                        <li key={page}>
                            <a href='#' onClick={bind(page, navigate)}>
                                {page}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
            {match && (
                <>
                    <div className={styles.match}>
                        <h3>Match</h3>
                        <p>
                            You got from {start} to {goal} in {pages.length - 1}{' '}
                            clicks
                        </p>
                    </div>
                    <div className={styles.screen}></div>
                </>
            )}
            <main className={styles.main}>
                {current && (
                    <WikiPage
                        page={current}
                        onRedirect={redirect}
                        onNavigate={navigate}
                    />
                )}
            </main>
        </>
    )
}

function arrayEqual<T>(a: T[], b: T[]): boolean {
    if (a.length !== b.length) {
        return false
    }
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false
        }
    }
    return true
}
