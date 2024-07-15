import colors from "colors";
import moment from "moment";

/**
 * Logger function, to beutify the console logs
 * @param content
 * @param type
 */
export const log = (
  content: string,
  type:
    | "log"
    | "plain"
    | "info"
    | "warn"
    | "error"
    | "debug"
    | "db"
    | "ready" = "log",
) => {
  const timestamp = `${colors.white(`[${moment().format("DD-MM-YY H:m:s")}]`)}`;

  switch (type) {
    case "log":
      return console.log(`${colors.grey("[LOG]")} ${timestamp} ${content}`);
    case "plain":
      return console.log(`${content}`);
    case "info":
      return console.log(
        `${colors.cyan("[INFO]")} ${timestamp} ${colors.cyan(content)}`,
      );
    case "warn":
      return console.log(
        `${colors.yellow("[WARN]")} ${timestamp} ${colors.yellow(content)} `,
      );
    case "error":
      return console.log(
        `${colors.red("[ERROR]")} ${timestamp} ${colors.red(content)} `,
      );
    case "debug":
      return console.log(
        `${colors.green("[DEBUG]")}  ${timestamp} ${colors.green(content)} `,
      );
    case "db": {
      return console.log(
        `${colors.magenta("[DATABASE]")} ${timestamp} ${colors.magenta(
          content,
        )} `,
      );
    }
    case "ready":
      return console.log(
        `${colors.rainbow("[READY]")}  ${timestamp} ${colors.rainbow(content)}`,
      );
    default:
      throw new TypeError("Logger type not correct.");
  }
};

export const plain = (content: string) => log(content, "plain");
export const info = (content: string) => log(content, "info");
export const warn = (content: string) => log(content, "warn");
export const error = (content: string) => log(content, "error");
export const debug = (content: string) => log(content, "debug");
export const db = (content: string) => log(content, "db");
export const ready = (content: string) => log(content, "ready");
