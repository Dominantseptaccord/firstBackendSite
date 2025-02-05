    const mongoose = require("mongoose");
    const directionSchema = new mongoose.Schema({
        title: { 
            type: String,
            required: true,
            trim: true
        },
        direction_id: { 
            type: String, 
            unique: true, 
        },
        description: { 
            type: String,
            trim: true
        },
        courses: [ 
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Course"
            }
        ],
        createdAt: { 
            type: Date,
            default: Date.now
        }
    });
    
    // pre-save hook direction_id
    directionSchema.pre("save", async function (next) {
        if (!this.direction_id) {
            this.direction_id = this.title.replace(/\s+/g, "_").toLowerCase(); // id from title
        }
        next();
    });

    const Direction = mongoose.model("Direction", directionSchema);
    module.exports = Direction;
