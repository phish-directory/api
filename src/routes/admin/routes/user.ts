import bcrypt from "bcrypt";
import express, { Request, Response } from "express";

import metrics from "../../../metrics";
import { prisma } from "../../../prisma";
import { createCustomer } from "../../../stripe";
import type { User } from "../../../types/enums";

let saltRounds = 10;

const router = express.Router();

/**
 * GET /admin/user
 * @summary Returns a list of all users.
 * @tags User - User Ops
 * @security BearerAuth
 * @return {object} 200 - An array of user objects.
 * @example response - 200 - An array of user objects.
 * [
 *   {
 *     "id": 1,
 *     "email": "
 *     "role": "user",
 *     "createdAt": "2021-08-01T00:00:00.000Z",
 *     "updatedAt": "2021-08-01T00:00:00.000Z",
 *     "deleted": false,
 *     "deletedAt": null
 *   }
 * ]
 */
router.get("/", async (req, res) => {
  metrics.increment("endpoint.admin.users.get");
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
 *   "email": "",
 *   "role": "user",
 *   "createdAt": "2021-08-01T00:00:00.000Z",
 *   "updatedAt": "2021-08-01T00:00:00.000Z",
 *   "deleted": false,
 *   "deletedAt": null
 * }
 */
router.get("/user/:id", async (req, res) => {
  metrics.increment("endpoint.admin.user.get");
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
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
 * @param {object} user.body.required - The user object to update.
 * @return {object} 200 - Success message
 * @example response - 200 - Success message
 * {
 *   "message": "User updated successfully."
 * }
 */
router.patch("/user/:id", async (req, res) => {
  metrics.increment("endpoint.admin.user.patch");
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
 * @param {User} user.body.required - The user object to create.
 * @return {object} 200 - Success message
 * @example response - 200 - Success message
 * {
 *   "message": "User created successfully."
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

  let customer = await createCustomer(email, name);
  let stripeCustomerId = customer.id;

  // Create the user
  const newUser = await prisma.user.create({
    data: {
      name: name,
      email: email,
      password: passHash,
      stripeCustomerId: stripeCustomerId,
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
  metrics.increment("endpoint.admin.user.delete");
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
 * PATCH /admin/user/role/:id/
 * @summary Updates a user's role by their ID.
 * @tags User - User Ops
 * @security BearerAuth
 * @param {number} id.path - The ID of the user to update.
 * @param {string} permission.path - The role to update the user to.
 * @return {object} 200 - Success message
 * @example response - 200 - Success message
 * {
 *   "message": "User role updated to *ROLE* successfully."
 * }
 */
router.patch("/role/:id/:permission", async (req, res) => {
  metrics.increment("endpoint.admin.user.role.patch");

  try {
    const { id, permission } = req.params;

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
