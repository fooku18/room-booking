const { google } = require("googleapis");
const key = require("../credentials.json");
const path = require("path");

const calendarId = "dhlcsidci@gmail.com";

class Calendarz {
    constructor(){
        const auth = new google.auth.JWT(
            key.client_email,
            null,
            key.private_key,
            ['https://www.googleapis.com/auth/calendar'],
            null
        )
        
        this.calendar = google.calendar({
            version: "v3",
            auth: auth
        })
    }

    async get_events(timeMin, timeMax){
        try{
            const response = await this.calendar.events.list({
                calendarId,
                timeMin,
                timeMax,
                orderBy: "startTime",
                singleEvents: !0,
            });
            return response.data;
        }catch(e){
            return e;
        }
    }

    async insert(requestBody){
        try{
            const response = await this.calendar.events.insert({
                calendarId,
                requestBody
            });
            return response.data;
        }catch(e){
            return e.errors;
        }
    }

    async update(eventId, requestBody){
        try{
            const response = await this.calendar.events.update({
                calendarId,
                eventId,
                requestBody
            });
            return response.data;
        }catch(e){
            return e.errors;
        }
    }

    async delete(eventId){
        try{
            const response = await this.calendar.events.delete({
                calendarId,
                eventId
            })
            return response.data;
        }catch(e){
            return e;
        }
    }
}

module.exports = new Calendarz();