import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IdleTimerProvider } from "react-idle-timer";
import { Modal, Button } from "react-bootstrap";

const AutoLogout = ({ children }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  const idleTimeout = 1000 * 60 * 10; // 10 minutes of inactivity
  const warningTime = 1000 * 60; // show warning 1 minute before logout
  const countdownTimer = useRef(null);

  const logout = async () => {
    try {
      await fetch("http://localhost:1000/user/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setShowModal(false);
      navigate("/login");
    }
  };

  const onIdle = () => {
    // Check if cookie exists
    const cookieExists = document.cookie.includes("AUTH-TOKEN");
    if (!cookieExists) {
      navigate("/login");
      return;
    }

    // Show modal for warningTime duration
    setShowModal(true);
    let timeLeft = warningTime / 1000;
    setRemainingTime(timeLeft);

    countdownTimer.current = setInterval(() => {
      timeLeft -= 1;
      setRemainingTime(timeLeft);
      if (timeLeft <= 0) {
        clearInterval(countdownTimer.current);
        logout();
      }
    }, 1000);
  };

  const stayActive = () => {
    clearInterval(countdownTimer.current);
    setShowModal(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => clearInterval(countdownTimer.current);
  }, []);

  return (
    <IdleTimerProvider
      timeout={idleTimeout} // full idle timeout
      onIdle={onIdle}
      debounce={500} // wait 0.5s after activity before counting idle
    >
      {children}

      <Modal show={showModal} onHide={stayActive} centered>
        <Modal.Header>
          <Modal.Title>Session Expiring</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          You have been idle. You will be logged out in {remainingTime} seconds.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={stayActive}>
            Stay Logged In
          </Button>
          <Button variant="danger" onClick={logout}>
            Logout Now
          </Button>
        </Modal.Footer>
      </Modal>
    </IdleTimerProvider>
  );
};

export default AutoLogout;
