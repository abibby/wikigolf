import react from '@vitejs/plugin-react'

/**
 * @type {import('vite').UserConfig}
 */
const config = {
    server: {
        port: 32245
    },
    plugins: [react()],

}

export default config
