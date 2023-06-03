declare module '*.module.css' {
    const styles: Record<string, string>
    export default styles
}

declare module 'csstype' {
    interface Properties {
        [index: `--${string}`]: string | number
    }
}
