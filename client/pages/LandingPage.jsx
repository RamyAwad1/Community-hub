import { Link } from "react-router-dom";
import Layout from "../layout/Layout.jsx";
import "../css/LandingPage.css"; 

const LandingPage = () => {
  return (
    <Layout>
      <main className="landing-page-main"> {/* Overall container for landing page content */}

        <section className="hero-section">
          <h1>Welcome to CommunityConnect</h1>
          <p>Join, create, or manage local events with ease.</p>
          {/* <div className="hero-cta">
            <Link to="/login" className="btn primary cta-button">Log In</Link>
            <Link to="/register" className="btn secondary cta-button">Sign Up</Link>
          </div> */}
        </section>

   
        <section className="feature-section">
          <h2>What You Can Do</h2>
          <div className="cards-container"> 

         
            <div className="card">
              <img src="/images/discover-events.jpg" alt="Discover Events" className="card-image" />
              <h3>Discover Amazing Events</h3> 
              <p>Explore a variety of local events tailored to your interests. Find your next adventure!</p>
            </div>

          
            <div className="card">
              <img src="/images/location-map.jpg" alt="Location Map" className="card-image" />
              <h3>Effortless Location Mapping</h3> 
              <p>Easily find events near you with our integrated mapping features. Never miss out!</p>
            </div>

         
            <div className="card">
              <img src="/images/host-events.jpg" alt="Host Your Own Event" className="card-image" />
              <h3>Become an Impactful Host</h3>
              <p>Create and manage your own community events with intuitive tools and support.</p>
            </div>

          </div> 
        </section>

        <section className="about-section">
          <h2>About CommunityConnect</h2>
          <p>Our mission is to strengthen communities by making it easier for people to come together and take action locally.</p>
        </section>

      </main>
    </Layout>
  );
};

export default LandingPage;