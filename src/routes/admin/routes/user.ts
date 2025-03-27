import bcrypt from "bcrypt";
import express from "express";

import { useExtendedData } from "src/db/schema";
import * as logger from "../../../utils/logger";
import { db } from "src/utils/db";
import { users } from "src/db/schema";
import { eq } from "drizzle-orm";
import { getUserInfo } from "src/utils/jwt";

let saltRounds = 10;

const router = express.Router();

/**
 * GET /admin/user
 * @summary Returns a list of all users.
 * @tags User - User Ops
 * @security BearerAuth
 * @return {array<object>} 200 - An array of user objects.
 * @example response - 200 - An array of user objects.
 * [
 *   {
 *     "id": 1,
 *     "name": "John Doe",
 *     "email": "john@example.com",
 *     "role": "basic",
 *     "createdAt": "2021-08-01T00:00:00.000Z",
 *     "updatedAt": "2021-08-01T00:00:00.000Z",
 *     "deleted": false,
 *     "deletedAt": null,
 *     "uuid": "123e4567-e89b-12d3-a456-426614174000"
 *   }
 * ]
 */
router.get("/", async (req, res) => {
  // metrics.increment("endpoint.admin.users.get");
  const dbUsers = await db.query.users.findMany();
  res.status(200).json(dbUsers);
});

/**
 * GET /admin/user/:id
 * @summary Returns a user by their ID.
 * @tags User - User Ops
 * @security BearerAuth
 * @param {number} id.path - The ID of the user to retrieve.
 * @return {object} 200 - A user object.
 * @example response - 200 - A user object.
 * {
 *   "id": 1,
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "role": "basic",
 *   "createdAt": "2021-08-01T00:00:00.000Z",
 *   "updatedAt": "2021-08-01T00:00:00.000Z",
 *   "deleted": false,
 *   "deletedAt": null,
 *   "uuid": "123e4567-e89b-12d3-a456-426614174000"
 * }
 */
router.get("/user/:id", async (req, res) => {
  // metrics.increment("endpoint.admin.user.get");

  try {
    // Process the user request
    const { id } = req.params;

    // Validate ID
    const userId = parseInt(id);
    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({
        message: "Invalid user ID. Must be a positive integer.",
      });
    }

    const dbUser = await db.query.users.findFirst({
      where: (users) => eq(users.id, userId),
    });

    if (!dbUser) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    res.status(200).json(dbUser);

  } catch (error) {
    logger.error(error as string);

    return res.status(500).json({
      message: "An error occurred.",
    });
  }
});

/**
 * PATCH /admin/user/:id
 * @summary Updates a user by their ID.
 * @tags User - User Ops
 * @security BearerAuth
 * @param {number} id.path - The ID of the user to update.
 * @param {object} request.body - User fields to update
 * @param {string} [request.body.email] - Updated email
 * @param {string} [request.body.password] - Updated password
 * @param {string} [request.body.role] - Updated role
 * @return {object} 200 - Success message
 * @example request - Example request
 * {
 *   "email": "newemail@example.com",
 *   "role": "trusted"
 * }
 * @example response - 200 - Success message
 * {
 *   "message": "User updated successfully."
 * }
 */
router.patch("/user/:id", async (req, res) => {
  // metrics.increment("endpoint.admin.user.patch");
  try {
    const { id } = req.params;
    const { email, password, permission } = req.body;

    // Build the data object dynamically
    const updateData: Partial<typeof users.$inferInsert> = {};
    if (email !== undefined) updateData.email = email;
    if (password !== undefined) updateData.password = password;
    if (permission !== undefined) updateData.permissionLevel = permission;

    // Update user
    await db.update(users).set(updateData).where(eq(users.id, parseInt(id)));

    res.status(200).json({
      message: "User updated successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred.",
    });
  }
});

/**
 * POST /admin/user/new
 * @summary Creates a new user.
 * @tags User - User Ops
 * @security BearerAuth
 * @param {object} request.body - User information
 * @return {object} 200 - Success response
 * @example request - Example request
 * {
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "password": "securePassword123"
 * }
 * @example response - 200 - success response
 * {
 *   "message": "User created successfully, please login.",
 *   "uuid": "123e4567-e89b-12d3-a456-426614174000"
 * }
 */
router.post("/user/new", async (req, res) => {
  const body = req.body;

  const { name, email, password } = body;

  if (!name || !email || !password) {
    res
      .status(400)
      .json("Invalid arguments. Please provide name, email, and password");
    return;
  }

  // Check if the user already exists
  const user = await db.query.users.findFirst({
    where: (users) => eq(users.email, email),
  });

  if (user) {
    res.status(400).json("User with that email already exists");
    return;
  }

  const salt = bcrypt.genSaltSync(saltRounds);
  let passHash = await bcrypt.hash(password, salt);

  // Create the user
  const [newUser] = await db.insert(users).values({
    firstName: name,
    lastName: name,
    email: email,
    password: passHash,
  }).returning();

  res.status(200).json({
    message: "User created successfully, please login.",
    uuid: newUser.uuid,
  });
});

/**
 * DELETE /admin/user/:id
 * @summary Deletes a user by their ID.
 * @tags User - User Ops
 * @security BearerAuth
 * @param {number} id.path - The ID of the user to delete.
 * @return {object} 200 - Success message
 * @example response - 200 - Success message
 * {
 *   "message": "User deleted successfully."
 * }
 */
router.delete("/user/:id", async (req, res) => {
  // metrics.increment("endpoint.admin.user.delete");
  try {
    const { id } = req.params;

    // update deleted_at timestamp on user (soft delete)
    await db.update(users).set({
      deleted_at: new Date(),
    }).where(eq(users.id, parseInt(id)));

    res.status(200).json({
      message: "User deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred.",
    });
  }
});

/**
 * PATCH /admin/user/:id/:role/
 * @summary Updates a user's role by their ID.
 * @tags User - User Ops
 * @security BearerAuth
 * @param {number} id.path - The ID of the user to update.
 * @param {string} role.path - The role to update the user to.
 * @return {object} 200 - Success message
 * @example response - 200 - Success message
 * {
 *   "message": "User role updated to *ROLE* successfully."
 * }
 */
router.patch("/role/:id/:role", async (req, res) => {
  // metrics.increment("endpoint.admin.user.role.patch");

  try {

    const requester = await getUserInfo(req);

    const { id, role } = req.params;
    const permission = role;

    if (!id) {
      return res.status(400).json({
        message: "User ID is required.",
      });
    }

    if (!permission) {
      return res.status(400).json({
        message: "Role is required.",
      });
    }

    if (
      permission !== "user" &&
      permission !== "trusted" &&
      permission !== "admin"
    ) {
      return res.status(400).json({
        message: "Invalid role.",
      });
    }

    if (!requester) {
      return res.status(401).json({
        message: "Unauthorized.",
      });
    }

    // don't allow a user to change their own role
    if (parseInt(id) === requester.id) {
      return res.status(400).json({
        message: "Cannot change your own role.",
      });
    }

    // if trying to make a user an admin, check if the requester is an owner (permissionLevel[4])
    if (permission === "admin" && requester.permissionLevel !== "owner") {
      return res.status(403).json({
        message: "Unauthorized.",
      });
    }

    const user = await db.query.users.findFirst({
      where: (users) => eq(users.id, parseInt(id)),
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    await db.update(users).set({
      permissionLevel: permission,
    }).where(eq(users.id, parseInt(id)));

    res.status(200).json({
      message: `User role updated to ${permission} successfully.`,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred.",
    });
  }
});


/**
 * PATCH /admin/user/:id/:useExtended/
 * @summary Updates a user's useExteded data enum
 * @tags User - User Ops
 * @security BearerAuth
 * @param {number} id.path - The ID of the user to update.
 * @param {object} useExtended.path - The useExtended data to update the user to. (off, on, or forced)
 */
router.patch("/useExtended/:id/:useExtended", async (req, res) => {
  // metrics.increment("endpoint.admin.user.useExtended.patch");

  try {
    let { id, useExtended } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "User ID is required.",
      });
    }

    if (!useExtended) {
      return res.status(400).json({
        message: "useExtended data is required.",
      });
    }

    if (
      useExtended !== "off" &&
      useExtended !== "on" &&
      useExtended !== "forced"
    ) {
      return res.status(400).json({
        message: "Invalid useExtended data.",
      });
    }

    const user = await db.query.users.findFirst({
      where: (users) => eq(users.id, parseInt(id)),
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    await db.update(users).set({
      useExtendedData: useExtended,
    }).where(eq(users.id, parseInt(id)));

    res.status(200).json({
      message: `User useExtended data updated to ${useExtended} successfully.`,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred.",
    });
  }
});

export default router;
