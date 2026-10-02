import { 
    Montserrat,
    Purple_Purse,
	Inter,
	Six_Caps,
	Climate_Crisis,
	Cutive_Mono,
	Tiny5,
	Jersey_10,
} from "next/font/google";
import localFont from 'next/font/local';

export const jersey10 = Jersey_10({
	weight: "400",
});

export const climate_crisis = Climate_Crisis({
	variable: '--font_climate_crisis_sm'
});

export const tinyFive = Tiny5({
	weight: '400',
	subsets: ['latin'],
	variable: '--font_tiny_five_rg'
});

export const cutiveMono = Cutive_Mono({
	weight: '400',
	subsets: ['latin'],
	variable: '--font_cutive_mono_rg'
});

export const sixCaps = Six_Caps({
	weight: '400',
	subsets: ['latin'],
	variable: '--font_six_caps_sm'
});

export const purplePurse = Purple_Purse({
	weight: '400',
	subsets: ['latin'],
	variable: '--font_purple_purse_sm'
});

export const inter_regular = Inter({
	weight: '400',
	subsets: ['latin', 'cyrillic'],
	variable: '--font_inter_rg'
});

export const inter_medium = Inter({
	weight: '500',
	subsets: ['latin', 'cyrillic'],
	variable: '--font_inter_md'
});

export const inter_semibold = Inter({
	weight: '600',
	subsets: ['latin', 'cyrillic'],
	variable: '--font_inter_sm'
});

export const monserrat_regular = Montserrat({
	weight: '400',
	subsets: ['latin', 'cyrillic'],
	variable: '--font_monserrat_rg'
});

export const monserrat_medium = Montserrat({
	weight: '500',
	subsets: ['latin', 'cyrillic'],
	variable: '--font_monserrat_md'
});

export const monserrat_semibold = Montserrat({
	weight: '600',
	subsets: ['latin', 'cyrillic'],
	variable: '--font_monserrat_sm'
});

export const doppelganger = localFont({
  src: "./Doppelganger-Display.ttf"
});

export const after = localFont({
  src: "./after-regular.otf"
});
