import createHttpError from "http-errors";

import { Users } from "../models/users.js";
import saveFile from "../utils/save-file.js";
import userStatuses from "../enums/user-statuses.js";

export const getSelf = async (req, res, next) => {
  try {
    const { id } = req.user;
    console.log(req.user, id);
    const user = await Users.findOne(
      { id },
      {
        password: 0,
        loginCode: 0,
        _id: 0,
        __v: 0,
      }
    );
    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { email, firstName, lastName, surname, phone, birthday } = req.body;
    if (!email) throw createHttpError(400, "Email is missing");
    if (!firstName) throw createHttpError(400, "First name is missing");
    if (!lastName) throw createHttpError(400, "Last name is missing");
    if (!surname) throw createHttpError(400, "Surname is missing");

    const create = { email, firstName, lastName, surname, phone, birthday };
    let avatarData;
    if (req.files) {
      const { avatar } = req.files;

      avatarData = avatar;
      if (avatarData === false) avatarData = deleteAvatar;
      else if (avatarData) {
        const { filename } = await saveFile({
          file: avatar,
          savePath: `/avatars`,
          newFilename: req.user.id,
        });

        create["avatar"] = `/public/avatars/${filename}`;
      }
    }

    const user = await Users.create(create);

    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, surname, email, phone } = req.body;

    const user = await Users.findOne({ id: userId });
    if (!user) throw createHttpError(400, "Cannot find user with provided id");

    const updated = await Users.findOneAndUpdate(
      { id: userId },
      { firstName, lastName, surname, email, phone },
      { returnDocument: "after" }
    );
    return res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await Users.findOne({ id: userId });

    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const { limit, offset } = req.query;

    const _limit = limit || 10;
    const _offset = limit * offset;

    const query = {};
    const users = await Users.find(query).skip(_offset).limit(_limit);
    const count = await Users.countDocuments(query);

    return res.status(200).json({ count, users });
  } catch (error) {
    next(error);
  }
};

export const changeUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    const user = await Users.findOne({ id: userId });
    if (!user) throw createHttpError(400, "Cannot find user with provided id");

    if (!Object.values(userStatuses).includes(status))
      throw createHttpError(
        400,
        `Status should be one of the following: ${Object.values(
          userStatuses
        ).join(", ")}`
      );

    const updated = await Users.findOneAndUpdate(
      { id: userId },
      { status },
      { returnDocument: "after" }
    );
    return res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};
