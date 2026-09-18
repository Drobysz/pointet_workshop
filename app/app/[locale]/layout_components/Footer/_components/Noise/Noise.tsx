export const Noise = ()=> {
    return (
        <div
            className="
                pointer-events-none
                absolute
                inset-0 z-20
                opacity-3
            "
            style={{
                backgroundImage: "url(/noise.webp)",
                backgroundSize: "100%",

                maskImage: `
                    linear-gradient(
                        to bottom,
                        transparent 0%,
                        black 20%,
                    )
                `,

                WebkitMaskImage: `
                    linear-gradient(
                        to bottom,
                        transparent 0%,
                        black 20%,
                    )
                `,
            }}
        />
    )
}
