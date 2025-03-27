import express from "express";
import { SlackInviteService } from "./services/SlackInviteService";

export const app = express();

// // Process any uninvited users on startup
// SlackInviteService.inviteUninvitedUsers().catch(error => {
//   console.error("Failed to process uninvited users on startup:", error);
// });
