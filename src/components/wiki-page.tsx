import { useEffect, useState } from 'react'
import { parse } from '../mediawiki'
import { useCallback } from 'react'
import { MouseEventHandler } from 'react'
import { useNavigate, useParams, useResolvedPath } from 'react-router-dom'
import { usePages } from '../hooks/pages'

export interface WikiPageProps {
    page: string
}

export function WikiPage({ page }: WikiPageProps) {
    const [html, setHTML] = useState('')
    useEffect(() => {
        parse({ page: page, prop: 'text' }).then(resp => {
            var el = document.createElement('html')
            el.innerHTML = resp.parse.text

            const links = el.querySelectorAll('a')
            for (const link of links) {
                if (!link.href) continue

                const url = new URL(link.href)
                if (
                    url.origin !== location.origin ||
                    !link.pathname.startsWith('/wiki/')
                ) {
                    link.style.backgroundColor = 'red'
                }
            }
            setHTML(el.innerHTML)
        })
    }, [page])
    const navigate = useNavigate()
    const pages = usePages()
    const click = useCallback<MouseEventHandler<HTMLDivElement>>(
        e => {
            e.preventDefault()
            e.stopPropagation()
            const el = e.target
            if (el instanceof HTMLAnchorElement) {
                if (!el.href) return
                const url = new URL(el.href)
                if (
                    url.origin !== location.origin ||
                    !url.pathname.startsWith('/wiki/')
                ) {
                    return
                }
                const name = url.pathname.slice('/wiki/'.length)
                console.log(name)
                navigate(`/wiki/${pages.concat([name]).join('/')}`)
            }
        },
        [navigate, pages],
    )

    // return <div> {html}</div>
    return <div dangerouslySetInnerHTML={{ __html: html }} onClick={click} />
}
