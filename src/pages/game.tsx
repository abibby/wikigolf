import { Link, useParams } from 'react-router-dom'
import { WikiPage } from '../components/wiki-page'
import styles from './game.module.css'

export function Game() {
    const { goal = '', '*': path = '' } = useParams()
    const pages = path.split('/') ?? []
    const name = pages[pages.length - 1]

    const start = pages[0]
    const current = pages[pages.length - 1]

    const match = goal === current.replace(/_/g, ' ')

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
                        <Link to={`/wiki/${pages.slice(0, i + 1).join('/')}`}>
                            {page}
                        </Link>
                    </span>
                ))}
                {match && (
                    <div>
                        <h3>Match</h3>
                        <p>You found got there in {pages.length} clicks</p>
                    </div>
                )}
            </nav>
            {match && <div className={styles.screen}></div>}
            <main className={styles.main}>
                <WikiPage page={name} pages={[goal, ...pages]} />
            </main>
        </>
    )
}
