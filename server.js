const express = require("express");
const { matches, users } = require("./database");
const cors = require("cors");
const fetch = require("node-fetch");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const knex = require("knex")({
    client: "pg",
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: true}})

// const knex = require("knex")(
//     {client: "pg",
//         connection: {
//             host: "127.0.0.1",
//             user: "postgres",
//             password: "anVvPRpp",
//             database: "fiveon4",}})






const db = knex;
const app = express();
const api_key = process.env.API_KEY;
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());

// ---- routes ---- //
// get root route - pg done
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
app.get("/test", (req, res) => {
    db.select(

        db.raw("(select coalesce (array_agg(logins.user_name), array[]::character varying[]) from logins, matches_participation where matches_participation.part_signed_up = true and logins.user_id = matches_participation.user_id and matches_participation.match_id = matches.match_id) as match_players_signed_up")
        

    
    )
    .from("matches")
    .where("matches.match_id", 8)
    .then(detailed_match => {
        console.log(detailed_match[0]);
        res.json({data: detailed_match[0], message: "detailed match retrieved successfully"})
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({data: err, message: "there was an issue retrieving the match"});
    });

/*     db("logins")
    .select(
        "user_id", 
        "user_name as hi",
        db.raw('array_agg(user_email) as email')
        )
    .where("user_id", 1)
    .groupBy("user_id")
    .then(data => {
        res.json(data);
    }) */
})
// get detailed match:id route - pg done
app.get("/detailedmatch/:id", (req, res) => {
    db.select(
        "matches.match_id",
        "matches.match_name",
        "matches.match_date_start",
        "matches.match_date_end",
        "matches.match_venue",
        db.raw("(select matches_report.report_match_reported from matches_report where matches_report.match_id = matches.match_id) as match_reported"),
        db.raw("(select matches_report.report_home_score from matches_report where matches_report.match_id = matches.match_id) as match_home_score"),
        db.raw("(select matches_report.report_away_score from matches_report where matches_report.match_id = matches.match_id) as match_away_score"),

        db.raw("(select coalesce(json_agg(json_build_object('user_id', logins.user_id, 'user_name', logins.user_name)), json_build_array()) from logins, matches_participation where matches_participation.part_signed_up = true and logins.user_id = matches_participation.user_id and matches_participation.match_id = matches.match_id) as match_players_signed_up"),


        db.raw("(select coalesce(json_agg(json_build_object('user_id', logins.user_id, 'user_name', logins.user_name)), json_build_array()) from logins, matches_participation where matches_participation.part_attended = true and logins.user_id = matches_participation.user_id and matches_participation.match_id = matches.match_id) as match_players_attended"),


        db.raw("(select coalesce(json_agg(json_build_object('user_id', logins.user_id, 'user_name', logins.user_name, 'user_goals', matches_participation.part_scored)), json_build_array()) from logins, matches_participation where matches_participation.part_scored > 0 and logins.user_id = matches_participation.user_id and matches_participation.match_id = matches.match_id) as match_scorers"),


        db.raw("(select coalesce(json_agg(json_build_object('user_id', logins.user_id, 'user_name', logins.user_name)), json_build_array())from logins, matches_participation where matches_participation.user_id = logins.user_id and matches_participation.part_home_team = true and matches_participation.match_id = matches.match_id) as match_home_team"),


        db.raw("(select coalesce(json_agg(json_build_object('user_id', logins.user_id, 'user_name', logins.user_name)), json_build_array()) from logins, matches_participation where matches_participation.user_id = logins.user_id and matches_participation.part_away_team = true and matches_participation.match_id = matches.match_id) as match_away_team"),
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
// post create match
app.post("/creatematch", (req, res) => {
    const {match_name, match_date_start, match_date_end, match_venue} = req.body;
    console.log(req.body);

    if(match_name, match_date_start, match_date_end, match_venue){
        db("matches")
        .insert({match_name, match_date_start, match_date_end, match_venue})
        .returning(["match_id","match_name"])
        .then((created_match_data_response) => {
            if(created_match_data_response){
                res.json({data: created_match_data_response[0], message: "new match successfully created"});
            }
            else{
                res.status(500).json({data: {}, message: "there was an issue creating a new match"})
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({data: err, message: "there was an error creating a new match"});
        })
    }
    else{
        res.json({data: {}, message: "incomplete data submitted"})
    }
})
// put update match:id
app.put("/updatematch/:id", (req, res) => {
    const {id} = req.params;
    const {match_name, match_date_start, match_date_end, match_venue} = req.body;
    console.log(req.body);
    if(match_name, match_date_start, match_date_end, match_venue){
        db("matches")
        .update({match_name, match_venue, match_date_start, match_date_end})
        .where("match_id", id)
        .returning(["match_id","match_name"])
        .then(updated_match_data_response => {
            if(updated_match_data_response){
                res.json({data: updated_match_data_response[0], message: "the match updated successfully"});
            }
            else{
                res.json({data: {}, message: "there was an error updating match"})
            }
        })
        .catch(err => {
            console.log(err);
            res.json({data: err, message: "an error was caught while trying to update match. no update was made"});
        })
    }
    else{
        res.json({data: {}, message: "incomplete data submitted"});
    }
})
// get for update match
app.get("/forupdatematch/:id", (req, res) => {
    console.log("here, it arrived!!!!!")

    const {id} = req.params;
    db("matches")
    .select("match_id", "match_name", "match_venue", "match_date_start", "match_date_end")
    .where("match_id", id)
    .then(for_update_match => {
        if(for_update_match[0].match_id){
            console.log("arrived again")
            console.log(for_update_match[0])
            res.json({data: for_update_match[0], message: "match for update retrieved successfully"});
        }
        else{
            res.json({data: {}, message: "there was an error fetching the match for update. please try again"});
        }
    })
    .catch(err => {
        console.log(err);
        res.json({data: err, message: "an error was caught while waiting for update match response"});
    }); 
})
// get for report match
app.get("/forreportmatch/:id", (req, res) => {
    // should do this with knex syntax prolly eventually
    db.select(
        db.raw("(select matches_report.report_match_reported from matches_report where matches_report.match_id = matches.match_id) as match_reported"),
        db.raw("(select matches_report.report_home_score from matches_report where matches_report.match_id = matches.match_id) as match_home_score"),
        db.raw("(select matches_report.report_away_score from matches_report where matches_report.match_id = matches.match_id) as match_away_score"),
        db.raw("(select coalesce(json_agg(json_build_object('user_id', logins.user_id, 'user_name', logins.user_name)), json_build_array()) from logins, matches_participation where matches_participation.part_signed_up = true and logins.user_id = matches_participation.user_id and matches_participation.match_id = matches.match_id) as match_players_signed_up"),
        db.raw("(select coalesce(json_agg(json_build_object('user_id', logins.user_id)), json_build_array()) from logins, matches_participation where matches_participation.part_attended = true and logins.user_id = matches_participation.user_id and matches_participation.match_id = matches.match_id) as match_players_attended"),
        db.raw("(select coalesce(json_agg(json_build_object('user_id', logins.user_id, 'user_goals', matches_participation.part_scored)), json_build_array()) from logins, matches_participation where matches_participation.part_signed_up = true and logins.user_id = matches_participation.user_id and matches_participation.match_id = matches.match_id) as match_scorers"),
        db.raw("(select coalesce(json_agg(json_build_object('user_id', logins.user_id)), json_build_array()) from logins, matches_participation where matches_participation.user_id = logins.user_id and matches_participation.part_home_team = true and matches_participation.match_id = matches.match_id) as match_home_team"),
        db.raw("(select coalesce(json_agg(json_build_object('user_id', logins.user_id)), json_build_array()) from logins, matches_participation where matches_participation.user_id = logins.user_id and matches_participation.part_away_team = true and matches_participation.match_id = matches.match_id) as match_away_team"),
    )
    .from("matches")
    .where("matches.match_id", req.params.id)
    .then(detailed_match => {
        console.log(detailed_match[0]);
        res.json({data: detailed_match[0], message: "data for match report retrieved successfully"})
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({data: err, message: "there was an issue retrieving data for match report"});
    });
})
// report match
app.put("/reportmatch/:id", (req, res) => {
    const { match_players, report_match_reported, report_home_score, report_away_score} = req.body;
    const {id} = req.params;
    console.log(req.body);

    db.transaction(trx => {
        const players_promises = match_players.map(player => {
			return trx.raw(`insert into matches_participation(user_id, match_id, part_scored, part_attended, part_home_team, part_away_team) values(${player.user_id}, ${id}, ${player.part_scored}, ${player.part_attended}, ${player.part_home_team}, ${player.part_away_team}) on conflict(user_id, match_id) do update set part_scored = excluded.part_scored, part_attended = excluded.part_attended, part_home_team = excluded.part_home_team, part_away_team = excluded.part_away_team`)
            .transacting(trx)
        })
        players_promises.push(
			trx.raw(`insert into matches_report(match_id, report_match_reported, report_home_score, report_away_score) values(${id}, ${report_match_reported}, ${report_home_score}, ${report_away_score}) on conflict(match_id) do update set report_match_reported = excluded.report_match_reported, report_home_score = excluded.report_home_score, report_away_score = excluded.report_away_score`)
			.transacting(trx)
        )
        return Promise.all(players_promises)
		.then(data => {
			trx.commit;
			res.json({data: {}, message: "the match report was successfully updated"});
		})
		.catch(err => {
			console.log(err)
			res.json({data: err, message: "there was an issue submitting the match report. please try again"});
		})
    })
})
// post login
app.post("/login", (req, res) => {
    console.log(req.body);
    const {email, password} = req.body
    if(email && password){
        db.select(
            "user_id",
            "user_name",
            "user_email",
            "user_created",
            "user_password",
            db.raw("(select coalesce(json_agg(json_build_object('match_id', matches_participation.match_id, 'match_name', matches.match_name, 'match_date', matches.match_date_start)), json_build_array()) from matches_participation, matches where matches_participation.part_signed_up = true and matches_participation.user_id = logins.user_id and matches.match_id = matches_participation.match_id) as user_signed_up_matches"),
            db.raw("(select coalesce(json_agg(json_build_object('match_id', matches_participation.match_id, 'match_name', matches.match_name, 'match_date', matches.match_date_start)), json_build_array()) from matches_participation, matches where matches_participation.part_attended = true and matches_participation.user_id = logins.user_id and matches.match_id = matches_participation.match_id) as user_attended_matches"),
            db.raw("(select coalesce(json_agg(json_build_object('match_id', matches_participation.match_id, 'match_name', matches.match_name, 'match_date', matches.match_date_start)), json_build_array()) from matches_participation, matches where matches_participation.part_home_team = true and matches_participation.user_id = logins.user_id and matches.match_id = matches_participation.match_id) as user_in_home_team"),
            db.raw("(select coalesce(json_agg(json_build_object('match_id', matches_participation.match_id, 'match_name', matches.match_name, 'match_date', matches.match_date_start)), json_build_array()) from matches_participation, matches where matches_participation.part_away_team = true and matches_participation.user_id = logins.user_id and matches.match_id = matches_participation.match_id) as user_in_away_team"),
            db.raw("(select coalesce(json_agg(json_build_object('match_id', matches_participation.match_id, 'match_name', matches.match_name, 'match_date', matches.match_date_start)), json_build_array()) from matches_participation join  matches_report on matches_participation.part_attended = true and  matches_participation.part_home_team = true and matches_participation.user_id = logins.user_id and matches_report.match_id = matches_participation.match_id and matches_report.report_home_score > matches_report.report_away_score join matches on matches.match_id = matches_participation.match_id) as user_matches_won_as_home"),
            db.raw("(select coalesce(json_agg(json_build_object('match_id', matches_participation.match_id, 'match_name', matches.match_name, 'match_date', matches.match_date_start)), json_build_array()) from matches_participation join  matches_report on matches_participation.part_attended = true and  matches_participation.part_away_team = true and matches_participation.user_id = logins.user_id and matches_report.match_id = matches_participation.match_id and matches_report.report_home_score < matches_report.report_away_score join matches on matches.match_id = matches_participation.match_id) as user_matches_won_as_away"),
            db.raw("(select coalesce(json_agg(json_build_object('match_id', matches_participation.match_id, 'match_name', matches.match_name, 'match_date', matches.match_date_start)), json_build_array()) from matches_participation join matches_report on matches_participation.part_attended = true and matches_participation.part_home_team = true and matches_participation.user_id = logins.user_id and matches_report.match_id = matches_participation.match_id and matches_report.report_home_score < matches_report.report_away_score join matches on matches.match_id = matches_participation.match_id) as user_matches_lost_as_home"),
            db.raw("(select coalesce(json_agg(json_build_object('match_id', matches_participation.match_id, 'match_name', matches.match_name, 'match_date', matches.match_date_start)), json_build_array()) from matches_participation join matches_report on matches_participation.part_attended = true and matches_participation.part_away_team = true and matches_participation.user_id = logins.user_id and matches_report.match_id = matches_participation.match_id and matches_report.report_home_score > matches_report.report_away_score join matches on matches.match_id = matches_participation.match_id) as user_matches_lost_as_away"),
            db.raw("(select coalesce(json_agg(json_build_object('match_id', matches_participation.match_id, 'match_name', matches.match_name, 'match_date', matches.match_date_start, 'match_goals_scored', matches_participation.part_scored)), json_build_array()) from matches_participation, matches where matches_participation.user_id = logins.user_id and matches_participation.part_attended = true and matches_participation.part_scored > 0 and matches.match_id = matches_participation.match_id) as user_scored_in_matches")
        )
        .from("logins")
        // .where({["logins.user_email"]: email, ["logins.user_password"]: password})
         .where({["logins.user_email"]: email})
        .then(data => data[0])
// TODO // use returning([]) for multiple columns
        .then(db_user => {
            bcrypt.compare(password, db_user.user_password, (err, bcrypt_res) => {
                if(bcrypt_res){
                    const {user_password, ...logged_user} = db_user;
                    return res.json({data: logged_user, message: "user logged in successfully"})                
                }
                res.json({data: {}, message: "incorrect credentials combination / or maybe no such user"})
            })
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
    console.log(req.body);
    db("logins")
    .insert({
        user_name: name, 
        user_email: email, 
        // using sync bcrypt bc i dont want to nest it and chain it with then while waiting for promise to fulfill. and i am not sure how to do it elegantly... 
        user_password: bcrypt.hashSync(password, bcrypt.genSaltSync(10))
    })

    // genius internet. i think i need to use this array in few other places to avoid more code generating needed object
    .returning("user_email")
    // .returning("*")
    .then(data => {
        console.log(data);
        console.log("karlo")
        return data[0]
    })
    .then(registered_user_email => {

        db.select(
            "user_id",
            "user_name",
            "user_email",
            "user_created",
            db.raw("(select coalesce(json_agg(json_build_object('match_id', matches_participation.match_id, 'match_name', matches.match_name, 'match_date', matches.match_date_start)), json_build_array()) from matches_participation, matches where matches_participation.part_signed_up = true and matches_participation.user_id = logins.user_id and matches.match_id = matches_participation.match_id) as user_signed_up_matches"),
            db.raw("(select coalesce(json_agg(json_build_object('match_id', matches_participation.match_id, 'match_name', matches.match_name, 'match_date', matches.match_date_start)), json_build_array()) from matches_participation, matches where matches_participation.part_attended = true and matches_participation.user_id = logins.user_id and matches.match_id = matches_participation.match_id) as user_attended_matches"),
            db.raw("(select coalesce(json_agg(json_build_object('match_id', matches_participation.match_id, 'match_name', matches.match_name, 'match_date', matches.match_date_start)), json_build_array()) from matches_participation, matches where matches_participation.part_home_team = true and matches_participation.user_id = logins.user_id and matches.match_id = matches_participation.match_id) as user_in_home_team"),
            db.raw("(select coalesce(json_agg(json_build_object('match_id', matches_participation.match_id, 'match_name', matches.match_name, 'match_date', matches.match_date_start)), json_build_array()) from matches_participation, matches where matches_participation.part_away_team = true and matches_participation.user_id = logins.user_id and matches.match_id = matches_participation.match_id) as user_in_away_team"),
            db.raw("(select coalesce(json_agg(json_build_object('match_id', matches_participation.match_id, 'match_name', matches.match_name, 'match_date', matches.match_date_start)), json_build_array()) from matches_participation join  matches_report on matches_participation.part_attended = true and  matches_participation.part_home_team = true and matches_participation.user_id = logins.user_id and matches_report.match_id = matches_participation.match_id and matches_report.report_home_score > matches_report.report_away_score join matches on matches.match_id = matches_participation.match_id) as user_matches_won_as_home"),
            db.raw("(select coalesce(json_agg(json_build_object('match_id', matches_participation.match_id, 'match_name', matches.match_name, 'match_date', matches.match_date_start)), json_build_array()) from matches_participation join  matches_report on matches_participation.part_attended = true and  matches_participation.part_away_team = true and matches_participation.user_id = logins.user_id and matches_report.match_id = matches_participation.match_id and matches_report.report_home_score < matches_report.report_away_score join matches on matches.match_id = matches_participation.match_id) as user_matches_won_as_away"),
            db.raw("(select coalesce(json_agg(json_build_object('match_id', matches_participation.match_id, 'match_name', matches.match_name, 'match_date', matches.match_date_start)), json_build_array()) from matches_participation join matches_report on matches_participation.part_attended = true and matches_participation.part_home_team = true and matches_participation.user_id = logins.user_id and matches_report.match_id = matches_participation.match_id and matches_report.report_home_score < matches_report.report_away_score join matches on matches.match_id = matches_participation.match_id) as user_matches_lost_as_home"),
            db.raw("(select coalesce(json_agg(json_build_object('match_id', matches_participation.match_id, 'match_name', matches.match_name, 'match_date', matches.match_date_start)), json_build_array()) from matches_participation join matches_report on matches_participation.part_attended = true and matches_participation.part_away_team = true and matches_participation.user_id = logins.user_id and matches_report.match_id = matches_participation.match_id and matches_report.report_home_score > matches_report.report_away_score join matches on matches.match_id = matches_participation.match_id) as user_matches_lost_as_away"),
            db.raw("(select coalesce(json_agg(json_build_object('match_id', matches_participation.match_id, 'match_name', matches.match_name, 'match_date', matches.match_date_start, 'match_goals_scored', matches_participation.part_scored)), json_build_array()) from matches_participation, matches where matches_participation.user_id = logins.user_id and matches_participation.part_attended = true and matches_participation.part_scored > 0 and matches.match_id = matches_participation.match_id) as user_scored_in_matches")
        )
        .from("logins")
        .where({["logins.user_email"]: registered_user_email})
        .then(data => data[0])
        .then(db_user => {
            const {user_password, ...logged_user} = db_user;
            res.json({data: logged_user, message: "new user successfully registered"})                
        })
        .catch(err => {
            res.status(500).json({data: err, message: "there was an error retrieving user information from database"})
        })
    })
    .catch(err => {
        if(err.code === "23505"){
            return res.json({data: err, message: `user with the same ${err.detail.slice(err.detail.indexOf("(")+6, err.detail.indexOf(")"))} already exists`})
        }
        else if(err.code === "23502"){
            return res.json({data: err, message: `incomplete data submitted. please provide valid user ${err.column.slice(err.column.indexOf("_")+1)}`})
        }
        res.status(500).json({data: err, message: "there was an error registering new user. please try again"})
    });
})
// get joined matches - this endpoint can be completely avoided if using return from join and unjoin matches, and fetching join matches when login
// true, but i really wouldnt know how to do that and get this json object. there prolly is a way, tho...
app.get("/signedupmatches/:user_id", (req, res) => {
    const { user_id } = req.params;
    // coalescing to array if no joined matches
/*     db.raw(`select coalesce (array_agg(matches.match_id), array[]::integer[]) as joined_matches from matches, matches_participation, logins where logins.user_id = ${user_id} and logins.user_id = matches_participation.user_id and matches_participation.part_signed_up = true and  matches_participation.match_id = matches.match_id`) */

    db.raw(`select coalesce(json_agg(json_build_object('match_id', matches_participation.match_id, 'match_name', matches.match_name, 'match_date', matches.match_date_start)), json_build_array()) as user_signed_up_matches from matches_participation, matches where matches_participation.part_signed_up = true and matches_participation.user_id = ${user_id} and matches.match_id = matches_participation.match_id`)

    .then(data => data.rows[0].user_signed_up_matches)
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
        console.log(data);
        res.json({data: data, message: "match joined successfully"})

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
    console.log(req.params.time);
    fetch(`https://api.darksky.net/forecast/${api_key}/44.868447,13.850852,${req.params.time}?units=auto`)
    .then(response => response.json())
    .then(response => {
        console.log(response);

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