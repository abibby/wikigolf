import { Game } from './db'
import { featured, parse, random } from './mediawiki'

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
        from: start.tfa.normalizedtitle,
        to: end.tfa.normalizedtitle,
        daily: 1,
        finishedAt: null,
        startedAt: new Date(),
        pages: [start.tfa.normalizedtitle],
    }
}

export async function parGame(leastClicks: number): Promise<Game> {
    const start = (await random({ rnlimit: 1 }))[0].title
    let current = start

    for (let i = 0; i < leastClicks; i++) {
        const page = await parse({ page: current })
        const next = randomElement(page.links.filter(l => l.ns === 0))
        current = next.title
        await sleep(500)
    }

    return {
        from: start,
        to: current,
        daily: 0,
        finishedAt: null,
        startedAt: new Date(),
        pages: [start],
        leastClicks: leastClicks,
    }
}

function randomElement<T>(list: T[]): T {
    return list[Math.floor(Math.random() * list.length)]
}

function sleep(timeout: number): Promise<void> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, timeout)
    })
}
