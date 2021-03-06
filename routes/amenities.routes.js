const express = require("express");
const mongoose = require("mongoose");
const checkAuth = require('../middleware/checkAuth');

require("dotenv").config();
const Team = require("../models/team");
const Amenities = require("../models/amenities");

const router = express.Router();

router.post('/add', checkAuth, async (req, res) => {
    (await Team.findOne({code: req.team.code})).execPopulate().then((team) => {
        if(team.amenSub === true) {
            console.log(team);
            console.log("Already Submitted!");
            return res.status(400).json({message: "Amenities already Submitted"})
        }
    })
    const { premium, standard, totalCost } = req.body;
    const amenity = new Amenities({
        _id: new mongoose.Types.ObjectId(),
        premium,
        standard,
        totalCost,
        teamCode: req.team.code
    })
    await amenity.save().then(async (result) => {
        await Team.updateOne({ code: req.team.code }, { $set: { amenSub: true } });
        console.log(result);
        return res.status(201).json({ result });
    })
        .catch((err) => {
            console.log(err);
            return res.status(500).json({ message: "Failed" });
        });
});

router.get('/get', checkAuth, async (req, res) => {
    Amenities.find({ teamCode: req.team.code })
        .exec()
        .then((amenity) => {
            console.log(amenity)
            if (amenity.length < 1) {
                return res.status(401).json({
                    message: "Not yet Submitted",
                });
            }
            return res.status(200).json({
                message: "Auth successful",
                amenities: amenity
            });
        })
        .catch((err) => {
            res.status(500).json({
                message: "Team not found",
                error: err,
            });
        });
});

//At end
module.exports = router;