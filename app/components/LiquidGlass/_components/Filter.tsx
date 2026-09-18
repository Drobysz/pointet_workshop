import styles from "../lg.module.scss";

export const Filter = ()=> {
	return (
		<svg
        className={styles.liquidGlass_defs}
        aria-hidden="true"
        focusable="false"
        width="0"
        height="0"
      >
        <filter
          id="lg-glass-distortion"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012"
            numOctaves="2"
            seed="2"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="18"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
	)
}