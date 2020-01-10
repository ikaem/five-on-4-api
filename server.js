const express = require("express");
const { matches, users } = require("./database");
const cors = require("cors");
const fetch = require("node-fetch");
require("dotenv").config();
const knex = require("knex")(
    {
        client: "pg",
        connection: {
            host: "127.0.0.1",
            user: "postgres",
            password: "anVvPRpp",
            database: "fiveon4",
        }
    }
)
const db = knex;
const app = express();
const api_key = process.env.API_KEY;
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());

/* db.raw('select matches_static.id, matches_static.name, matches_static.datestart, matches_static.dateend, matches_static.venue, json_array_length(matches_dynamic.userssignedup) as userssignedup, json_array_length(matches_dynamic.usersattended) as usersattended, matches_dynamic.homescore, matches_dynamic.awayscore from matches_static join matches_dynamic on matches_static.id = matches_dynamic.id')
.then(data => console.log(data.rows)); */

// db.select("matches_static.id", "matches_static.name", "matches_static.datestart", "matches_static.dateend", "matches_static.venue")
/* 
db("matches_static")
.join("matches_dynamic", "matches_static.id", "=", "matches_dynamic.id")
.select(
    "matches_static.id",
    "matches_static.name",
    "matches_static.datestart as date_start",
    "matches_static.dateend as date_end",
    "matches_static.venue",
    db.raw("json_array_length(matches_dynamic.userssignedup) as players_signed_up"), 
    db.raw("json_array_length(matches_dynamic.usersattended) as players_attended"), 
    "matches_dynamic.homescore as home_score", 
    "matches_dynamic.awayscore as away_score" 
)
.then(console.log)
.catch */


/* db("matches_dynamic")
.select("id", "userssignedup", "usersattended", "homescore", "awayscore")
.join("name", "datestart")
.from("matches_static")
.on("matches_static.id", "=", "matches_dynamic.id")
// .columnInfo("id", "userssignedup.length")
.then(data => {
    console.log(data.map(match => {
        return {
            id: match.id, 
            signed_in_players: match.userssignedup.length,
            attended_players: match.usersattended.length,
        
        }
    }))
}
); */

/* db.select("*")
.from("matches_static")
.join("matches_dynamic", "matches_static.id", "=", "matches_dynamic.id")
.then(console.log); */

// ---- routes ---- //
// get root route
app.get("/", (req, res) => {
    db("matches_static")
    .join("matches_dynamic", "matches_dynamic.id", "=", "matches_static.id")
    .select(
        "matches_static.id as match_id",
        "matches_static.name as match_name",
        "matches_static.datestart as match_date_start",
        "matches_static.dateend as match_date_end",
        "matches_static.venue as match_venue",
        db.raw("json_array_length(matches_dynamic.userssignedup) as match_players_signed_up"), 
        db.raw("json_array_length(matches_dynamic.usersattended) as match_players_attended"), 
        "matches_dynamic.homescore as match_home_score", 
        "matches_dynamic.awayscore as match_away_score"
    )
    .orderBy("match_date_start")
    .then(preview_matches => {
        if(preview_matches.length){
            res.json({data: preview_matches, message: "preview matches retrieved successfully"})
        }
        else{
            res.json({data: {}, message: "no preview matches to retrieve"})
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({data: err, message: "there was an issue retrieving preview matches"});
    });
})
// get match:id route
app.get("/match/:id", (req, res) => {

    db("matches_static")
    .join("matches_dynamic", "matches_dynamic.id", "=", "matches_static.id")
    .select(
        "matches_static.id as match_id",
        "matches_static.name as match_name",
        "matches_static.datestart as match_date_start",
        "matches_static.dateend as match_date_end",
        "matches_static.venue as match_venue",
        "matches_dynamic.userssignedup as match_players_signed_up", 
        "matches_dynamic.usersattended as match_players_attended", 
        "matches_dynamic.homescore as match_home_score", 
        "matches_dynamic.awayscore as match_away_score",
        "matches_dynamic.homescorers as match_home_scorers",
        "matches_dynamic.awayscorers as match_away_scorers",
        "matches_dynamic.hometeam as match_home_team",
        "matches_dynamic.awayteam as match_away_team",
    )
    .where("matches_static.id", "=", req.params.id)
    .then(detailed_match => {
        if(detailed_match.length){
            res.json({data: detailed_match[0], message: "detailed match retrieved successfully"})
        }
        else{
            res.json({data: {}, message: "no such match"})
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({data: err, message: "there was an issue retrieving preview matches"});
    });
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
        console.log("true");
        const match_static = {
            name: match_name,
            datestart: date_start,
            dateend: date_end,
            venue: venue,
        }
        const match_dynamic = {
            id: ["data"].id,
            userssignedup: JSON.stringify(users_signed_up),
            usersattended: JSON.stringify(users_attended),
            homescore: home_score,
            awayscore: away_score,
            homescorers: JSON.stringify(home_scorers),
            awayscorers: JSON.stringify(away_scorers),
            hometeam: JSON.stringify(home_team),
            awayteam: JSON.stringify(away_team),
        }
        console.log("here");

        db.transaction(trx => {
            trx.insert(match_static)
            .into("matches_static")
            .returning("id")
            .then(data => {
                console.log("here2", data);
                return trx.insert(match_dynamic)
                .into("matches_dynamic")
                .returning("*")
                .then(data => {
                    console.log(data);
                    res.json({data: matches, message: "new match created successfully"})
                });
            })
            .then(trx.commit)
            .catch(trx.rollback);
        })



    }

// this is only for testing database
    //      matches.push(req.body);
    //     res.json({data: matches, message: "new match created successfully"});
    // } 
    // else{
    //     res.json({data: {}, message: "incomplete data submitted"})
    // }
})
// post login
app.post("/login", (req, res) => {
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
// post register
app.post("/register", (req, res) => {
    const {name, email, password} = req.body;
    if(name && email && password){
        // first check if there is a user with the same email
        const email_already_exist = users.find(user => {
            return user.user_email === email;
        })
        // if there is no user with the same email, add user to the database and return logged user with id, name and email and message
        if(!email_already_exist){
            //user_id = Math.max(...users.map(u => u.user_id))+1;
            const user = {
                user_id: Math.max(...users.map(u => u.user_id))+1, 
                user_name: name, 
                user_email: email, 
                user_password: password
            }
            users.push(user);
            // destructuring into subset and getting data for sending response to logged user - iife
            console.log((({user_id, user_name, user_email}) => ({user_id, user_name, user_email, joined_matches:[]}))(user))
            res.json({
                data: (({user_id, user_name, user_email}) => ({user_id, user_name, user_email, joined_matches:[]}))(user),
                message: "user registered successfully"
            })
        }
        // if there is a user with the same name, return empty object, with message saying there is already a user with that email
        else{
            console.log("nothing");
            res.json({data: {}, message: "a user with this email already exists"});
        }
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
    }).map(match => match.match_id);

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
// get weather 
app.get("/getweather/:time", (req, res) => {
    fetch(`https://api.darksky.net/forecast/${api_key}/44.868447,13.850852,${req.params.time}`)
    .then(response => response.json())
    .then(response => {
        res.json({data: response.currently, message: "weather fetched successfully"})
    })
    .catch(console.log);
})
const PORT = process.env.PORT? process.env.PORT: 4000;
app.listen(PORT, () => {
    console.log(`The server is running on port ${PORT}`);
})