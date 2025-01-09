//types/enums.ts

/**
 * @swagger
 * @description Represents different types of accounts in the system
 * @enum {number}
 * @property {number} user - Regular user account
 * @property {number} bot - Automated bot account
 * @property {number} admin - Administrator account with elevated privileges
 */
export enum AccountType {
  user,
  bot,
  admin,
}

/**
 * @swagger
 * @description Defines permission levels for system access
 * @enum {number}
 * @property {number} basic - Basic user permissions with limited access
 * @property {number} trusted - Elevated permissions for trusted users
 * @property {number} admin - Full administrative permissions
 */
export enum Permissions {
  basic,
  trusted,
  admin,
}

/**
 * @swagger
 * @description Categorizes different types of scams or suspicious activities
 * @enum {number}
 * @property {number} postal - Postal/shipping related scams
 * @property {number} banking - Banking and financial scams
 * @property {number} item_scams - Product or item-related scams
 * @property {number} other - Other uncategorized scams
 */
export enum Classifications {
  postal,
  banking,
  item_scams,
  other,
}

/**
 * @swagger
 * @description Defines time periods for metering in Stripe integration
 * @enum {number}
 * @property {number} hour - Hourly metering
 * @property {number} day - Daily metering
 * @property {number} month - Monthly metering
 * @property {number} year - Yearly metering
 * @property {number} alltime - All-time cumulative metering
 */
export enum Metertime {
  hour,
  day,
  month,
  year,
  alltime,
}

/**
 * @swagger
 * @description Represents the final classification verdict for suspicious activities
 * @enum {number}
 * @property {number} postal - Confirmed postal/shipping scam
 * @property {number} banking - Confirmed banking/financial scam
 * @property {number} item_scams - Confirmed product/item scam
 * @property {number} other - Other confirmed scam types
 */
export enum Verdict {
  postal,
  banking,
  item_scams,
  other,
}

/**
 * @swagger
 * @description Available security and threat detection APIs
 * @enum {number}
 * @property {number} SafeBrowsing - Google Safe Browsing API
 * @property {number} IpQualityScore - IP Quality Score API for threat detection
 * @property {number} Phisherman - Phisherman API for phishing detection
 * @property {number} PhishObserver - PhishObserver API for phishing analysis
 * @property {number} PhishReport - PhishReport API for reporting and analyzing phishing attempts
 * @property {number} SecurityTrails - SecurityTrails API for security intelligence
 * @property {number} SinkingYachts - SinkingYachts API for threat detection
 * @property {number} UrlScan - URLScan.io API for URL analysis
 * @property {number} VirusTotal - VirusTotal API for malware detection
 * @property {number} Walshy - Walshy API for security scanning
 */
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
