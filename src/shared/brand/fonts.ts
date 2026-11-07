// Font brand SeFakta: Poppins (judul ExtraBold, isi Regular). Dimuat lewat @remotion/google-fonts
// (butuh jaringan saat render; Remotion menunggu font siap sebelum menangkap frame).
import {loadFont} from '@remotion/google-fonts/Poppins';

export const FONT_BRAND = loadFont('normal', {weights: ['400', '600', '700', '800'], subsets: ['latin']}).fontFamily;
