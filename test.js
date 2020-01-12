const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/testing", {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error"));
db.once("open", () => console.log("Connected to database"))

const matchSchema = new mongoose.Schema({
    name: String,
    date_start: Date,
    date_end: Date,
    venue: String,
    created_on: Date
})

const Match = mongoose.model("Match", matchSchema);

const upcoming = new Match({
    name: "upcoming", 
    date_start: new Date("2021-01-02T12:30"), 
    date_end: new Date("2021-01-02T12:35"), 
    venue: "school pitch", 
    created_on: new Date()});

console.log(upcoming);

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT? process.env.PORT: 5000;
app.listen(PORT, () => {
    console.log(`The test server is running on port ${PORT}`);
})