/**
 * @description: DomainType enum, used to define the type of domain
 */
export enum DomainType {
  unknown,
  discord,
  slack,
  instagram,
  twitter,
  facebook,
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
