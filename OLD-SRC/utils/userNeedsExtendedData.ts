import { ExtendedData } from "@prisma/client";
import { Request } from "express";
import { getDbUser } from "./db/getDbUser";
import { getUserInfo } from "./jwt";

/**
 * Function to determine if a user needs extended data
 * - If ExtendedData is off: never use extended data regardless of query
 * - If ExtendedData is on: use extended data only if the query requests it
 * - If ExtendedData is forced: always use extended data regardless of query
 * @param request - Express Request Object
 * @returns boolean
 */
export async function userNeedsExtendedData(request: Request) {
  let user = await getUserInfo(request);
  if (!user) {
    return false;
  }

  let userId = user.id;

  let dbUser = await getDbUser(userId);

  if (!dbUser) {
    return false;
  }

  // Parse the query parameter
  let queryWantsExtendedData: boolean | null = null;

  switch (request.query.extendedData) {
    case "true":
      queryWantsExtendedData = true;
      break;
    case "false":
      queryWantsExtendedData = false;
      break;
    default:
      queryWantsExtendedData = null;
      break;
  }

  // Check database permission setting
  switch (dbUser.useExtendedData) {
    case ExtendedData.off:
      // If ExtendedData is off, never use extended data regardless of query
      return false;
    case ExtendedData.on:
      // If ExtendedData is on, use extended data only if the query requests it
      return queryWantsExtendedData === true;
    case ExtendedData.forced:
      // If ExtendedData is forced, always use extended data regardless of query
      return true;
    default:
      // Default to false for safety if the value is unexpected
      return false;
  }
}
