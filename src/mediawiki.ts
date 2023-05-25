async function apiFetch(
    action: string,
    options: Record<string, string | number>,
) {
    const response = await fetch(
        // 'https://mtg.fandom.com/w/api.php?' +
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
    prop: 'text' | 'wikitext'
}

/**
 * @link https://www.mediawiki.org/wiki/API:Parsing_wikitext
 */
export async function parse(options: ParseOptions) {
    return apiFetch('parse', {
        ...options,
        formatversion: 2,
    })
}
