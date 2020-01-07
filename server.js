const express = require("express");
const { matches, users } = require("./database");
const cors = require("cors");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
const api_key = process.env.API_KEY;
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
app.put("/something", (req, res) => {
    console.log("karlo");
    res.json("karlo");
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
app.get("/joinedmatches/:userid", (req, res) => {
    const { userid } = req.params;
    console.log("tis null?", userid);
    const joined_matches = matches.filter(match => {
        return match.users_signed_up.some(user => {
            return Number(user) === Number(userid);
        })
    })
    if(joined_matches){
        res.json({data: joined_matches, message: "user matches fetched successfully"});
    }
    else{
        res.json({data: {}, message: "there was a problem accessing user's matches. Please log out and try logging in again."})
    }
})
// put join match - #32
app.put("/joinmatch/:matchid", (req, res) => {
    console.log(req.body);
// find the match with matchid
    // for each works? this will change anyway when have actual database
    const { matchid } = req.params;
    const { user_id } = req.body;
    let joined_match = false;
    // looping over all matches to find a match that matches the match the user wants to join
    matches.forEach(match => {
        if(Number(match.match_id) === Number(matchid)){
            // adding user to the match signup array
            // add player to the match only if they are not already joined // to be added later properly
            // this is a bit workaround where joined_match is always set to true in both cases, and message sent to front end implies they were just added to the match, when they could have been already added from before
            if(!match.users_signed_up.some(user => {
                return Number(user) === Number(user_id)
            })){
                match.users_signed_up.push(user_id);
                joined_match = true;
            }
            else{
                joined_match = true;
                console.log("player was already signed in");
            }
        }
    })
    if(joined_match){
        res.json({data: matches, message: "the match joined successfully"})
    }
    else{
        res.json({data: {}, message: "no such match"})
    }
// get its signeup users array
// add to array the user's id
})
// put unjoin match
app.delete("/unjoinmatch/:matchid", (req, res) => {
    console.log(req.body);
// find the match with matchid
    // for each works? this will change anyway when have actual database
    const { matchid } = req.params;
    const { user_id } = req.body;
    console.log("user_id:", user_id);
    let unjoined_match = false;
    // looping over all matches to find a match that matches the match the user wants to unjoin
    matches.forEach(match => {
        if(Number(match.match_id) === Number(matchid)){
            console.log("match.match_id:", match.match_id);
            console.log("match.users_signed_up:", match.users_signed_up);
            // make sure the user is signedup for the particular match
            if(match.users_signed_up.some(user => {
                return Number(user) === Number(user_id)
            })){
                console.log("1.", match.users_signed_up);
                // find index of the user's id in the match's signup array, and remove the users's id
                match.users_signed_up.splice(match.users_signed_up.indexOf(user_id), 1);
                unjoined_match = true;
                console.log("2.", match.users_signed_up);

            }
            else{
                unjoined_match = true;
                console.log("the player was not signed in anyway")
            }
        }
    })
    if(unjoined_match){
        res.json({data: matches, message: "the match unjoined successfully"})
    }
    else{
        res.json({data: {}, message: "no such match"})
    }
})
// delete match
// post register
// get weather 
app.get("/getweather/:time", (req, res) => {
    fetch(`https://api.darksky.net/forecast/${api_key}/44.868447,13.850852,${req.params.time}`)
    .then(response => response.json())
    .then(response => {
        console.log(response.currently);
        res.json(response.currently)
    });
})


app.listen(4000, () => {
    console.log("Listening on port 4000");
})