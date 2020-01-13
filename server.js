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


// testing knex

/* db.select(
    "matches.match_id",
    "matches.match_name",
	"matches.match_venue",
	"matches.match_date_start as match_start",
    "matches.match_date_end as match_end",
    db.raw("(select array_agg(logins.user_name) from logins, matches_participation where matches_participation.user_id = logins.user_id and matches_participation.part_signed_up = true and matches.match_id = matches_participation.match_id) as signed_up"),
    db.raw("(select array_agg(logins.user_name) from logins, matches_participation where matches_participation.user_id = logins.user_id and  matches_participation.part_attended = true and matches.match_id = matches_participation.match_id ) as attended"),
    db.raw("(select matches_report.report_home_score from matches_report where matches_report.match_id = matches.match_id) as home_score"),
    db.raw("(select matches_report.report_away_score from matches_report where matches_report.match_id = matches.match_id) as away_score"),
    db.raw("(select array_agg(logins.user_name) from logins, matches_participation where matches_participation.user_id = logins.user_id and matches_participation.part_home_team = true and matches.match_id = matches_participation.match_id ) as home_team"),
    db.raw("(select array_agg(logins.user_name) from logins, matches_participation where matches_participation.user_id = logins.user_id and matches_participation.part_away_team = true and matches.match_id = matches_participation.match_id ) as away_team"),
    db.raw("(select array_agg(logins.user_name) from logins, matches_participation, generate_series(1,matches_participation.part_scored) where matches_participation.user_id = logins.user_id and matches_participation.part_scored > 0 and matches.match_id = matches_participation.match_id) as scored"),
    db.raw("(select matches_report.report_matches_reported from matches_report where matches_report.match_id = matches.match_id) as matches_reported")
)
.from("matches")
.then(console.log); */


// ---- routes ---- //
// get root route
app.get("/", (req, res) => {
    db.select(
        "matches.match_id",
        "matches.match_name",
        "matches.match_date_start",
        "matches.match_date_end",
        "matches.match_venue" ,
        db.raw("(select count (matches_participation.part_signed_up) from matches_participation where matches_participation.match_id = matches.match_id and matches_participation.part_signed_up = true) as match_players_signed_up"),
        db.raw("(select count (matches_participation.part_attended) from matches_participation where matches_participation.match_id = matches.match_id and matches_participation.part_attended = true) as match_players_attended"),
        db.raw("(select matches_report.report_home_score from matches_report where matches_report.match_id = matches.match_id) as match_home_score"),
        db.raw("(select matches_report.report_away_score from matches_report where matches_report.match_id = matches.match_id) as match_away_score")
    )
    .from("matches")
    .orderBy("match_date_start")
    .then(preview_matches => {
        res.json({data: preview_matches, message: "preview matches retrieved successfully"})
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({data: err, message: "there was an issue retrieving preview matches"});
    });
})
// get match:id route
app.get("/match/:id", (req, res) => {
    db.select(
        "matches.match_id",
        "matches.match_name",
        "matches.match_date_start",
        "matches.match_date_end",
        "matches.match_venue",
        db.raw("(select matches_report.report_match_reported from matches_report where matches_report.match_id = matches.match_id) as match_reported"),
        db.raw("(select matches_report.report_home_score from matches_report where matches_report.match_id = matches.match_id) as match_home_score"),
        db.raw("(select matches_report.report_away_score from matches_report where matches_report.match_id = matches.match_id) as match_away_score"),
        db.raw("(select array_agg(logins.user_name) from logins, matches_participation where matches_participation.part_signed_up = true and logins.user_id = matches_participation.user_id and matches_participation.match_id = matches.match_id) as match_players_signed_up"),
        db.raw("(select array_agg(logins.user_name) from logins, matches_participation where matches_participation.part_attended = true and logins.user_id = matches_participation.user_id and matches_participation.match_id = matches.match_id) as match_players_attended"),
        db.raw("(select array_agg(logins.user_name) from logins, matches_participation, generate_series(1, matches_participation.part_scored) where matches_participation.part_scored > 0 and logins.user_id = matches_participation.user_id and matches_participation.match_id = matches.match_id) as match_scorers"),
        db.raw("(select array_agg(logins.user_name) from logins, matches_participation where matches_participation.user_id = logins.user_id and matches_participation.part_home_team = true and matches_participation.match_id = matches.match_id) as match_home_team"),
        db.raw("(select array_agg(logins.user_name) from logins, matches_participation where matches_participation.user_id = logins.user_id and matches_participation.part_away_team = true and matches_participation.match_id = matches.match_id) as match_away_team"),
    )
    .from("matches")
    .where("matches.match_id", req.params.id)
    .then(detailed_match => {
        res.json({data: detailed_match[0], message: "detailed match retrieved successfully"})
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({data: err, message: "there was an issue retrieving the match"});
    });
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
    console.log(req.body);
    const {email, password} = req.body
    if(email && password){
        // so with email i could fetch id, name, email and joined matches
        // and only then do i check against password
        // if all get, send the data to front end
        // or i could first test for email, and if true, i could refetch - but i dont want to fetch twice? 
        // i will do both to see what is shorter?

        // in here it is maybe not good that i am actually fetching password from the database into backend? but i have it anyway..
        // bcrypt js needs here / async one
        db.select(
            "logins.user_id",
            "logins.user_name",
            "logins.user_email",
            "logins.user_password",
            db.raw("(select array_agg(matches.match_id) from matches, matches_participation where logins.user_id = matches_participation.user_id and matches_participation.part_signed_up = true and matches_participation.match_id = matches.match_id) as user_signed_up_matches"), 
        )
        .from("logins")
        .where({["logins.user_email"]: email, ["logins.user_password"]: password})
        .then(data => data[0])
        .then(wannabe_logged_in => {
            if(wannabe_logged_in && wannabe_logged_in.user_password === password){
                console.log(
                    (({user_id, user_name, user_email, user_signed_up_matches}) => ({user_id, user_name, user_email, user_signed_up_matches}))(wannabe_logged_in)
                )
                res.json({
                    data: (({user_id, user_name, user_email, user_signed_up_matches}) => ({user_id, user_name, user_email, user_signed_up_matches}))(wannabe_logged_in), 
                    message: "user logged in successfully"})
            }
            else{
                res.json({data: {}, message: "incorrect credentials combination / or maybe no such user"})
            }
        })
        .catch(err => {
            res.status(500).json({data: err, message: "there was an error retrieving user information from database"})
        });
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
app.get("/signedupmatches/:user_id", (req, res) => {
    const { user_id } = req.params;

    db.raw(`select array_agg(matches.match_id) as joined_matches from matches, matches_participation, logins where logins.user_id = ${user_id} and logins.user_id = matches_participation.user_id and matches_participation.part_signed_up = true and  matches_participation.match_id = matches.match_id`)
    .then(data => data.rows[0].joined_matches)
    .then(joined_matches => {
        console.log(joined_matches);
        res.json({data: joined_matches, message: "user matches fetched successfully"});
    })
    .catch(err => {
        res.json({data: {}, message: "there was a problem accessing user's matches. Please log out and try logging in again."})
    })
})
// put join match - #32
app.put("/joinmatch", (req, res) => {
    const {user_id, match_id} = req.body;
    console.log(user_id, match_id);
    db.raw(
        `insert into matches_participation(user_id, match_id, part_signed_up) 
        values(${user_id}, ${match_id}, ${true}) 
        on conflict(user_id, match_id) 
        do update 
        set part_signed_up = excluded.part_signed_up`)
    .then(data => {
        res.json({data: {}, message: "match joined successfully"})

    })
    .catch(err => {
        res.status(500).json({data: {err}, message: "there was an issue joining the match. please try again"})
    })
})
// put unjoin match
app.put("/unjoinmatch", (req, res) => {
    const {user_id, match_id} = req.body;
    db.raw(
        `insert into matches_participation(user_id, match_id, part_signed_up) 
        values(${user_id}, ${match_id}, ${false}) 
        on conflict(user_id, match_id) 
        do update 
        set part_signed_up = excluded.part_signed_up`)
    .then(data => {
        res.json({data: {}, message: "match unjoined successfully"})

    })
    .catch(err => {
        res.status(500).json({data: {err}, message: "there was an issue unjoining the match. please try again"})
    })
})
// delete match
// get weather 
app.get("/getweather/:time", (req, res) => {
    fetch(`https://api.darksky.net/forecast/${api_key}/44.868447,13.850852,${req.params.time}?units=auto`)
    .then(response => response.json())
    .then(response => {

        res.json({data: (({summary, icon, precipProbability, precipType, temperature, apparentTemperature, windSpeed}) => ({summary, icon, precipProbability, precipType, temperature, apparentTemperature, windSpeed}))(response.currently), message: "weather fetched successfully"})
    })
    .catch(err => {
        res.json({data: err, message: "error fetching weather"})
    });
})

const PORT = process.env.PORT? process.env.PORT: 4000;
app.listen(PORT, () => {
    console.log(`The server is running on port ${PORT}`);
})