import { db } from './db'
import { day, week } from './time'
import { Split } from './types'

async function cacheFetch(
    input: string,
    init: RequestInit,
    ttl: number,
): Promise<any> {
    if (ttl > 0) {
        const cache = await db.responseCache.get(input)
        if (cache !== undefined) {
            return cache.body
        }
    }
    const resp = await fetch(input, init)

    if (!resp.ok) {
        throw new Error(resp.statusText)
    }

    const data = await resp.json()
    if (ttl > 0) {
        await db.responseCache.put({ url: input, body: data })
    }

    return data
}

async function apiFetch(
    action: string,
    options: Record<string, string | number>,
    ttl: number = day,
) {
    const body = await cacheFetch(
        'https://en.wikipedia.org/w/api.php?' +
            new URLSearchParams({
                action,
                ...options,
                format: 'json',
                origin: '*',
            }).toString(),
        {},
        ttl,
    )

    if ('warnings' in body) {
        console.warn(body.warnings[action].warnings)
    }

    return body[action]
}

export type ParseOptions = {
    page: string
}

export interface Link {
    ns: number
    title: string
    exists: boolean
}

export interface ParseResponse {
    jsconfigvars: unknown[]
    modules: string[]
    modulescripts: unknown[]
    modulestyles: string[]
    pageid: number
    text: string
    title: string
    links: Link[]
}

/**
 * @link https://www.mediawiki.org/wiki/API:Parsing_wikitext
 */
export async function parse<T extends string>(
    options: ParseOptions,
): Promise<ParseResponse> {
    const body = await apiFetch('parse', {
        ...options,
        prop: 'text|modules|jsconfigvars|links',
        formatversion: 2,
    })

    return body
}

export type RandomOptions = {
    rnlimit: number
}
export type RandomResult = {
    id: number
    ns: number
    title: string
}[]

/**
 * @link https://www.mediawiki.org/wiki/API:Random
 */
export async function random(options: RandomOptions): Promise<RandomResult> {
    const resp = await apiFetch(
        'query',
        {
            ...options,
            list: 'random',
            rnnamespace: '0',
        },
        0,
    )

    return resp.random
}

export type LinksOptions = {
    title: string
}
export type LinksResult = {
    ns: number
    title: string
}[]

/**
 * @link https://www.mediawiki.org/wiki/API:Links
 */
export async function links(
    options: LinksOptions,
): Promise<LinksResult | undefined> {
    const result = await apiFetch('query', {
        titles: options.title,
        pllimit: 500,
        plnamespace: 0,
        prop: 'links',
    })

    // TODO: loop with more than 500 links

    const pages = result.pages
    return pages[Object.keys(pages)[0]].links
}

export interface Article {
    type: string
    title: string
    displaytitle: string
    namespace: { id: number; text: string }
    wikibase_item: string
    titles: {
        canonical: string
        normalized: string
        display: string
    }
    pageid: 57358746
    thumbnail: {
        source: string
        width: number
        height: number
    }
    originalimage: {
        source: string
        width: number
        height: number
    }
    lang: string
    dir: string
    revision: string
    tid: string
    timestamp: string
    description: string
    description_source: string
    content_urls: {
        desktop: {
            page: string
            revisions: string
            edit: string
            talk: string
        }
        mobile: {
            page: string
            revisions: string
            edit: string
            talk: string
        }
    }
    extract: string
    extract_html: string
    normalizedtitle: string
}
export interface FeaturedResponse {
    tfa: Article
    mostread: {
        date: string
        articles: Article[]
    }
    image: unknown
    news: unknown
    onthisday: unknown
}

export async function featured(date: Date): Promise<FeaturedResponse> {
    // Get today's featured content from English Wikipedia
    let year = date.getFullYear()
    let month = String(date.getMonth() + 1).padStart(2, '0')
    let day = String(date.getDate()).padStart(2, '0')
    let url = `https://api.wikimedia.org/feed/v1/wikipedia/en/featured/${year}/${month}/${day}`

    return await cacheFetch(
        url,
        {
            headers: {
                'Api-User-Agent': 'WikiGolf adam@bibby.io',
            },
        },
        week * 4,
    )
}
