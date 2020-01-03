const express = require("express");
const { matches, users } = require("./database");
const cors = require("cors");

const app = express();
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());

// ---- routes ---- //
// get route
app.get("/", (req, res) => {
    res.json(matches);
})
// post create match
app.post("/creatematch", (req, res) => {
    const {match_id, match_name, date_start, date_end, venue, users_signed_up, users_attended, home_score, away_score, home_scorers, away_scorers, home_team, away_team } = req.body;


    if(match_id && match_name && date_start && date_end && venue && users_signed_up && users_attended && home_score && away_score && home_scorers && away_scorers && home_team && away_team){
        res.json(req.body)
    } else {
        res.json(req.body)
    }

})
// put update match
// post login
// post register
// put join match
// put unjoin match
// delete match


app.listen(4000, () => {
    console.log("Listening on port 4000");
})