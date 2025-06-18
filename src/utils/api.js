const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'; // Use environment variable or fallback

const makeAuthenticatedRequest = async (method, path, body = null, tokenProvider) => {
  try {
    let token;
    // Check if tokenProvider is a function (Auth0's getAccessTokenSilently)
    if (typeof tokenProvider === 'function') {
      token = await tokenProvider({
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        scope: 'read:events manage:events',
      });
    } else if (typeof tokenProvider === 'string') {
      // If a string token is passed directly (less common but possible for specific cases)
      token = tokenProvider;
    } else {
      throw new Error('Invalid tokenProvider provided to makeAuthenticatedRequest.');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    const config = {
      method: method,
      headers: headers,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${path}`, config);

    if (!response.ok) {
      const errorData = await response.json(); // Attempt to parse error JSON
      const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return await response.json();
    } else {
      return response; // Return raw response for cases like 204 No Content
    }

  } catch (error) {
    console.error(`API Error (${method} ${path}):`, error.message);
    throw error;
  }
};

// Public request maker (for routes that don't need authentication)
const makePublicRequest = async (method, path) => {
  try {
    const headers = { 'Content-Type': 'application/json' };
    const config = { method, headers };

    const response = await fetch(`${API_BASE_URL}${path}`, config);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return await response.json();
    } else {
      return response;
    }
  } catch (error) {
    console.error(`Public API Error (${method} ${path}):`, error.message);
    throw error;
  }
};


export const usersApi = {
  // `getAccessTokenSilently` passed as tokenProvider function
  upsertUser: async (userData, getAccessTokenSilently) => makeAuthenticatedRequest('POST', '/users', userData, getAccessTokenSilently),
  getUserProfile: async (getAccessTokenSilently) => makeAuthenticatedRequest('GET', '/users/profile', null, getAccessTokenSilently),
  updateUserProfile: async (userData, getAccessTokenSilently) => makeAuthenticatedRequest('PUT', '/users/profile', userData, getAccessTokenSilently),
  getAllUsers: async (getAccessTokenSilently) => makeAuthenticatedRequest('GET', '/admin/users', null, getAccessTokenSilently), // Admin only
};

export const eventsApi = {
    // Public event fetching
    getAllApprovedEvents: async () => makePublicRequest('GET', '/events'),
    getEventDetails: async (eventId) => makePublicRequest('GET', `/events/${eventId}`),

    // Authenticated event actions (pass getAccessTokenSilently as tokenProvider)
    createEvent: async (eventData, getAccessTokenSilently) => makeAuthenticatedRequest('POST', '/events', eventData, getAccessTokenSilently),
    approveEvent: async (eventId, getAccessTokenSilently) => makeAuthenticatedRequest('PUT', `/events/${eventId}/approve`, null, getAccessTokenSilently),
    rejectEvent: async (eventId, getAccessTokenSilently) => makeAuthenticatedRequest('PUT', `/events/${eventId}/reject`, null, getAccessTokenSilently),
    getAllEventsAdmin: async (getAccessTokenSilently) => makeAuthenticatedRequest('GET', '/admin/events', null, getAccessTokenSilently), // Admin only
    getOrganizerEvents: async (getAccessTokenSilently) => makeAuthenticatedRequest('GET', '/events/my-events', null, getAccessTokenSilently), // Organizer/Admin only
    updateEvent: async (eventId, eventData, getAccessTokenSilently) => makeAuthenticatedRequest('PUT', `/events/${eventId}`, eventData, getAccessTokenSilently),
    deleteEvent: async (eventId, getAccessTokenSilently) => makeAuthenticatedRequest('DELETE', `/events/${eventId}`, null, getAccessTokenSilently),
};
