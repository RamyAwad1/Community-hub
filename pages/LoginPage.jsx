import { useAuth0 } from "@auth0/auth0-react";
import Navbar from "../components/Nav.jsx";
import Footer from "../components/Footer.jsx";

const LoginPage = () => {
  const { loginWithRedirect, isLoading, error } = useAuth0();

  const handleLogin = () => {
    loginWithRedirect();
  };

  return (
    <>
      <Navbar />
      <div className="login-page">
        <h2>Log In to Your Account</h2>
        <p>Access your dashboard, create or join events, and more.</p>

        {isLoading && <p>Loading...</p>}
        {error && <p className="error">{error.message}</p>}

        <button className="btn primary" onClick={handleLogin}>
          Log In with Auth0
        </button>
      </div>
      <Footer />
    </>
  );
};

export default LoginPage;
