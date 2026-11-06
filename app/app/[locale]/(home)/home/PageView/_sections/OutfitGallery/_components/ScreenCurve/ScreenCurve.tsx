import s from "./style.module.scss";

const curveStops = Array.from({ length: 17 }, (_, index) => {
    const offset = index / 16;
    const strength = 4 * offset * (1 - offset);
    return `<stop offset="${offset}" stop-color="white"
        stop-opacity="${strength}"/>`;
}).join("");

// Mid-gray is neutral. Green moves the top and bottom inward, with the
// strongest displacement at the center and no displacement at the sides.
const map = `
    <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">
        <defs>
            <linearGradient id="vertical" x2="0" y2="1">
                <stop stop-color="#800000"/>
                <stop offset="1" stop-color="#80ff00"/>
            </linearGradient>
            <linearGradient id="horizontal">
                ${curveStops}
            </linearGradient>
            <mask id="strength" style="mask-type: alpha">
                <rect width="256" height="256" fill="url(#horizontal)"/>
            </mask>
        </defs>
        <rect width="256" height="256" fill="#808000"/>
        <rect width="256" height="256" fill="url(#vertical)"
            mask="url(#strength)"/>
    </svg>
`;

const mapUrl = `data:image/svg+xml,${encodeURIComponent(map)}`;

export const ScreenCurve = ({ id }: { id: string }) => (
    <svg className={s.definitions} aria-hidden="true">
        <defs>
            <filter
                id={id}
                x="0"
                y="0"
                width="1"
                height="1"
                filterUnits="objectBoundingBox"
                primitiveUnits="objectBoundingBox"
                colorInterpolationFilters="sRGB"
            >
                <feImage
                    href={mapUrl}
                    x="0"
                    y="0"
                    width="1"
                    height="1"
                    preserveAspectRatio="none"
                    result="curveMap"
                />
                <feDisplacementMap
                    in="SourceGraphic"
                    in2="curveMap"
                    scale={0.036}
                    xChannelSelector="R"
                    yChannelSelector="G"
                />
            </filter>
        </defs>
    </svg>
);
