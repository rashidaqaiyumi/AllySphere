import React, { useEffect, useState } from "react";

const BirthdayNotification = () => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 3000); // ⏱ auto hide after 3 sec

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px", // ✅ moved to bottom (no overlap now)
        right: "20px",
        background: "#ffeb3b",
        padding: "12px 18px",
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        zIndex: 1000,
        fontWeight: "500",
      }}
    >
      🎉 Happy Birthday to our Alumni!
    </div>
  );
};

export default BirthdayNotification;