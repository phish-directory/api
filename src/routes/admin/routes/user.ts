import bcrypt from "bcrypt";
import express from "express";

import { prisma } from "../../../prisma";

let saltRounds = 10;

const router = express.Router();

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
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        id: "asc",
      },
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching users." });
  }
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

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }
  } catch (error) {
    console.log(error);

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
    const updateData = {};
    // @ts-expect-error
    if (email !== undefined) updateData.email = email;
    // @ts-expect-error
    if (password !== undefined) updateData.password = password;
    // @ts-expect-error
    if (permission !== undefined) updateData.permission = permission;

    // Update user
    await prisma.user.update({
      where: {
        id: parseInt(id),
      },
      data: updateData,
    });

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
 * @param {User} request.body - User information
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
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (user) {
    res.status(400).json("User with that email already exists");
    return;
  }

  const salt = bcrypt.genSaltSync(saltRounds);
  let passHash = await bcrypt.hash(password, salt);

  // Create the user
  const newUser = await prisma.user.create({
    data: {
      name: name,
      email: email,
      password: passHash,
    },
  });

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

    await prisma.user.update({
      where: {
        id: parseInt(id),
      },
      data: {
        deletedAt: new Date(),
        deleted: true,
      },
    });

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
      permission !== "basic" &&
      permission !== "trusted" &&
      permission !== "admin"
    ) {
      return res.status(400).json({
        message: "Invalid role.",
      });
    }

    let user = await prisma.user.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    await prisma.user
      .update({
        where: {
          id: parseInt(id),
        },
        data: {
          permission: permission,
        },
      })
      .then(() => {
        res.status(200).json({
          message: `User role updated to ${permission} successfully.`,
        });
      });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred.",
    });
  }
});

export default router;
