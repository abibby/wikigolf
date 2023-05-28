async function apiFetch(
    action: string,
    options: Record<string, string | number>,
) {
    const response = await fetch(
        'https://en.wikipedia.org/w/api.php?' +
            new URLSearchParams({
                action,
                ...options,
                format: 'json',
                origin: '*',
            }).toString(),
    )

    if (!response.ok) {
        throw new Error(response.statusText)
    }

    return await response.json()
}

export type ParseOptions = {
    page: string
    prop: string
}

export interface ParseResponse {
    jsconfigvars: unknown[]
    modules: string[]
    modulescripts: unknown[]
    modulestyles: string[]
    pageid: number
    text: string
    title: string
}

/**
 * @link https://www.mediawiki.org/wiki/API:Parsing_wikitext
 */
export async function parse(options: ParseOptions): Promise<ParseResponse> {
    const body = await apiFetch('parse', {
        ...options,
        formatversion: 2,
    })
    return body.parse
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
    const resp = await apiFetch('query', {
        ...options,
        list: 'random',
        rnnamespace: '0',
    })

    return resp.query.random
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

    const pages = result.query.pages
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

    let response = await fetch(url, {
        headers: {
            // Authorization: 'Bearer YOUR_ACCESS_TOKEN',
            'Api-User-Agent': 'WikiGolf adam@bibby.io',
        },
    })
    return response.json()
}
