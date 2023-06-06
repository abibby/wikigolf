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

    const current = game?.pages[game.pages.length - 1]

    const match = goal === current

    const pages = game?.pages ?? []

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
            // location.hash = String(newPages.length)
        },
        [game, start, goal],
    )

    useEffect(() => {
        if (game === undefined) return
        if (match && game.finishedAt === null) {
            db.games.put({
                ...game,
                finishedAt: new Date(),
            })
        }
    }, [match, game])

    // useEffect(() => {
    //     async function hashChange(e: HashChangeEvent) {
    //         if (game === undefined) {
    //             return
    //         }
    //         const hash = Number(new URL(e.newURL).hash.slice(1))
    //         if (isNaN(hash)) {
    //             return
    //         }
    //         console.log(hash)
    //         if (game.pages.length === hash) {
    //             return
    //         }
    //         await db.games.put({
    //             ...game,
    //             pages: game.pages.slice(0, hash - 1),
    //         })

    //         // for (let i = 0; i < game.pages.length; i++) {
    //         //     if (game.pages[i] === hash) {
    //         //         console.log(i, game.pages, game.pages.slice(0, i + 1))

    //         //         db.games.put({
    //         //             ...game,
    //         //             pages: game.pages.slice(0, i + 1),
    //         //         })
    //         //     }
    //         // }
    //     }

    //     window.addEventListener('hashchange', hashChange)
    //     return () => window.removeEventListener('hashchange', hashChange)
    // }, [game])

    return (
        <>
            <nav className={styles.nav + ' mw-parser-output'}>
                <div>
                    <Link to='/'>Home</Link> Clicks: {pages.length - 1}
                </div>
                <h4>
                    <a
                        className='external'
                        target='_blank'
                        href={`https://en.wikipedia.org/wiki/${start}`}
                    >
                        {start}
                    </a>
                    {' > '}
                    <a
                        className='external'
                        target='_blank'
                        href={`https://en.wikipedia.org/wiki/${goal}`}
                    >
                        {goal}
                    </a>
                </h4>
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
                    <div className={styles.match + ' mw-parser-output'}>
                        <h3>Match</h3>
                        <p>
                            You got from{' '}
                            <a
                                className='external'
                                target='_blank'
                                href={`https://en.wikipedia.org/wiki/${start}`}
                            >
                                {start}
                            </a>
                            {' to '}
                            <a
                                className='external'
                                target='_blank'
                                href={`https://en.wikipedia.org/wiki/${goal}`}
                            >
                                {goal}
                            </a>{' '}
                            in {pages.length - 1} clicks
                        </p>
                    </div>
                    <div className={styles.screen}></div>
                </>
            )}
            <main className={styles.main}>
                {current && <WikiPage page={current} onNavigate={navigate} />}
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
