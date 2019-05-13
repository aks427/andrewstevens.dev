import Typography from "typography";
import theme from "typography-theme-funston";

theme.baseFontSize = "18px";
const typography = new Typography(theme);

export default typography;
export const rhythm = typography.rhythm;
