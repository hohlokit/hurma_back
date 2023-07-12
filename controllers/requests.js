import createHttpError from "http-errors";

import { Requests } from "../models/requests.js";
import { Users } from "../models/users.js";

import requestStatuses from "../enums/request-statuses.js";

export const updateRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    if (!Object.values(requestStatuses).includes(status))
      throw createHttpError(
        400,
        `Status should be one of [${Object.values(requestStatuses).join(", ")}]`
      );

    const request = await Requests.findOne({ id: requestId });
    if (!request)
      throw createHttpError(400, "Cannot find request with provided id");
    if (request.status !== requestStatuses.ON_REVIEW)
      throw createHttpError(
        400,
        `This request already reviewed. Current status: ${request.status}`
      );

    const updated = await Requests.findOneAndUpdate(
      { id: requestId },
      { status },
      { returnDocument: "after" }
    ).populate("user", "id email firstName lastName surname");
    return res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const getRequests = async (req, res, next) => {
  try {
    const {
      limit = 999999,
      offset = 0,
      email = "",
      firstName,
      lastName,
      surname,
    } = req.query;

    const findUsers = {};
    if (email) findUsers.email = { $regex: email };
    if (firstName) findUsers.firstName = { $regex: firstName };
    if (lastName) findUsers.lastName = { $regex: lastName };
    if (surname) findUsers.surname = { $regex: surname };

    const users = await Users.find(findUsers);
    const usersIds = users.map(({ _id }) => _id);

    const query = {
      user: { $in: usersIds },
    };
    const count = await Requests.countDocuments(query);
    const requests = await Requests.find(
      query,
      "-_id -__v -createdAt -updatedAt"
    )
      .skip(limit * offset)
      .limit(limit)
      .populate("user", "-_id -__v -createdAt -updatedAt");

    return res.status(200).json({ count, requests });
  } catch (error) {
    next(error);
  }
};

export const getRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;

    const request = await Requests.findOne({ id: requestId }).populate(
      "user",
      "id email firstName lastName surname"
    );

    return res.status(200).json(request);
  } catch (error) {
    next(error);
  }
};
