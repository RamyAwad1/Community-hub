

// Initialize mock data in localStorage if it doesn't exist
const initializeMockData = () => {
    if (!localStorage.getItem('mockUsers')) {
        const initialUsers = [
            { id: 'admin1', name: 'Admin Bob', email: 'admin@example.com', role: 'admin', bio: 'System administrator.' },
            { id: 'organizer1', name: 'Organizer Alice', email: 'organizer@example.com', role: 'organizer', bio: 'Event coordinator.' },
            { id: 'user1', name: 'Regular User', email: 'user@example.com', role: 'user', bio: 'Loves attending events.' },
        ];
        localStorage.setItem('mockUsers', JSON.stringify(initialUsers));
    }
    if (!localStorage.getItem('mockEvents')) {
        const initialEvents = [
            {
                id: 'event1',
                title: 'Community Tech Meetup',
                description: 'A monthly gathering for tech enthusiasts and professionals.',
                date: '2025-07-20',
                time: '18:00',
                location: 'Innovation Hub, City Center',
                organizerId: 'organizer1',
                status: 'approved',
                attendees: ['user1']
            },
            {
                id: 'event2',
                title: 'Local Artisan Fair',
                description: 'Showcasing handmade crafts and local produce.',
                date: '2025-08-05',
                time: '10:00',
                location: 'Town Square Park',
                organizerId: 'organizer1',
                status: 'pending', // Example of a pending event
                attendees: []
            },
            {
                id: 'event3',
                title: 'Hiking Trail Exploration',
                description: 'Explore the scenic trails of the local nature reserve.',
                date: '2025-09-15',
                time: '08:30',
                location: 'Mountain Foot Trailhead',
                organizerId: 'organizer1',
                status: 'approved',
                attendees: ['user1']
            }
        ];
        localStorage.setItem('mockEvents', JSON.stringify(initialEvents));
    }
};

initializeMockData(); // Call to initialize data on script load

// --- User Functions ---

export const fetchUsers = async () => {
    return new Promise(resolve => {
        setTimeout(() => {
            const users = JSON.parse(localStorage.getItem('mockUsers') || '[]');
            resolve(users);
        }, 500); // Simulate network delay
    });
};

// fetchUserById should return null if not found, NOT throw an error
export const fetchUserById = async (id) => {
    return new Promise(resolve => {
        setTimeout(() => {
            const users = JSON.parse(localStorage.getItem('mockUsers') || '[]');
            const user = users.find(u => u.id === id);
            // This is the crucial part: resolve with null if user is not found
            resolve(user || null); // Return null if not found
        }, 500);
    });
};


// updateUser should perform an upsert (create if not found, update if found)
export const updateUser = async (id, data) => {
    return new Promise(resolve => {
        setTimeout(() => {
            let users = JSON.parse(localStorage.getItem('mockUsers') || '[]');
            const index = users.findIndex(u => u.id === id);
            let updatedUser;

            if (index !== -1) {
                // User found, update existing user
                updatedUser = { ...users[index], ...data };
                users[index] = updatedUser;
            } else {
                // User not found, create new user
                updatedUser = { id, ...data }; // Ensure the ID is correctly set from the parameter
                users.push(updatedUser);
            }
            localStorage.setItem('mockUsers', JSON.stringify(users));
            resolve(updatedUser);
        }, 500); // Simulate network delay
    });
};

export const deleteUser = async (id) => {
    return new Promise(resolve => {
        setTimeout(() => {
            let users = JSON.parse(localStorage.getItem('mockUsers') || '[]');
            const initialLength = users.length;
            users = users.filter(user => user.id !== id);
            localStorage.setItem('mockUsers', JSON.stringify(users));
            resolve(users.length < initialLength); // Resolve true if user was deleted
        }, 500);
    });
};


// --- Event Functions ---

export const fetchEvents = async (statusFilter = 'all') => {
    return new Promise(resolve => {
        setTimeout(() => {
            const events = JSON.parse(localStorage.getItem('mockEvents') || '[]');
            if (statusFilter === 'all') {
                resolve(events);
            } else {
                resolve(events.filter(event => event.status === statusFilter));
            }
        }, 500);
    });
};

export const fetchEventById = async (id) => {
    return new Promise(resolve => {
        setTimeout(() => {
            const events = JSON.parse(localStorage.getItem('mockEvents') || '[]');
            const event = events.find(e => e.id === id);
            resolve(event || null);
        }, 500);
    });
};

export const createEvent = async (eventData) => {
    return new Promise(resolve => {
        setTimeout(() => {
            let events = JSON.parse(localStorage.getItem('mockEvents') || '[]');
            const newEvent = {
                id: `event${Date.now()}`, // Simple unique ID
                status: 'pending', // New events are pending by default
                attendees: [],
                ...eventData
            };
            events.push(newEvent);
            localStorage.setItem('mockEvents', JSON.stringify(events));
            resolve(newEvent);
        }, 500);
    });
};

export const updateEvent = async (id, data) => {
    return new Promise(resolve => {
        setTimeout(() => {
            let events = JSON.parse(localStorage.getItem('mockEvents') || '[]');
            const index = events.findIndex(e => e.id === id);
            if (index !== -1) {
                events[index] = { ...events[index], ...data };
                localStorage.setItem('mockEvents', JSON.stringify(events));
                resolve(events[index]);
            } else {
                // If you want to allow creating new events via updateEvent, add logic here:
                // const newEvent = { id, ...data };
                // events.push(newEvent);
                // localStorage.setItem('mockEvents', JSON.stringify(events));
                // resolve(newEvent);
                // For now, it only updates existing.
                resolve(null); // Or throw an error if you strictly want to prevent non-existent updates
            }
        }, 500);
    });
};

export const deleteEvent = async (id) => {
    return new Promise(resolve => {
        setTimeout(() => {
            let events = JSON.parse(localStorage.getItem('mockEvents') || '[]');
            const initialLength = events.length;
            events = events.filter(event => event.id !== id);
            localStorage.setItem('mockEvents', JSON.stringify(events));
            resolve(events.length < initialLength);
        }, 500);
    });
};

// --- Attendance Functions ---

export const toggleAttendance = async (eventId, userId) => {
    return new Promise(resolve => {
        setTimeout(() => {
            let events = JSON.parse(localStorage.getItem('mockEvents') || '[]');
            const eventIndex = events.findIndex(e => e.id === eventId);

            if (eventIndex !== -1) {
                const event = events[eventIndex];
                const isAttending = event.attendees.includes(userId);

                if (isAttending) {
                    // Remove user from attendees
                    event.attendees = event.attendees.filter(id => id !== userId);
                } else {
                    // Add user to attendees
                    event.attendees.push(userId);
                }
                localStorage.setItem('mockEvents', JSON.stringify(events));
                resolve(event); // Resolve with the updated event
            } else {
                resolve(null); // Event not found
            }
        }, 500);
    });
};