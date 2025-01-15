/** @type {import('tailwindcss').Config} */
export default {
	content: ["./**/*.html"],
	theme: {
		extend: {
			colors: {
				background: "var(--background)",
				foreground: "var(--foreground)",
			},
		},
	},
	plugins: [],
};
