import createHttpError from "http-errors";
import moment from "moment";

import { Users } from "../models/users";
import { Events } from "../models/events";

export const createEvent = async (req, res, next) => {
  try {
    const { name, description, startDate, endDate } = req.body;

    if (!name) throw createHttpError(400, "Event name is missing");
    if (moment(startDate).isAfter(moment(endDate)))
      throw createHttpError(400, "Start date should not be after end date");

    const curr = await Users.findOne({ id: req.user.id });

    const event = await Events.create({
      name,
      description,
      startDate,
      endDate,
      creators: [curr._id],
    });

    return res.status(200).json(event);
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const { name, description, startDate, endDate } = req.body;

    if (!name) throw createHttpError(400, "Event name is missing");
    if (moment(startDate).isAfter(moment(endDate)))
      throw createHttpError(400, "Start date should not be after end date");

    const event = await Events.updateOne({
      name,
      description,
      startDate,
      endDate,
    });

    return res.status(200).json(event);
  } catch (error) {
    next(error);
  }
};

export const getEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const event = await Events.findOne({ id: eventId })
      .populate("creators", "id email firstName lastName surname avatar")
      .populate("members", "id email firstName lastName surname avatar");

    return res.status(200).json(event);
  } catch (error) {
    next(error);
  }
};

export const getEvents = async (req, res, next) => {
  try {
    const { limit = 999999, offset = 0 } = req.query;

    const events = await Events.find({})
      .skip(offset * limit)
      .limit(limit)
      .populate("creators", "id email firstName lastName surname avatar")
      .populate("members", "id email firstName lastName surname avatar");

    return res.status(200).json(events);
  } catch (error) {
    next(error);
  }
};
