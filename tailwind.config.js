// tailwind.config.js
module.exports = {
    // 중요: app 폴더와 src 폴더 모두 포함되어 있는지 확인!
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {},
    },
    plugins: [],
};