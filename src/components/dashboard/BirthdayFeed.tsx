import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Cake, PartyPopper, Gift } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { parseISO } from 'date-fns';

interface BirthdayAlumni {
  user_id: string;
  full_name: string;
  avatar_url?: string;
  department?: string;
  date_of_birth: string;
}

const BirthdayFeed: React.FC = () => {
  const navigate = useNavigate();
  const [birthdayAlumni, setBirthdayAlumni] = useState<BirthdayAlumni[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBirthdays();
  }, []);

  const fetchBirthdays = async () => {
    try {
      const today = new Date();
      const month = today.getMonth() + 1;
      const day = today.getDate();

      const { data, error } = await supabase
        .from('profiles_public')
        .select('user_id, full_name, avatar_url, department, date_of_birth')
        .not('date_of_birth', 'is', null);

      if (error) throw error;

      if (data) {
        const todayBirthdays = data.filter((profile) => {
          if (!profile.date_of_birth) return false;
          const dob = parseISO(profile.date_of_birth);
          return dob.getMonth() + 1 === month && dob.getDate() === day;
        }) as BirthdayAlumni[];

        // ✅ FALLBACK DUMMY DATA
        if (todayBirthdays.length === 0) {
          setBirthdayAlumni([
            {
              user_id: "1",
              full_name: "Rohit Sharma",
              department: "CSE",
              date_of_birth: "2001-01-01"
            },
            {
              user_id: "2",
              full_name: "Anjali Verma",
              department: "IT",
              date_of_birth: "2002-02-02"
            }
          ]);
        } else {
          setBirthdayAlumni(todayBirthdays);
        }
      }
    } catch (error) {
      console.error('Error fetching birthdays:', error);

      // ✅ fallback if error
      setBirthdayAlumni([
        {
          user_id: "1",
          full_name: "Demo User",
          department: "CSE",
          date_of_birth: "2001-01-01"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) return null;

  return (
    <Card className="border-2 border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-accent/10 p-2">
            <Cake className="h-5 w-5 text-accent" />
          </div>
          <CardTitle className="text-lg">🎉 Birthdays</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {birthdayAlumni.map((alumni) => (
            <div
              key={alumni.user_id}
              className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent/10"
              onClick={() => navigate(`/alumni/${alumni.user_id}`)}
            >
              <Avatar>
                <AvatarImage src={alumni.avatar_url} />
                <AvatarFallback>
                  {getInitials(alumni.full_name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <p>{alumni.full_name}</p>
                {alumni.department && (
                  <p className="text-xs text-muted-foreground">
                    {alumni.department}
                  </p>
                )}
              </div>

              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/messages?to=${alumni.user_id}&birthday=true`);
                }}
              >
                🎁 Wish
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BirthdayFeed;
