import { links, random } from './mediawiki'

export interface Game {
    start: string
    end: string
    clicks: number
}

export async function generate(): Promise<Game> {
    const clicks = 5

    const start = (await random({ rnlimit: 1 }))[0].title
    const end = (await random({ rnlimit: 1 }))[0].title
    // let pages = [start]
    // while (pages.length < 5) {
    //     const current = pages[pages.length - 1]
    //     const l = await links({ title: current })
    //     if (l === undefined) {
    //         pages = pages.slice(0, -1)
    //     } else {
    //         pages.push(randomItem(l).title)
    //     }
    // }
    // console.log(pages)

    // const end = pages[pages.length - 1]

    return {
        start: start,
        end: end,
        clicks: clicks,
    }
}

function randomItem<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)]
}
