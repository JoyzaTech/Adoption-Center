const mongoose = require('mongoose');

const PetSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Must provide pet name'],
        trim: true,
    },
    gender: {
        type: String,
        required: [true, 'Must provide gender'],
        enum: {
            values: ['male', 'female', 'unknown'],
            message: '{VALUE} is not supported'
        }
    },
    breed: {
        type: String,
        required: [true, 'Must provide breed'],
        trim: true,
    },
    age: {
        type: Number,
        required: [true, 'Must provide age'],
    },
    description: {
        type: String,
        required: [true, 'Must provide description'],
        trim: true,
    },
    behavior: {
        type: String,
        required: [true, 'Must provide behavior'],
        trim: true,
    },
    history: {
        type: String,
        required: [true, 'Must provide history'],
        trim: true,
    },
    location: {
        type: String,
        required: [true, 'Must provide location'],
        trim: true,
    },
    imageUrl: {
        type: String,
        required: [true, 'Must provide image URL'],
        trim: true,
    }
}, {collection: 'pets'});

module.exports = mongoose.model('Pet', PetSchema);