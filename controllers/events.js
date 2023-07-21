import createHttpError from "http-errors";
import moment from "moment";

import saveFile from '../utils/save-file.js'
import { Users } from "../models/users.js";
import { Events } from "../models/events.js";

export const createEvent = async (req, res, next) => {
  try {
    const { name, description, startDate, endDate } = req.body;

    if (!name) throw createHttpError(400, "Event name is missing");
    if (moment(startDate).isAfter(moment(endDate)))
      throw createHttpError(400, "Start date should not be after end date");

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
          file: avatar,
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

    if (!name) throw createHttpError(400, "Event name is missing");
    if (moment(startDate).isAfter(moment(endDate)))
      throw createHttpError(400, "Start date should not be after end date");

    let eventBanner;
    if (req.files) {
      const { banner } = req.files;

      eventBanner = banner;
      if (eventBanner === false) {
        eventBanner = null;

        create["banner"] = null;
      } else if (eventBanner) {
        const { filename } = await saveFile({
          file: avatar,
          savePath: `/banners`,
          newFilename: req.user.id,
        });

        create["banner"] = `/public/banners/${filename}`;
      }
    }

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

    const query = {};
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
