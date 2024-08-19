export enum AccountType {
  user,
  bot,
  admin,
}

export enum Permissions {
  basic,
  trusted,
  admin,
}

export enum Classifications {
  postal,
  banking,
  item_scams,
  other,
}

/**
 * @description: Metertime enum, used to define the time period for the meter for stripe
 */
export enum Metertime {
  hour,
  day,
  month,
  year,
  alltime,
}

export enum Verdict {
  postal,
  banking,
  item_scams,
  other,
}

export enum APIs {
  SafeBrowsing,
  IpQualityScore,
  Phisherman,
  PhishObserver,
  PhishReport,
  SecurityTrails,
  SinkingYachts,
  UrlScan,
  VirusTotal,
  Walshy,
}
