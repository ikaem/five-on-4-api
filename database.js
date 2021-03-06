const users = [
    {
        user_id: 10,
        user_name: "world",
        user_email: "world@gmail.com",
        user_password: "world"
    },
]

const matches = [ 
	{
        match_id: 1,
        match_name: "finished 1 5-a-side",
        date_start: "2020-01-02T12:30",
        date_end: "2020-01-02T23:59",
        venue: "the school pitch",
		users_signed_up: [1,2,3,4,5,6,7,8,9,10],
		users_attended: [1,2,3,4,5,6,7,8,9,10],
		match_reported: false,
		home_score: "3",
		away_score: "2",
		home_scorers: [1,3,1],
		away_scorers: [9,8],
		home_team: [1,2,3,4,5],
		away_team: [6,7,8,9,10],
    },
	{
        match_id: 2,
        match_name: "current 1 5-a-side",
        date_start: "2020-01-03T12:30",
        date_end: "2020-01-03T23:59",
        venue: "the school pitch",
		users_signed_up: [1,2,3,4,5,6,7,8,9,10],
		users_attended: [1,2,3,4,5,6,7,8,9,10],
		home_score: "3",
		away_score: "2",
		home_scorers: [1,3,1],
		away_scorers: [9,8],
		home_team: [1,2,3,4,5],
		away_team: [6,7,8,9,10],
    },
	{
        match_id: 3,
        match_name: "upcoming 1 5-a-side",
        date_start: "2021-01-04T12:30",
        date_end: "2021-01-04T23:59",
        venue: "the school pitch",
		users_signed_up: [2,3,4,5,6,7,8,9,10],
		users_attended: [2,3,4,5,6,7,8,9,10],
		home_score: "4",
		away_score: "2",
		home_scorers: [1,3,1,10],
		away_scorers: [9,8],
		home_team: [1,2,3,4,5],
		away_team: [6,7,8,9,10],
    },
	{
        match_id: 4,
        match_name: "finished 2 5-a-side",
        date_start: "2020-01-02T11:30",
        date_end: "2020-01-02T23:59",
        venue: "the school pitch",
		users_signed_up: [1,10],
		users_attended: [1],
		home_score: "0",
		away_score: "0",
		home_scorers: [],
		away_scorers: [],
		home_team: [],
		away_team: [],
    },
	{
        match_id: 5,
        match_name: "current 2 5-a-side",
        date_start: "2020-01-03T11:30",
        date_end: "2020-01-03T23:59",
        venue: "the school pitch",
		users_signed_up: [2],
		users_attended: [2],
		home_score: "0",
		away_score: "0",
		home_scorers: [],
		away_scorers: [],
		home_team: [],
		away_team: [],
    },
	{
        match_id: 6,
        match_name: "upcoming 2 5-a-side",
        date_start: "2021-01-04T11:30",
        date_end: "2021-01-04T23:59",
        venue: "the school pitch",
		users_signed_up: [1],
		users_attended: [1],
		home_score: "0",
		away_score: "0",
		home_scorers: [],
		away_scorers: [],
		home_team: [],
		away_team: [],
    },


	{
        match_id: 7,
        match_name: "finished 3 5-a-side",
        date_start: "2020-01-02T10:30",
        date_end: "2020-01-02T23:59",
        venue: "the school pitch",
		users_signed_up: [1,10],
		users_attended: [1,10],
		home_score: "0",
		away_score: "0",
		home_scorers: [],
		away_scorers: [],
		home_team: [],
		away_team: [],
    },
	{
        match_id: 8,
        match_name: "current 3 5-a-side",
        date_start: "2020-01-03T10:30",
        date_end: "2020-01-03T23:59",
        venue: "the school pitch",
		users_signed_up: [1],
		users_attended: [1],
		home_score: "0",
		away_score: "0",
		home_scorers: [],
		away_scorers: [],
		home_team: [],
		away_team: [],
    },
	{
        match_id: 9,
        match_name: "upcoming 3 5-a-side",
        date_start: "2021-01-04T10:30",
        date_end: "2021-01-04T23:59",
        venue: "the school pitch",
		users_signed_up: [2],
		users_attended: [2],
		home_score: "0",
		away_score: "0",
		home_scorers: [],
		away_scorers: [],
		home_team: [],
		away_team: [],
    },
	{
        match_id: 10,
        match_name: "finished 4 5-a-side",
        date_start: "2020-01-02T09:30",
        date_end: "2020-01-02T23:59",
        venue: "the school pitch",
		users_signed_up: [1,10],
		users_attended: [1],
		home_score: "0",
		away_score: "0",
		home_scorers: [],
		away_scorers: [],
		home_team: [],
		away_team: [],
    },
	{
        match_id: 11,
        match_name: "current 4 5-a-side",
        date_start: "2020-01-03T09:30",
        date_end: "2020-01-03T23:59",
        venue: "the school pitch",
		users_signed_up: [1],
		users_attended: [1],
		home_score: "0",
		away_score: "0",
		home_scorers: [],
		away_scorers: [],
		home_team: [],
		away_team: [],
    },
	{
        match_id: 12,
        match_name: "upcoming 4 5-a-side",
        date_start: "2021-01-04T09:30",
        date_end: "2021-01-04T23:59",
        venue: "the school pitch",
		users_signed_up: [1],
		users_attended: [1],
		home_score: "0",
		away_score: "0",
		home_scorers: [],
		away_scorers: [],
		home_team: [],
		away_team: [],
	},
	{
        match_id: 13,
        match_name: "finished 13 5-a-side",
        date_start: "2019-01-04T09:13",
        date_end: "2019-01-04T23:59",
        venue: "the school pitch",
		users_signed_up: [1,10],
		users_attended: [1,10],
		home_score: "1",
		away_score: "0",
		home_scorers: [10],
		away_scorers: [],
		home_team: [],
		away_team: [],
	},
	{
        match_id: 14,
        match_name: "finished 14 5-a-side",
        date_start: "2019-01-04T09:14",
        date_end: "2019-01-04T23:59",
        venue: "the school pitch",
		users_signed_up: [1,10],
		users_attended: [1,10],
		home_score: "4",
		away_score: "0",
		home_scorers: [10],
		away_scorers: [],
		home_team: [],
		away_team: [],
	},
	{
        match_id: 15,
        match_name: "finished 15 5-a-side",
        date_start: "2019-01-04T09:15",
        date_end: "2019-01-04T23:59",
        venue: "the school pitch",
		users_signed_up: [1,10],
		users_attended: [1],
		home_score: "0",
		away_score: "0",
		home_scorers: [],
		away_scorers: [],
		home_team: [],
		away_team: [],
	},
	{
        match_id: 16,
        match_name: "finished 16 5-a-side",
        date_start: "2019-01-04T09:16",
        date_end: "2019-01-04T23:59",
        venue: "the school pitch",
		users_signed_up: [1,10],
		users_attended: [1,10],
		home_score: "0",
		away_score: "3",
		home_scorers: [],
		away_scorers: [10,10],
		home_team: [],
		away_team: [],
	},
	{
        match_id: 17,
        match_name: "finished 17 5-a-side",
        date_start: "2019-01-04T09:17",
        date_end: "2019-01-04T23:59",
        venue: "the school pitch",
		users_signed_up: [1,10],
		users_attended: [1,10],
		home_score: "0",
		away_score: "0",
		home_scorers: [],
		away_scorers: [],
		home_team: [],
		away_team: [],
	},
	{
        match_id: 18,
        match_name: "finished 18 5-a-side",
        date_start: "2019-01-04T09:18",
        date_end: "2019-01-04T23:59",
        venue: "the school pitch",
		users_signed_up: [1,10],
		users_attended: [1],
		home_score: "8",
		away_score: "0",
		home_scorers: [10,10,10],
		away_scorers: [],
		home_team: [],
		away_team: [],
	},
	{
        match_id: 19,
        match_name: "finished 19 5-a-side",
        date_start: "2019-01-04T09:19",
        date_end: "2019-01-04T23:59",
        venue: "the school pitch",
		users_signed_up: [1,10],
		users_attended: [1],
		home_score: "0",
		away_score: "0",
		home_scorers: [],
		away_scorers: [],
		home_team: [],
		away_team: [],
	},
	{
        match_id: 20,
        match_name: "finished 20 5-a-side",
        date_start: "2019-01-04T09:32",
        date_end: "2019-01-04T23:59",
        venue: "the school pitch",
		users_signed_up: [1,10],
		users_attended: [1,10],
		home_score: "3",
		away_score: "0",
		home_scorers: [10],
		away_scorers: [],
		home_team: [],
		away_team: [],
	},
	{
        match_id: 21,
        match_name: "finished 21 5-a-side",
        date_start: "2019-01-04T09:31",
        date_end: "2019-01-04T23:59",
        venue: "the school pitch",
		users_signed_up: [1,10],
		users_attended: [1,10],
		home_score: "0",
		away_score: "0",
		home_scorers: [10],
		away_scorers: [],
		home_team: [],
		away_team: [],
	},
	{
        match_id: 22,
        match_name: "finished 22 5-a-side",
        date_start: "2019-01-04T09:30",
        date_end: "2019-01-04T23:59",
        venue: "the school pitch",
		users_signed_up: [1,10],
		users_attended: [1],
		home_score: "0",
		away_score: "0",
		home_scorers: [],
		away_scorers: [],
		home_team: [],
		away_team: [],
    },
]

module.exports = {
    users, matches
}