import createHttpError from "http-errors";
import moment from "moment";

import saveFile from "../utils/save-file.js";
import { Users } from "../models/users.js";
import { Events } from "../models/events.js";

export const createEvent = async (req, res, next) => {
  try {
    const { name, description, startDate, endDate } = req.body;

    if (!name) throw createHttpError(400, "Event name is missing");
    if (!startDate || !endDate)
      throw createHttpError("Provide both of start and end dates");
    if (moment(startDate).isAfter(endDate))
      throw createHttpError(400, "Start date should be before end");
    if (moment(startDate).isBefore(moment))
      throw createHttpError(400, "Start date should be in future");

    const create = {
      name,
      description,
      startDate,
      endDate,
    };

    let eventBanner;
    if (req.files) {
      const { banner } = req.files;

      eventBanner = banner;
      if (eventBanner) {
        const { filename } = await saveFile({
          file: banner,
          savePath: `/banners`,
          newFilename: req.user.id,
        });

        create["banner"] = `/public/banners/${filename}`;
      }
    }

    const curr = await Users.findOne({ id: req.user.id });
    create["creators"] = [curr._id];

    const event = await Events.create(create);

    return res.status(200).json(event);
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const { name, description, startDate, endDate } = req.body;
    const { eventId } = req.params;

    if (!name) throw createHttpError(400, "Event name is missing");
    if (moment(startDate).isAfter(moment(endDate)))
      throw createHttpError(400, "Start date should not be after end date");
    const upd = { name, description, startDate, endDate };
    let eventBanner;
    if (req.files) {
      const { banner } = req.files;

      eventBanner = banner;
      if (eventBanner === false) {
        eventBanner = null;

        upd["banner"] = null;
      } else if (eventBanner) {
        const { filename } = await saveFile({
          file: banner,
          savePath: `/banners`,
          newFilename: req.user.id,
        });

        upd["banner"] = `/public/banners/${filename}`;
      }
    }

    const event = await Events.updateOne({ id: eventId }, upd);

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
    const { limit = 999999, offset = 0, name, startDate, endDate } = req.query;

    const query = {};

    if (name) query.name = { $regex: name };
    if (startDate) {
      query.startDate = { $gte: startDate };
    }
    if (endDate) {
      query.endDate = { $lte: endDate };
    }

    const events = await Events.find(query)
      .skip(offset * limit)
      .limit(limit)
      .populate("creators", "id email firstName lastName surname avatar")
      .populate("members", "id email firstName lastName surname avatar");

    const count = await Events.countDocuments(query);

    return res.status(200).json({ events, count });
  } catch (error) {
    next(error);
  }
};
