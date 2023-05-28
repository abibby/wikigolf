import { useCallback, useEffect, useState } from 'react'

export function useHash(defaultValue = ''): [string, (v: string) => void] {
    const [hash, setHash] = useState(
        decodeURIComponent(location.hash.slice(1)) ?? defaultValue,
    )
    useEffect(() => {
        function hashChange(e: HashChangeEvent) {
            const url = new URL(e.newURL)
            setHash(decodeURIComponent(url.hash.slice(1)))
        }

        if (location.hash === '') {
            location.hash = defaultValue
        }

        window.addEventListener('hashchange', hashChange)
        return () => window.removeEventListener('hashchange', hashChange)
    }, [defaultValue])
    const setPageHash = useCallback((newHash: string) => {
        location.hash = newHash
    }, [])
    return [hash, setPageHash]
}
