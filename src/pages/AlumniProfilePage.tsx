import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ProfilePublic, AlumniDetails } from '@/types/database';
import { 
  Building2, 
  Briefcase, 
  GraduationCap, 
  Calendar, 
  Linkedin, 
  MessageSquare, 
  UserPlus,
  ArrowLeft,
  MapPin,
  Award,
  Cake
} from 'lucide-react';
import { format } from 'date-fns';

const AlumniProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<ProfilePublic | null>(null);
  const [alumniDetails, setAlumniDetails] = useState<AlumniDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (userId && user) {
      fetchProfile();
      checkConnectionStatus();
    }
  }, [userId, user]);

  const fetchProfile = async () => {
    try {
      // Fetch profile (works for any user)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles_public')
        .select('*')
        .eq('user_id', userId)
        .single();
      console.log("User ID:", userId);
      console.log("Profile Data:", profileData);
      console.log("Error:", profileError);
      if (profileError) throw profileError;
      
      setProfile(profileData); //as unknown as ProfilePublic);
      

      // Fetch alumni details if they exist
      const { data: alumniData } = await supabase
        .from('alumni_details')
        .select('*')
        .eq('user_id', userId!)
        .maybeSingle();

      if (alumniData) {
        setAlumniDetails(alumniData as unknown as AlumniDetails);
      }
    } catch (error:any) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const checkConnectionStatus = async () => {
    if (!user || !userId) return;
    
    const { data } = await supabase
      .from('connections')
      .select('status')
      .or(`and(requester_id.eq.${user.id},receiver_id.eq.${userId}),and(requester_id.eq.${userId},receiver_id.eq.${user.id})`)
      .maybeSingle();

    if (data) {
      setConnectionStatus(data.status);
    }
  };

  const handleConnect = async () => {
    if (!user || !userId) return;

    try {
      const { error } = await supabase.from('connections').insert({
        requester_id: user.id,
        receiver_id: userId,
        status: 'pending',
      });

      if (error) {
        if (error.code === '23505') {
          toast({ title: 'Already connected', description: 'You have already sent a connection request.' });
        } else {
          throw error;
        }
      } else {
        setConnectionStatus('pending');
        toast({ title: 'Connection request sent', description: 'Your connection request has been sent.' });
      }
    } catch (error) {
      console.error('Error connecting:', error);
      toast({ title: 'Error', description: 'Failed to send connection request.', variant: 'destructive' });
    }
  };

  const handleMessage = () => {
    navigate(`/messages?to=${userId}`);
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      return format(new Date(dateStr), 'MMMM d, yyyy');
    } catch {
      return null;
    }
  };

  const isBirthdayToday = (dateStr?: string) => {
    if (!dateStr) return false;
    try {
      const dob = new Date(dateStr);
      const today = new Date();
      return dob.getMonth() === today.getMonth() && dob.getDate() === today.getDate();
    } catch {
      return false;
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-64 w-full" />
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Profile not found</h2>
            <Button variant="link" onClick={() => navigate('/alumni')}>
              Back to Alumni Directory
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Profile Card */}
          <Card className="lg:col-span-2">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <Avatar className="h-24 w-24 border-4 border-border">
                  <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                    {getInitials(profile.full_name || '')}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                        {profile.full_name}
                        {isBirthdayToday(profile.date_of_birth) && (
                          <Badge className="bg-gradient-to-r from-pink-500 to-yellow-500 text-white">
                            <Cake className="h-3 w-3 mr-1" />
                            Birthday!
                          </Badge>
                        )}
                      </h1>
                      {alumniDetails?.job_title && (
                        <p className="text-lg text-muted-foreground mt-1">
                          {alumniDetails.job_title}
                        </p>
                      )}
                    </div>
                    {alumniDetails?.is_mentor_available && (
                      <Badge variant="secondary" className="bg-accent/10 text-accent">
                        Available for Mentorship
                      </Badge>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {alumniDetails?.current_company && (
                      <span className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {alumniDetails.current_company}
                      </span>
                    )}
                    {alumniDetails?.industry && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {alumniDetails.industry}
                      </span>
                    )}
                    {profile.graduation_year && (
                      <span className="flex items-center gap-1">
                        <GraduationCap className="h-4 w-4" />
                        Class of {profile.graduation_year}
                      </span>
                    )}
                    {profile.department && (
                      <span className="flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        {profile.department}
                      </span>
                    )}
                    {alumniDetails && alumniDetails.years_of_experience > 0 && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {alumniDetails.years_of_experience} years experience
                      </span>
                    )}
                  </div>

                  {/* Actions - hide if viewing own profile */}
                  {user?.id !== userId && (
                    <div className="mt-6 flex gap-3 flex-wrap">
                      {connectionStatus === 'accepted' ? (
                        <Badge variant="secondary">Connected</Badge>
                      ) : connectionStatus === 'pending' ? (
                        <Badge variant="outline">Request Pending</Badge>
                      ) : (
                        <Button onClick={handleConnect}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Connect
                        </Button>
                      )}
                      <Button variant="outline" onClick={handleMessage}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      {profile.linkedin_url && (
                        <Button variant="outline" asChild>
                          <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                            <Linkedin className="h-4 w-4 mr-2" />
                            LinkedIn
                          </a>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <Separator className="my-6" />

              {profile.bio && (
                <div className="mb-6">
                  <h3 className="font-semibold text-foreground mb-2">About</h3>
                  <p className="text-muted-foreground">{profile.bio}</p>
                </div>
              )}

              {alumniDetails?.skills && alumniDetails.skills.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-foreground mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {alumniDetails.skills.map((skill, index) => (
                      <Badge key={index} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {alumniDetails?.mentorship_areas && alumniDetails.mentorship_areas.length > 0 && (
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Mentorship Areas</h3>
                  <div className="flex flex-wrap gap-2">
                    {alumniDetails.mentorship_areas.map((area, index) => (
                      <Badge key={index} className="bg-primary/10 text-primary">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.department && (
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Department</p>
                      <p className="font-medium">{profile.department}</p>
                    </div>
                  </div>
                )}
                {profile.graduation_year && (
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Batch</p>
                      <p className="font-medium">{profile.graduation_year}</p>
                    </div>
                  </div>
                )}
                {profile.date_of_birth && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Birthday</p>
                      <p className="font-medium">{formatDate(profile.date_of_birth)}</p>
                    </div>
                  </div>
                )}
                {alumniDetails?.current_company && (
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Company</p>
                      <p className="font-medium">{alumniDetails.current_company}</p>
                    </div>
                  </div>
                )}
                {alumniDetails?.industry && (
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Industry</p>
                      <p className="font-medium">{alumniDetails.industry}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AlumniProfilePage;
