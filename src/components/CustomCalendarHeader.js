import React from 'react';
import './CustomCalendarHeader.css';

const CustomCalendarHeader = ({ label }) => {
    const [number, day] = label.split(" ");

    return (
        <div className="customcalendarheader-container">
            <h2 className="customcalendarheader-h2">
                <div className="customcalendarheader-top-label">{day}</div>
                <div className="customcalendarheader-bottom-label">{number}</div>
            </h2>
        </div>
    )
}

export default CustomCalendarHeader;