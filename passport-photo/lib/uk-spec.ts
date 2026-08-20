/** Published printed size (mm) for shop/counter prints — not the digital file. */
export const UK_PRINT_MM = { width: 35, height: 45 } as const;

/**
 * GOV.UK digital photo: at least 600×750 px (4:5).
 * We export exactly that size so the file matches the published minimum.
 */
export const UK_DIGITAL_PX = { width: 600, height: 750 } as const;

/** Same as GOV.UK minimum; kept as a named check target. */
export const UK_MIN_PX = { width: 600, height: 750 } as const;

export const UK_JPEG_MIN_BYTES = 50 * 1024;
export const UK_JPEG_MAX_BYTES = 10 * 1024 * 1024;

/**
 * Printed head height (chin to crown) should be 29–34 mm of a 45 mm photo.
 * Source: GOV.UK passport photo guidance.
 */
export const HEAD_RATIO_MIN = 29 / 45;
export const HEAD_RATIO_MAX = 34 / 45;
/** ~31 mm on a 45 mm print — inside 29–34 mm, with room for hair and shoulders. */
export const HEAD_RATIO_TARGET = 31 / 45;

/** Plain cream — typical UK counter / digital guidance. */
export const DEFAULT_BACKGROUND = "#eeece8";

export const BACKGROUND_PRESETS = [
  { value: "#eeece8", label: "Cream" },
  { value: "#e8e8e8", label: "Light grey" },
  { value: "#ffffff", label: "White" },
] as const;

export const GOV_UK_PHOTO_GUIDE = "https://www.gov.uk/photos-for-passports";
