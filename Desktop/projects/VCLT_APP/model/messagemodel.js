import mongoose from "./connection.js";

const message = mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    }
});

export const messagemodel = mongoose.model("message", message);