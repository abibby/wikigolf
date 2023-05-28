import { Link, useParams } from 'react-router-dom'
import { WikiPage } from '../components/wiki-page'
import styles from './game.module.css'
import { useCallback, useEffect, useState } from 'react'
import { useHash } from '../hooks/hash'
import { useLiveQuery } from 'dexie-react-hooks'
import { Game as DBGame, db } from '../db'

export function Game() {
    const { goal = '', start = '' } = useParams()

    // const [pages, setPages] = useState<string[]>([])
    const [current, setCurrent] = useHash(start.replace(/_/g, ' '))
    const match = goal === current.replace(/_/g, ' ')
    // useEffect(() => {
    //     if (current === '') {
    //         return
    //     }
    //     setPages(pages => {
    //         const newPages = []
    //         for (const page of pages) {
    //             newPages.push(page)
    //             if (page === current) {
    //                 return newPages
    //             }
    //         }
    //         newPages.push(current)
    //         return newPages
    //     })
    // }, [current])

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
            }
        }
        return game
    }, [start, goal])

    useEffect(() => {
        if (game === undefined) {
            return
        }

        const pages = game.pages
        const newPages = []
        let found = false
        for (const page of pages) {
            newPages.push(page)
            if (page === current) {
                found = true
                break
            }
        }
        if (!found) {
            newPages.push(current)
        }

        if (arrayEqual(pages, newPages)) {
            return
        }

        db.games.put({
            ...game,
            pages: newPages,
        })
    }, [current, game, start, goal])
    const pages = game?.pages ?? []
    const redirect = useCallback(
        (newPage: string) => {
            setCurrent(newPage)

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

    return (
        <>
            <nav className={styles.nav}>
                <h4>
                    {start} -&gt; {goal}
                </h4>
                <div>
                    <Link to='/'>Home</Link>
                </div>
                {pages.map((page, i) => (
                    <span key={page}>
                        {i > 0 && ' -> '}
                        <a href={'#' + page}>{page}</a>
                    </span>
                ))}
                {match && (
                    <div>
                        <h3>Match</h3>
                        <p>
                            You got from {start} to {goal} in {pages.length - 1}{' '}
                            clicks
                        </p>
                    </div>
                )}
            </nav>
            {match && <div className={styles.screen}></div>}
            <main className={styles.main}>
                <WikiPage page={current} onRedirect={redirect} />
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
