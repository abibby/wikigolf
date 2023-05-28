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
