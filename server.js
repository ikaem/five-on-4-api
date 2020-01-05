const express = require("express");
const { matches, users } = require("./database");
const cors = require("cors");

const app = express();
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());

// ---- routes ---- //
// get root route
app.get("/", (req, res) => {
    res.json(matches);
})
// get match:id route
app.get("/match/:id", (req, res) => {
    const found_match = matches.find(match => Number(match.match_id) === Number(req.params.id));
    if(found_match){
        res.json({data: found_match, message: "match found"})
    } 
    else{
        res.json({data: {}, message: "no such match"})
    }
})
// put update match:id
app.put("/updatematch/:id", (req, res) => {

    const {match_id, match_name, date_start, date_end, venue, users_signed_up, users_attended, home_score, away_score, home_scorers, away_scorers, home_team, away_team } = req.body;

    if(match_id && match_name && date_start && date_end && venue && users_signed_up && users_attended && home_score && away_score && home_scorers && away_scorers && home_team && away_team){

        const updateIndex = matches.findIndex(match => {
            return Number(match.match_id) === Number(req.body.match_id);
        })
        if(updateIndex >= 0){
            matches[updateIndex] = req.body;
            res.json({data: matches, message: "match successfully updated"});
        }
        else{
            res.json({data: {}, message: "no such match"});
        }
    } 
    else{
        res.json({data: {}, message: "incomplete data submitted"})
    }
})
// post create match
app.post("/creatematch", (req, res) => {
    const {match_id, match_name, date_start, date_end, venue, users_signed_up, users_attended, home_score, away_score, home_scorers, away_scorers, home_team, away_team } = req.body;

    if(match_id && match_name && date_start && date_end && venue && users_signed_up && users_attended && home_score && away_score && home_scorers && away_scorers && home_team && away_team){   
        matches.push(req.body);
        res.json({data: matches, message: "new match created successfully"});
    } 
    else{
        res.json({data: {}, message: "incomplete data submitted"})
    }
})
// post login
app.post("/login", (req, res) => {
    console.log(req.body);
    const {email, password} = req.body;
    
    if(email && password){
        const wannabe_logged = users.find(user => {
            return user.user_email === email && user.user_password === password    
        });
        if(wannabe_logged){
            res.json({data: {id: wannabe_logged.user_id, name: wannabe_logged.user_name, email: wannabe_logged.user_email, joined_matches: []}, message: "user logged in successfully"})
        }
        else{
            res.json({data: {}, message: "no such user"})
        }
    }
    else{
        res.json({data: {}, message: "incomplete data submitted"})
    }

})
// get joined matches
app.get("/joinedmatches/:id", (req, res) => {
    const { id } = req.params;
    console.log(id);
    const joined_matches = matches.filter(match => {
        return match.users_signed_up.some(user => {
            return Number(user) === Number(id);
        })
    })
    if(joined_matches){
        res.json({data: joined_matches, message: "user matches fetched successfully"});
    }
    else{
        res.json({data: {}, message: "there was a problem accessing user's matches. Please log out and try logging in again."})
    }
})
// put join match
// put unjoin match
// delete match
// post register


app.listen(4000, () => {
    console.log("Listening on port 4000");
})