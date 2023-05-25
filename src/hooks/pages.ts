import { useParams } from 'react-router-dom'

export function usePages(): string[] {
    const { '*': path } = useParams()
    return path?.split('/') ?? []
}
