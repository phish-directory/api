// make sure to update this in schema.prisma as well
export enum DomainType {
  unknown,
  discord,
  slack,
  instagram,
  twitter,
  facebook,
  other,
}

export enum Metertime {
  hour,
  day,
  month,
  year,
  alltime,
}
