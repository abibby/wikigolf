import { useEffect, useState } from 'react'
import { parse } from '../mediawiki'
import { useCallback } from 'react'
import { MouseEventHandler } from 'react'
import styles from './wiki-page.module.css'

export interface WikiPageProps {
    page: string
    onRedirect: (newPage: string) => void
    onNavigate: (newPage: string) => void
}

export function WikiPage({ page, onRedirect, onNavigate }: WikiPageProps) {
    const [html, setHTML] = useState('')
    const [title, setTitle] = useState('')
    useEffect(() => {
        let stylesheet: HTMLLinkElement | undefined
        setHTML('')
        document.body.scrollTo({ top: 0 })
        parse({
            page: page,
        }).then(resp => {
            const modules = encodeURIComponent(resp.modulestyles.join('|'))
            stylesheet = document.createElement('link')
            stylesheet.rel = 'stylesheet'
            stylesheet.href = `https://en.wikipedia.org/w/load.php?lang=en&modules=${modules}&only=styles&skin=vector-2022`

            document.head.append(stylesheet)

            var el = document.createElement('html')
            el.innerHTML = resp.text
            const redirect = el.querySelector('.redirectText a')
            if (redirect instanceof HTMLAnchorElement) {
                const url = new URL(redirect.href)
                onRedirect(url.pathname.slice('/wiki/'.length))
            }

            const links = el.querySelectorAll('a')
            for (const link of links) {
                if (!link.href) continue

                const url = new URL(link.href)
                link.removeAttribute('href')
                if (
                    url.origin !== location.origin ||
                    !url.pathname.startsWith('/wiki/')
                ) {
                    link.style.cursor = 'not-allowed'
                    if (!link.classList.contains('new')) {
                        link.classList.add(styles.externalLink)
                    }
                    continue
                }
                const page = url.pathname.slice('/wiki/'.length)
                const l = resp.links.find(
                    l =>
                        l.title.toLowerCase() ===
                        page.toLowerCase().replace(/_/g, ' '),
                )
                if (l === undefined) {
                    continue
                }

                link.dataset.page = l?.title
            }

            setTitle(resp.title)
            setHTML(el.innerHTML)
        })

        return () => {
            stylesheet?.remove()
        }
    }, [page])
    const click = useCallback<MouseEventHandler<HTMLDivElement>>(
        e => {
            const el = e.target
            if (!(el instanceof HTMLElement)) {
                return
            }
            const page = el.dataset.page
            if (page === undefined) {
                return
            }
            onNavigate(decodeURIComponent(page))
        },
        [onNavigate],
    )

    if (html === '') {
        return <div>loading</div>
    }
    return (
        <div>
            <h1>{title}</h1>
            <div dangerouslySetInnerHTML={{ __html: html }} onClick={click} />
        </div>
    )
}
