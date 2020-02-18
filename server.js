const express = require("express");
const app = express();
const calendar = require("./api/calendar");
const websocket = require("ws");
const http = require("http");
const events = require("events");

const updateEmitter = new events.EventEmitter();

const server = http.createServer(app);

const wss = new websocket.Server({
    server,
    path: "/ws"
});

app.use(express.json());

app.get("/api/events", (req, res, next) => {
    calendar.get_events(req.query.start, req.query.end)
        .then(events => {
            res.json({
                events
            })
        })
        .catch(error => {
            res.status(500).send("ERROR");
        });
})

app.post("/api/insert", (req, res, next) => {
    calendar.insert(req.body)
        .then(event => {
            res.json({
                event
            })
        })
        .then(res => {
            updateEmitter.emit("update");
        })
        .catch(error => {
            res.send(error);
        });
})

app.put("/api/update/:eventid", (req, res, next) => {
    calendar.update(req.params.eventid, req.body)
        .then(event => {
            res.json({
                event
            })
        })
        .then(res => {
            updateEmitter.emit("update");
        })
        .catch(error => {
            res.send(error);
        })
})

app.delete("/api/delete/:eventid", (req, res, next) => {
    calendar.delete(req.params.eventid)
        .then(event => {
            res.json({
                event
            })
        })
        .then(res => {
            updateEmitter.emit("update");
        })
        .catch(error => {
            res.send(error);
        })
})

if(process.env.NODE_ENV == "production"){
    app.use(express.static("dist"));
}else{
    app.use(express.static("public"));
    app.use(require("nwb/express")(express, {
        type: "react-app"
    }));
}

const ws_connections = {};
let user_id = 0;

updateEmitter.addListener("update", () => {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + 3);
    calendar.get_events(startDate.toISOString(), endDate.toISOString())
        .then(events => {
            const message = {
                type: "events",
                events: events.items
            }
            Object.values(ws_connections).map(c => {
                c.send(JSON.stringify(message));
            })
        })
        .catch(e => {
            console.log(e);
        });
})

wss.on("connection", ws => {
    const str_user_id = (++user_id).toString();
    ws.__user_id = str_user_id;
    ws_connections[str_user_id] = ws;
    ws.on("close", w => {
        delete ws_connections[ws.__user_id];
        Object.values(ws_connections).map(c => {
            c.send(JSON.stringify({
                type: "user",
                users: Object.keys(ws_connections).length
            }))
        })
    })
    Object.values(ws_connections).map(c => {
        c.send(JSON.stringify({
            type: "user",
            users: Object.keys(ws_connections).length
        }))
    })
})

server.listen(process.env.PORT || 3000);