import { ZUS } from '../theme/zusPalette';

/**
 * ZUS Color Palette mapped to pension results component naming convention
 * Based on the official ZUS brand colors from the specification
 * GREEN is the primary accent color for headers, active states, etc.
 */
export const zusColors = {
  primary: ZUS.green,     // R: 0; G: 153; B: 63 - Main accent color (headers, active states)
  secondary: ZUS.orange,  // R: 255; G:179; B:79 - Secondary accent color
  success: ZUS.green,     // R: 0; G: 153; B: 63 - Success states
  neutral: ZUS.gray,      // R: 190; G: 195; B: 206 - Neutral elements
  info: ZUS.blue,         // R: 63; G: 132; B: 210 - Information
  dark: ZUS.navy,         // R: 0: G: 65; B: 110 - Dark text
  error: ZUS.red,         // R: 240; G: 94; B: 94 - Error states
  text: ZUS.black,        // R: 0; G: 0; B: 0 - Primary text
};

export default zusColors;