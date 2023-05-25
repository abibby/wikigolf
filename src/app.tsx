import { createRoot } from 'react-dom/client'
import { WikiPage } from './components/wiki-page'
import {
    createBrowserRouter,
    Link,
    RouterProvider,
    useParams,
} from 'react-router-dom'
import React from 'react'
import { usePages } from './hooks/pages'

function App() {
    const pages = usePages()
    const name = pages[pages.length - 1]
    console.log(pages)

    return (
        <>
            {/* <h1>Hello World</h1> */}
            {pages.map((page, i) => (
                <>
                    {' -> '}
                    <Link to={`/wiki/${pages.slice(0, i + 1).join('/')}`}>
                        {page}
                    </Link>
                </>
            ))}
            {name && <WikiPage page={name} />}
        </>
    )
}
const router = createBrowserRouter([
    {
        path: '/wiki/*',
        element: <App />,
    },
])
createRoot(document.getElementById('app')!).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>,
)
