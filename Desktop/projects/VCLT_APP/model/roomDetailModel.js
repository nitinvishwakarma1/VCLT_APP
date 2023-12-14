import mongoose from "./connection.js";

const roomDetail = new mongoose.Schema({
    roomname: {
        type: String,
    },
    creationdate: {
        type: String,
    },
    participants: {
        type: [String],
    },
});
export const roomDetailModel = mongoose.model("roomdetail", roomDetail,"roomDetail");