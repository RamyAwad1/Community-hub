// Simulate a database of events
let mockEvents = [
    {
      id: 'e1',
      title: 'Community Clean-up Day',
      description: 'Join us to help clean up the local park!',
      date: '2025-07-15T09:00:00',
      location: 'Central Park',
      organizerId: 'organizer1', // Link to organizer
      approvalStatus: 'Approved', // 'Pending', 'Approved', 'Rejected'
      rsvps: ['user1', 'user2', 'user3'], // Array of user IDs who RSVP'd
      imageUrl: 'https://via.placeholder.com/400x200?text=CleanUpEvent'
    },
    {
      id: 'e2',
      title: 'Online Coding Workshop',
      description: 'Learn React fundamentals from experts.',
      date: '2025-07-20T14:00:00',
      location: 'Zoom',
      organizerId: 'organizer1',
      approvalStatus: 'Pending',
      rsvps: ['user1', 'user4'],
      imageUrl: 'https://via.placeholder.com/400x200?text=CodingWorkshop'
    },
    {
      id: 'e3',
      title: 'Local Food Festival',
      description: 'Taste the best local delicacies!',
      date: '2025-08-01T11:00:00',
      location: 'Town Square',
      organizerId: 'organizer2', // Another organizer
      approvalStatus: 'Approved',
      rsvps: ['user5', 'user6', 'user7', 'user8', 'user9'],
      imageUrl: 'https://via.placeholder.com/400x200?text=FoodFestival'
    },
    {
      id: 'e4',
      title: 'Volunteer Orientation',
      description: 'New volunteer training session.',
      date: '2025-08-10T10:00:00',
      location: 'Community Hall',
      organizerId: 'organizer1',
      approvalStatus: 'Approved',
      rsvps: [], // No RSVPs yet
      imageUrl: 'https://via.placeholder.com/400x200?text=VolunteerTraining'
    },
  ];
  
  // --- Mock API Functions ---
  
  // Fetch all events (public view, only approved ones)
  export const fetchEvents = async () => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(mockEvents.filter(event => event.approvalStatus === 'Approved'));
      }, 500);
    });
  };
  
  // Fetch a single event by ID
  export const fetchEventById = async (id) => {
    return new Promise(resolve => {
      setTimeout(() => {
        const event = mockEvents.find(e => e.id === id);
        resolve(event || null);
      }, 300);
    });
  };
  
  // Fetch events for a specific organizer
  export const fetchOrganizerEvents = async (organizerId) => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(mockEvents.filter(event => event.organizerId === organizerId));
      }, 500);
    });
  };
  
  // Create a new event
  export const createEvent = async (eventData) => {
    return new Promise(resolve => {
      setTimeout(() => {
        const newEvent = {
          id: `e${mockEvents.length + 1}-${Date.now()}`,
          ...eventData,
          approvalStatus: 'Pending', // New events are pending by default
          rsvps: [], // No RSVPs on creation
        };
        mockEvents.push(newEvent);
        resolve(newEvent);
      }, 700);
    });
  };
  
  // Update an existing event
  export const updateEvent = async (eventId, updatedData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockEvents.findIndex(e => e.id === eventId);
        if (index !== -1) {
          const currentEvent = mockEvents[index];
          mockEvents[index] = {
            ...currentEvent,
            ...updatedData,
            id: eventId,
            // Prevent accidental changes to status/RSVPs from organizer form
            approvalStatus: currentEvent.approvalStatus,
            rsvps: currentEvent.rsvps
          };
          resolve(mockEvents[index]);
        } else {
          reject(new Error('Event not found'));
        }
      }, 700);
    });
  };
  
  // Delete an event
  export const deleteEvent = async (eventId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const initialLength = mockEvents.length;
        mockEvents = mockEvents.filter(e => e.id !== eventId);
        if (mockEvents.length < initialLength) {
          resolve(true); // Successfully deleted
        } else {
          reject(new Error('Event not found'));
        }
      }, 500);
    });
  };
  
  // Toggle RSVP for an event (used by regular users, but here for completeness)
  export const toggleRsvp = async (eventId, userId) => {
      return new Promise((resolve, reject) => {
          setTimeout(() => {
              const event = mockEvents.find(e => e.id === eventId);
              if (!event) {
                  return reject(new Error('Event not found'));
              }
              if (!event.rsvps) {
                  event.rsvps = [];
              }
              const hasRsvpd = event.rsvps.includes(userId);
              if (hasRsvpd) {
                  event.rsvps = event.rsvps.filter(id => id !== userId);
                  resolve({ eventId, userId, rsvpd: false });
              } else {
                  event.rsvps.push(userId);
                  resolve({ eventId, userId, rsvpd: true });
              }
          }, 300);
      });
  };