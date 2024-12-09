import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Components/Navbar";
import NRoutes from "./Routes/NRoutes";
import Footer from "./Components/Footer";
import { useLenis } from "./hooks/useLenis";
import Loading from "./Components/Loading";
import { MotionConfig } from "framer-motion";

const App = () => {
  const [loading, setLoading] = useState(true); // Set to true initially to show the loading screen
  const location = useLocation();
  useLenis();

  useEffect(() => {
    // Set a timer to remove loading screen after 14.5 seconds
    const timer = setTimeout(() => {
      setLoading(false);
    }, 14500);

    return () => clearTimeout(timer); // Cleanup the timer
  }, []);

  useEffect(() => {
    // Scroll to the top when the route changes
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen">
        {loading ? (
          <div role="status" aria-live="polite">
            <Loading />
          </div>
        ) : (
          <div className="select-none">
            <Navbar />
            <NRoutes />
            <Footer />
          </div>
        )}
      </div>
    </MotionConfig>
  );
};

export default App;
