import { createRoot } from 'react-dom/client'
import { WikiPage } from './components/wiki-page'
import {
    createBrowserRouter,
    Link,
    RouterProvider,
    useParams,
} from 'react-router-dom'
import React from 'react'
import { random } from './mediawiki'
import { Game } from './pages/game'
import { Home } from './pages/home'

const router = createBrowserRouter([
    {
        path: '/',
        element: <Home />,
    },
    {
        path: '/wiki/:goal/*',
        element: <Game />,
    },
])

createRoot(document.getElementById('app')!).render(
    <RouterProvider router={router} />,
)
