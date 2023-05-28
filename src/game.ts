import { links, random } from './mediawiki'

export interface Game {
    start: string
    end: string
}

export async function generate(): Promise<Game> {
    const start = (await random({ rnlimit: 1 }))[0].title
    const end = (await random({ rnlimit: 1 }))[0].title

    return {
        start: start,
        end: end,
    }
}
