import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Search, Filter } from "lucide-react";
import AlumniPostJobForm from "@/components/jobs/AlumniPostJobForm";
import AlumniMyJobs from "@/components/jobs/AlumniMyJobs";
import JobCard from "@/components/jobs/JobCard";
import JobDetailDialog from "@/components/jobs/JobDetailDialog";

const JobsPage = () => {
  const { user, userRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterWorkMode, setFilterWorkMode] = useState("all");
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [postFormKey, setPostFormKey] = useState(0);

  const isAlumni = userRole === "alumni" || userRole === "admin";
  const isStudent = userRole === "student";
  // Faculty and admin can view but not post

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch poster profiles for display
  const posterIds = [...new Set(jobs?.map((j) => j.posted_by) || [])];
  const { data: posterProfiles } = useQuery({
    queryKey: ["poster-profiles", posterIds],
    queryFn: async () => {
      if (!posterIds.length) return {};
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, department")
        .in("user_id", posterIds);
      if (error) throw error;
      const map: Record<string, { full_name: string; department: string }> = {};
      data?.forEach((p) => { map[p.user_id] = { full_name: p.full_name, department: p.department || "" }; });
      return map;
    },
    enabled: posterIds.length > 0,
  });

  const filteredJobs = jobs?.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.skills || []).some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === "all" || job.job_type === filterType;
    const matchesWorkMode = filterWorkMode === "all" || job.work_mode === filterWorkMode;
    return matchesSearch && matchesType && matchesWorkMode;
  });

  const jobListContent = (
    <>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs, companies, or skills..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-44">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Job Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="full-time">Full-Time</SelectItem>
            <SelectItem value="part-time">Part-Time</SelectItem>
            <SelectItem value="internship">Internship</SelectItem>
            <SelectItem value="remote">Remote</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterWorkMode} onValueChange={setFilterWorkMode}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Work Mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modes</SelectItem>
            <SelectItem value="on-site">On-site</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
            <SelectItem value="remote">Remote</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Job Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6"><div className="h-32 bg-muted rounded" /></CardContent>
            </Card>
          ))}
        </div>
      ) : filteredJobs?.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No jobs found</h3>
            <p className="text-muted-foreground">Check back later for new opportunities</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs?.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              posterProfile={posterProfiles?.[job.posted_by]}
              showApply={isStudent}
              onViewDetails={() => setSelectedJob(job)}
            />
          ))}
        </div>
      )}

      <JobDetailDialog
        job={selectedJob}
        posterProfile={selectedJob ? posterProfiles?.[selectedJob.posted_by] : null}
        open={!!selectedJob}
        onOpenChange={(open) => { if (!open) setSelectedJob(null); }}
        showApply={isStudent}
      />
    </>
  );

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            {isAlumni ? "Job Board" : "Job Opportunities"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isAlumni
              ? "Post and manage job opportunities for ACET students"
              : "Exclusive opportunities from ACET alumni network"}
          </p>
        </div>

        {isAlumni ? (
          <Tabs defaultValue="post" className="space-y-6">
            <TabsList>
              <TabsTrigger value="browse">Browse Jobs</TabsTrigger>
              <TabsTrigger value="post">Post a Job</TabsTrigger>
              <TabsTrigger value="my-jobs">My Jobs</TabsTrigger>
            </TabsList>
            <TabsContent value="browse">{jobListContent}</TabsContent>
            <TabsContent value="post">
              <div className="max-w-3xl mx-auto">
                <AlumniPostJobForm
                  key={postFormKey}
                  onSuccess={() => {
                    setPostFormKey((k) => k + 1);
                  }}
                />
              </div>
            </TabsContent>
            <TabsContent value="my-jobs">
              <AlumniMyJobs />
            </TabsContent>
          </Tabs>
        ) : (
          jobListContent
        )}
      </div>
    </Layout>
  );
};

export default JobsPage;
