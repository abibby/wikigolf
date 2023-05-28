import { Article, featured, links, random } from './mediawiki'

export interface Game {
    start: string
    end: string
}

const dateFormatter = Intl.DateTimeFormat('en-ca', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
})

export async function generate(): Promise<Game> {
    const start = (await random({ rnlimit: 1 }))[0].title
    const end = (await random({ rnlimit: 1 }))[0].title

    return {
        start: start,
        end: end,
    }
}

export async function daily(): Promise<Game> {
    // console.log(
    //     await links({
    //         title:
    //             "Wikipedia:Today's_featured_article/" +
    //             dateFormatter.format(new Date()).replace(/ /g, '_'),
    //     }),
    // )

    const start = await featured(new Date())
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const end = await featured(yesterday)

    return {
        start: start.tfa.title,
        end: end.tfa.title,
    }
}
