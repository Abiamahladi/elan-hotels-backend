const Room = require("../models/Room");

const getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find()
      .select("name price capacity availability")
      .lean();

    const data = rooms.map(room => ({
      id: room._id.toString(),
      name: room.name,
      price: room.price,
      capacity: room.capacity,
      availability: room.availability
    }));

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getRooms };
