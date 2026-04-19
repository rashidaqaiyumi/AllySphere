import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";

const AdminPage = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

        <div className="flex gap-4">
          {/* Create Event */}
          <button
            onClick={() => navigate("/add-event")}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Create Event
          </button>

          {/* ✅ NEW: Post Job */}
          <button
            onClick={() => navigate("/jobs")}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Post Job
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default AdminPage;