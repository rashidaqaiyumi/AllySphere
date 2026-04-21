import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, ArrowRight, RefreshCw, GraduationCap, Building, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MentorRecommendation {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  department: string | null;
  graduation_year: number | null;
  job_title: string | null;
  current_company: string | null;
  industry: string | null;
  skills: string[];
  mentorship_areas: string[];
  match_reason: string;
  shared_areas: string[];
}

const RecommendedMentors = () => {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<MentorRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRecommendations = async (isRefresh = false) => {
    if (!user || !session) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-mentor-recommendations', {
        body: {},
      });

      if (error) {
        console.error('AI recommendations error:', error);
        toast({
          title: 'Could not load recommendations',
          description: error.message || 'Please try again later.',
          variant: 'destructive',
        });
      } else if (data?.recommendations) {
        setRecommendations(data.recommendations);
      }
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [user, session]);

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          <CardTitle>Recommended Mentors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 rounded-lg border border-border p-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          <CardTitle>Recommended Mentors</CardTitle>
          <Badge variant="outline" className="text-xs">AI-Powered</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchRecommendations(true)}
            disabled={refreshing}
            title="Refresh recommendations"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate('/mentorship')}>
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.map((mentor) => (
              <div
                key={mentor.user_id}
                className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={mentor.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(mentor.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{mentor.full_name}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Briefcase className="h-3 w-3" />
                      <span className="truncate">
                        {mentor.job_title || 'Professional'} {mentor.current_company ? `at ${mentor.current_company}` : ''}
                      </span>
                    </div>
                    {mentor.department && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <Building className="h-3 w-3" />
                        <span>{mentor.department}{mentor.graduation_year ? ` • Class of ${mentor.graduation_year}` : ''}</span>
                      </div>
                    )}
                    {mentor.match_reason && (
                      <p className="text-xs text-muted-foreground mt-2 italic">
                        💡 {mentor.match_reason}
                      </p>
                    )}
                    {mentor.shared_areas.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {mentor.shared_areas.slice(0, 4).map((area, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-3 ml-16">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/alumni/${mentor.user_id}`)}
                  >
                    View Profile
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate('/mentorship')}
                  >
                    Connect
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">
              No AI-matched mentors found yet. Update your profile with skills and interests to get personalized recommendations.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => navigate('/profile')}>
              Update Profile
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecommendedMentors;
