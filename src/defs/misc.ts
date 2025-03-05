const googleThreatTypes = [
  "MALWARE",
  "SOCIAL_ENGINEERING",
  "SOCIAL_ENGINEERING_EXTENDED_COVERAGE",
  "UNWANTED_SOFTWARE",
];

const urlParamString = googleThreatTypes
  .map((type) => `threatTypes=${type}`)
  .join("&");

export { googleThreatTypes, urlParamString };
