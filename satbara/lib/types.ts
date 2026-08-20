export type GeoVillage = {
  name: string;
  /** Optional post office / pin area label. */
  post?: string;
};

export type GeoTaluka = {
  name: string;
  villages: GeoVillage[];
};

export type GeoDistrict = {
  name: string;
  /** Alternate spellings / former names for search. */
  aliases?: string[];
  talukas: GeoTaluka[];
};

export type LandOwner = {
  fullName: string;
  surname: string;
};

export type LandRecord = {
  id: string;
  surveyNo: string;
  owners: LandOwner[];
  district: string;
  taluka: string;
  village: string;
  post: string;
  areaHa: number;
  landType: "Jirayat" | "Bagayat" | "Pot Kharab" | "Class II" | "Gairan";
  crop?: string;
  khataNo?: string;
};

export type SearchFilters = {
  surname: string;
  district: string;
  taluka: string;
  villageOrPost: string;
};

export type SearchHit = LandRecord & {
  matchedOn: Array<"surname" | "district" | "taluka" | "village" | "post">;
};
