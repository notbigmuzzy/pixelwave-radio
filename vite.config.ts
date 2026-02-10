import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
	plugins: [react()],
	base: '/pixelwave-radio/',
	server: {
		host: true,
		hmr: false
	}
})
