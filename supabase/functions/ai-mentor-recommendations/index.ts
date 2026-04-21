import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    return new Response(
      JSON.stringify({
        recommendations: [
          {
            user_id: "1",
            full_name: "Aditya Kulkarni",
            job_title: "Software Engineer",
            current_company: "Infosys",
          },
          {
            user_id: "2",
            full_name: "Rashida Khan",
            job_title: "Data Analyst",
            current_company: "TCS",
          },
          {
            user_id: "3",
            full_name: "Saniya Patel",
            job_title: "ML Engineer",
            current_company: "Accenture",
          },
          {
            user_id: "4",
            full_name: "Rahul Sharma",
            job_title: "Backend Developer",
            current_company: "Wipro",
          },
          {
            user_id: "5",
            full_name: "Amit Verma",
            job_title: "Cloud Engineer",
            current_company: "Amazon",
          },
          {
            user_id: "6",
            full_name: "Neha Joshi",
            job_title: "Frontend Developer",
            current_company: "Flipkart",
          },
          {
            user_id: "7",
            full_name: "Karan Mehta",
            job_title: "AI Engineer",
            current_company: "Google",
          },
          {
            user_id: "8",
            full_name: "Pooja Singh",
            job_title: "Product Manager",
            current_company: "Microsoft",
          }
        ],
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        recommendations: [],
        error: "Function failed",
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});