// Font yang dimuat secara eksplisit (lewat @remotion/google-fonts) supaya hasil render tidak bergantung pada
// font yang kebetulan terpasang di komputer perender. Remotion menunggu font siap sebelum menangkap frame.
import {loadFont as loadJakarta} from '@remotion/google-fonts/PlusJakartaSans';

// Bobot tertinggi Plus Jakarta Sans = 800; teks berbobot 900 dirender dengan 800. Italic dipakai angka fakta 2D.
export const FONT_JAKARTA = loadJakarta('normal', {weights: ['700', '800'], subsets: ['latin']}).fontFamily;
loadJakarta('italic', {weights: ['800'], subsets: ['latin']});
