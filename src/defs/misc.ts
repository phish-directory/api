const googleThreatTypes = [
  "MALWARE",
  "SOCIAL_ENGINEERING",
  "UNWANTED_SOFTWARE",
];

const urlParamString = googleThreatTypes
  .map((type) => `threatTypes=${type}`)
  .join("&");

export { googleThreatTypes, urlParamString };
