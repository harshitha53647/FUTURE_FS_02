const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true
        },

        source: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: ["New", "Contacted", "Converted"],
            default: "New"
        },

        notes: {
            type: String,
            default: ""
        },

        followUpDate: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Lead", leadSchema);