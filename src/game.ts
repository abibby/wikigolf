import { Game } from './db'
import { featured, random } from './mediawiki'

export async function randomGame(): Promise<Game> {
    const start = (await random({ rnlimit: 1 }))[0].title
    const end = (await random({ rnlimit: 1 }))[0].title

    return {
        from: start,
        to: end,
        daily: 0,
        finishedAt: null,
        startedAt: new Date(),
        pages: [start],
    }
}

export async function dailyGame(): Promise<Game> {
    const start = await featured(new Date())
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const end = await featured(yesterday)

    return {
        from: start.tfa.title,
        to: end.tfa.title,
        daily: 0,
        finishedAt: null,
        startedAt: new Date(),
        pages: [start.tfa.title],
    }
}
