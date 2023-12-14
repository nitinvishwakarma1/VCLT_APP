import mongoose from "./connection.js";

const feedback = mongoose.Schema({
    email : {
        type : String,
        required : true
    },
    rating : {
        type: String,
        required: true
    },
    feedbackmessage : {
        type: String,
        required: true
    }
});

export const feedbackmodel = mongoose.model("feedback", feedback);