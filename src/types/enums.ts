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

/**
 * User w/ Name
 * @typedef {object} User
 * @property {string} name.required - The name of the user
 * @property {string} email.required - The email of the user
 * @property {string} password.required - The password of the user
 */
export type User = {
  name: string;
  email: string;
  password: string;
};

/**
 * User login information
 * @typedef {object} UserLogin
 * @property {string} email.required - The email of the user
 * @property {string} password.required - The password of the user
 */
export type UserLogin = {
  email: string;
  password: string;
};
