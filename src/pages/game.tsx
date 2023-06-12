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
                index: 0,
                daily: 0,
            }
        }
        if (game.index === undefined) {
            game.index = game.pages.length - 1
        }
        return game
    }, [start, goal])

    const current = game?.pages[game.index]

    const match = goal === current

    const pages = game?.pages ?? []

    const navigate = useCallback(
        async (newPage: string) => {
            if (game === undefined) {
                return
            }

            const pages = game.pages
            let i = 0
            for (const page of pages) {
                if (page === newPage) {
                    location.hash = String(i)
                    return
                }
                i++
            }

            const newPages = pages.slice(0, game.index + 1).concat([newPage])
            const newIndex = newPages.length - 1

            if (!arrayEqual(pages, newPages)) {
                db.games.update(game, { pages: newPages })
            }

            location.hash = String(newIndex)
        },
        [game, start, goal],
    )

    useEffect(() => {
        if (game === undefined) return
        if (match && game.finishedAt === null) {
            db.games.update(game, { finishedAt: new Date() })
        }
    }, [match, game])

    useEffect(() => {
        async function hashChange() {
            if (game === undefined) {
                return
            }
            const hashStr = location.hash.slice(1)
            const hash = Number(hashStr)
            if (hashStr === '' || isNaN(hash)) {
                const newURL = new URL(location.href)
                newURL.hash = String(game.index)
                history.replaceState({}, '', newURL)
                return
            }
            await db.games.update(game, { index: hash })
        }

        hashChange()
        window.addEventListener('hashchange', hashChange)
        return () => window.removeEventListener('hashchange', hashChange)
    }, [game])

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
                    {pages.map((page, i) => (
                        <li key={page}>
                            <a
                                href={`#${i}`}
                                className={
                                    i > (game?.index ?? Number.MAX_SAFE_INTEGER)
                                        ? styles.reverted
                                        : ''
                                }
                            >
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
