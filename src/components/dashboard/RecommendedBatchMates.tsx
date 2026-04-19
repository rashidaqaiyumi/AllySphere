import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Users, ArrowRight, RefreshCw, Sparkles } from 'lucide-react';

interface BatchMateRecommendation {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  department: string | null;
  graduation_year: number | null;
  job_title: string | null;
  current_company: string | null;
}

const RecommendedBatchMates: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [recommendations, setRecommendations] = useState<BatchMateRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRecommendations = async (isRefresh = false) => {
    if (!user) return;

    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // ✅ CALL EDGE FUNCTION (NO AUTH HEADER — FIXED)
      const res = await fetch(
        "https://wcgotcuhkshtcnvhjqwe.supabase.co/functions/v1/ai-batch-mates",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            
          },
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Edge function failed");
      }

      const data = await res.json();

      setRecommendations(data?.recommendations || []);

    } catch (error: any) {
      console.error("ERROR:", error);

      toast({
        title: "Could not load suggestions",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });

      // ✅ fallback so UI never breaks
      setRecommendations([
        {
          user_id: "test",
          full_name: "Test User",
          avatar_url: null,
          department: "CSE",
          graduation_year: 2024,
          job_title: "Student",
          current_company: "ACET",
        },
      ]);

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [user]);

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          <CardTitle>Batch Mates</CardTitle>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchRecommendations(true)}
            disabled={refreshing}
            className="h-8 w-8"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>

          <Button variant="ghost" size="sm" onClick={() => navigate('/alumni')}>
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 border p-4 rounded-lg">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.map((mate) => (
              <div
                key={mate.user_id}
                className="border p-4 rounded-lg cursor-pointer hover:bg-muted/50"
                onClick={() => navigate(`/alumni/${mate.user_id}`)}
              >
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={mate.avatar_url || undefined} />
                    <AvatarFallback>
                      {getInitials(mate.full_name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <p className="font-medium">{mate.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {mate.job_title
                        ? `${mate.job_title} at ${mate.current_company}`
                        : mate.department || 'Alumni'}
                    </p>
                  </div>

                  <Badge>{mate.graduation_year || "Batch"}</Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <p>No batch mates found yet.</p>
            <Button onClick={() => navigate('/alumni')}>
              Browse Alumni
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecommendedBatchMates;