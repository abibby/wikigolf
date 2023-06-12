import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import React from 'react'
import { Game } from './pages/game'
import { Home } from './pages/home'
import './app.css'

const router = createBrowserRouter([
    {
        path: '/',
        element: <Home />,
    },
    {
        path: '/from/:start/to/:goal',
        element: <Game />,
    },
])

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('app')!).render(
    <RouterProvider router={router} />,
)
