import Dexie, { Table } from 'dexie'

export interface Game {
    from: string
    to: string
    pages: string[]
    startedAt: Date
    finishedAt: Date | null
    daily: number
    leastClicks?: number
}

export interface ResponseCache {
    url: string
    body: unknown
}

export class WikiGolfDatabase extends Dexie {
    games!: Table<Game>
    responseCache!: Table<ResponseCache>

    constructor() {
        super('wikigolf')
        this.version(3).stores({
            games: '[from+to],daily,startedAt',
            responseCache: 'url',
        })
        this.version(2).stores({
            games: '[from+to],daily',
            responseCache: 'url',
        })
        this.version(1).stores({
            games: '[from+to],daily',
        })
    }
}

export const db = new WikiGolfDatabase()
