
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';

const MentorshipPage = () => {
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      const { data, error } = await supabase.functions.invoke(
        'ai-mentor-recommendations'
      );

      console.log("FUNCTION RESPONSE:", data, error);

      if (error) throw error;

      if (data && Array.isArray(data.recommendations)) {
        setMentors(data.recommendations);
      } else {
        setMentors([]);
      }
    } catch (err) {
      console.error("ERROR:", err);
      setMentors([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: "20px" }}>Loading...</div>;

  return (
    <Layout>
      <div style={{ padding: "20px" }}>
        <h1>Mentorship</h1>

        {mentors.length > 0 ? (
          mentors.map((m, index) => (
            <div
              key={m.user_id}
              onClick={() => navigate(`/alumni/${m.user_id}`)}
              style={{
                border: "1px solid #ddd",
                margin: "12px 0",
                padding: "16px",
                borderRadius: "10px",
                cursor: "pointer",
                background: "#fff",
                transition: "0.2s",
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f5f5f5")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#fff")
              }
            >
              {/* ✅ NAME */}
              <h3 style={{ margin: 0 }}>{m.full_name}</h3>

              {/* ✅ JOB */}
              <p style={{ margin: "5px 0 10px", color: "#555" }}>
                {m.job_title} at {m.current_company}
              </p>

              {/* ✅ ⭐ AI TAG */}
              {index === 0 && (
                <span style={{
                  background: "#FFD700",
                  padding: "4px 8px",
                  borderRadius: "5px",
                  fontSize: "12px",
                  marginBottom: "8px",
                  display: "inline-block"
                }}>
                  ⭐ Top Match
                </span>
              )}

              {/* ✅ 🤖 AI REASON */}
              <p style={{ fontSize: "13px", color: "#888", marginTop: "8px" }}>
                🤖 {m.reason || "Recommended based on your profile and interests"}
              </p>

              {/* ✅ BUTTON */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/alumni/${m.user_id}`);
                }}
                style={{
                  marginTop: "10px",
                  padding: "6px 12px",
                  background: "#4CAF50",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                View Profile
              </button>
            </div>
          ))
        ) : (
          <p>No mentors found</p>
        )}
      </div>
    </Layout>
  );
};

export default MentorshipPage;