import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Modal from './components/Modal';
import React from 'react';
import moment from 'moment';
import './App.css';
import CustomCalendarHeader from './components/CustomCalendarHeader';

const localizer = momentLocalizer(moment);
const minTime = new Date();
minTime.setHours(8, 0, 0);
const maxTime = new Date();
maxTime.setHours(21, 0, 0);

class App extends React.Component {
    constructor(props){
        super(props);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        this.state = {
            events: [],
            today: today,
            modalOpen: !1,
            calendarHeight: window.innerHeight,
            error: !1,
            focusEvent: {
                title: "",
                start: new Date(),
                end: new Date(),
            },
            websocker: !0,
            activeUsers: 1,
        }
        window.addEventListener("resize", e => {
            this.setState({
                calendarHeight: e.target.innerHeight
            });
        })
        this.modalClose = this.modalClose.bind(this);
        this.rangeSelect = this.rangeSelect.bind(this);
        this.confirmBooking = this.confirmBooking.bind(this);
        this.checkDoubleBooking = this.checkDoubleBooking.bind(this);
        this.onSelectEvent = this.onSelectEvent.bind(this);
        this.onModalDelete = this.onModalDelete.bind(this);
        this.onModalUpdate = this.onModalUpdate.bind(this);
        this.focusEventUpdate = this.focusEventUpdate.bind(this);
    }

    focusEventUpdate(eventTitle){
        const focusEvent = {...this.state.focusEvent};
        focusEvent.title = eventTitle;
        this.setState({
            focusEvent
        });
    }

    leadingZero(num){
        return num < 10 ? `0${num}` : `${num}`;
    }

    formatReadableDateTime(date){
        return `${date.getDate()}/${this.leadingZero(date.getMonth()+1)}/${date.getFullYear()} ${this.leadingZero(date.getHours())}:${this.leadingZero(date.getMinutes())}`
    }

    modalClose(){
        this.setState({
            modalOpen: !1
        })
    }

    checkDoubleBooking(range){
        const events = this.state.events;
        for(let i = 0, j = events.length; i < j; i++){
            if(range.start < events[i].end && events[i].start < range.end)return!0;
        }
        return!1;
    }

    rangeSelect(range){
        if(range.start < this.state.today){
            this.setState({
                modalBody: `The selected slot starts in the past. Past slots can't be booked!`,
                modalOpen: "info",
                modalTitle: "Error",
                modalFooterButtons: "confirm",
            })
        }else if(this.checkDoubleBooking(range)){
            this.setState({
                modalBody: `This slot conflicts with another confirmed booking. Please select a different slot.`,
                modalOpen: "info",
                modalTitle: "Error",
                modalFooterButtons: "confirm",
            })
        }else{
            this.setState({
                modalBody: `From ${this.formatReadableDateTime(range.start)} to ${this.formatReadableDateTime(range.end)}`,
                modalOpen: "create",
                modalTitle: "Confirmation",
                focusEvent: {
                    title: "",
                    start: range.start,
                    end: range.end,
                },
            })
        }
    }

    onSelectEvent(event){
        this.setState({
            modalOpen: "update",
            modalTitle: "Update Event",
            focusEvent: event,
        })
    }

    onModalUpdate(){
        const data = {
            "summary": this.state.focusEvent.title,
            "start": {
                "dateTime": this.state.focusEvent.start.toISOString(),
                "timeZone": this.timezone
            },
            "end": {
                "dateTime": this.state.focusEvent.end.toISOString(),
                "timeZone": this.timezone
            }
        }

        fetch(`api/update/${this.state.focusEvent.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(res => {
            if(!this.websocket){
                const id = res.event.id;
                for(let i = 0, j = this.state.events.length; i < j; i++){
                    if(this.state.events[i].id == id){
                        const new_events = [...this.state.events];
                        new_events[i].title = this.state.focusEvent.title;
                        this.setState({
                            events: new_events
                        });
                        break;
                    }
                }
            }
        })
        .catch(e => console.log(e));

        this.setState({
            modalOpen: !1
        })
    }

    onModalDelete(){
        fetch(`api/delete/${this.state.focusEvent.id}`,{
            method: "DELETE"
        })
        .then(res => {
            if(!this.websocket){
                const new_events = this.state.events.filter(l => l.id != this.state.focusEvent.id);
                this.setState({
                    modalOpen: !1,
                    events: new_events
                })
            }
        })
    }

    confirmBooking(){
        const data = {
            "summary": this.state.focusEvent.title,
            "start": {
                "dateTime": this.state.focusEvent.start.toISOString(),
                "timeZone": this.timezone
            },
            "end": {
                "dateTime": this.state.focusEvent.end.toISOString(),
                "timeZone": this.timezone
            }
        }

        fetch("/api/insert", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
        .then(r => r.json())
        .then(r => {
            if(!this.websocket){
                this.setState(prevState => {
                    const prevEvents = prevState.events;
                    const newEvents = [
                        ...prevEvents,
                        {
                            title: r.event.summary || "",
                            start: new Date(r.event.start.dateTime),
                            end: new Date(r.event.end.dateTime),
                            id: r.event.id,
                        }
                    ];
                    return {
                        events: newEvents
                    }
                })
            }
        })  
        .catch(e => console.log(e));

        this.setState({
            modalOpen: !1
        })
    }

    componentDidMount(){
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(startDate.getDate() - startDate.getDay());
        const endDate = new Date(startDate);
        endDate.setMonth(startDate.getMonth() + 3);
        fetch(`api/events?start=${startDate.toISOString()}&end=${endDate.toISOString()}`)
            .then(res => res.json())
            .then(res => {  
                this.timezone = res.events.timeZone;
                const calendar_events = res.events.items;
                const events = [];
                for(let i = 0, j = calendar_events.length; i < j; i++){
                    events.push({
                        title: calendar_events[i].summary,
                        start: new Date(calendar_events[i].start.dateTime),
                        end: new Date(calendar_events[i].end.dateTime),
                        id: calendar_events[i].id,
                    })
                }
                this.setState({
                    events
                });
            })
            .then(() => {
                const ws = new WebSocket(`ws://${window.location.host}/ws`);
                ws.onmessage = message => {
                    const message_container = JSON.parse(message.data);
                    if(message_container.type === "events"){
                        const calendar_events = message_container.events;
                        const events = [];
                        for(let i = 0, j = calendar_events.length; i < j; i++){
                            events.push({
                                title: calendar_events[i].summary,
                                start: new Date(calendar_events[i].start.dateTime),
                                end: new Date(calendar_events[i].end.dateTime),
                                id: calendar_events[i].id,
                            })
                        }
                        this.setState({
                            events
                        });
                    }
                    if(message_container.type === "user"){
                        this.setState({
                            activeUsers: message_container.users
                        });
                    }
                }   
                ws.onclose = () => {
                    this.setState({
                        websocket: !1
                    })
                }
            })
            .catch(e => {
                console.log(e);
                this.setState({
                    error: !0,
                })
            });
    }

    render(){
        return (
            <React.Fragment>
                {!this.state.error &&
                    <React.Fragment>
                        <Calendar
                            components={{
                                week: {
                                    header: CustomCalendarHeader
                                }
                            }}
                            eventPropGetter={() => ({className: "custom-event"})}
                            localizer={localizer}
                            events={this.state.events}
                            defaultView={'week'}
                            views={['week', 'day']}
                            style={{ height: this.state.calendarHeight }}
                            selectable={true}
                            min={minTime}
                            max={maxTime}
                            onSelectSlot={this.rangeSelect}
                            dayPropGetter={date => {
                                if(date.getHours() === 0 && date.getDate() === new Date().getDate()){
                                    return {
                                        className: "customcalendarheader-selected"
                                    }
                                }
                            }}
                            onSelectEvent={this.onSelectEvent}
                        />
                        {this.state.activeUsers > 1 && <div className="alert">There are {this.state.activeUsers} users active currently.</div>}
                    </React.Fragment>
                || 
                    <div>Something went wrong</div>
                }
                <Modal
                    modalOpen={this.state.modalOpen}
                    modalClose={this.modalClose}
                    modalBody={this.state.modalBody}
                    modalTitle={this.state.modalTitle}
                    onModalDelete={this.onModalDelete}
                    onModalUpdate={this.onModalUpdate}
                    confirmBooking={this.confirmBooking}
                    focusEvent={this.state.focusEvent}
                    focusEventUpdate={this.focusEventUpdate}
                />
            </React.Fragment>
        )
    }
}

export default App;