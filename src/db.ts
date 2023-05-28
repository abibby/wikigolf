import Dexie, { Table } from 'dexie'

export interface Game {
    from: string
    to: string
    pages: string[]
    startedAt: Date
    finishedAt: Date | null
}

export class WikiGolfDatabase extends Dexie {
    games!: Table<Game>

    constructor() {
        super('wikigolf')
        this.version(1).stores({
            games: '[from+to]', // Primary key and indexed props
        })
    }
}

export const db = new WikiGolfDatabase()
