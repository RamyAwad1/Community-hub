
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx'; 

const EventCard = ({ event }) => {
  const { isAuthenticated } = useAuth(); // Get auth status internally

  const cardContent = (
    <div className="event-card">
      <img src={event.picture} alt={event.title} className="event-card-picture" />
      <div className="event-card-content">
        <h4 className="event-card-title">{event.title}</h4>
        <p className="event-card-detail"><strong>Date:</strong> {event.date}</p>
        <p className="event-card-detail"><strong>Time:</strong> {event.time}</p>
        <p className="event-card-detail"><strong>Location:</strong> {event.location}</p>
      </div>
    </div>
  );

  // If authenticated, render as a clickable Link
  if (isAuthenticated) {
    return (
      <Link to={`/events/${event.id}`} className="event-card-link">
        {cardContent}
      </Link>
    );
  } else {
    // If not authenticated, render as a non-clickable div
    return (
      <div className="event-card-non-clickable">
        {cardContent}
      </div>
    );
  }
};

export default EventCard;