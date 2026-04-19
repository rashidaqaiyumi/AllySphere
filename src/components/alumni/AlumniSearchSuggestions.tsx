import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Search, User, Building2, GraduationCap, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Suggestion {
  type: 'name' | 'company' | 'department' | 'batch' | 'skill';
  value: string;
  label: string;
  icon: React.ReactNode;
  user_id?: string; // ✅ FIX
}

interface AlumniSearchSuggestionsProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSearch: (query: string, type?: string) => void;
  onSuggestionSelect: (suggestion: Suggestion) => void;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  name: <User className="h-4 w-4 text-primary" />,
  company: <Building2 className="h-4 w-4 text-accent" />,
  department: <GraduationCap className="h-4 w-4 text-primary" />,
  batch: <GraduationCap className="h-4 w-4 text-muted-foreground" />,
  skill: <Sparkles className="h-4 w-4 text-accent" />,
};

const TYPE_LABELS: Record<string, string> = {
  name: 'Alumni',
  company: 'Company',
  department: 'Department',
  batch: 'Batch',
  skill: 'Skill',
};

const AlumniSearchSuggestions: React.FC<AlumniSearchSuggestionsProps> = ({
  query,
  onQueryChange,
  onSearch,
  onSuggestionSelect,
}) => {
  const navigate = useNavigate(); // ✅ FIX
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeout = setTimeout(() => fetchSuggestions(query), 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const fetchSuggestions = async (q: string) => {
    setLoading(true);
    try {
      const results: Suggestion[] = [];

      // ✅ FETCH NAMES WITH USER_ID
      const { data: profiles } = await supabase
        .from('profiles_public')
        .select('user_id, full_name')
        .ilike('full_name', `%${q}%`)
        .limit(5);

      if (profiles) {
        profiles.forEach((p) => {
          results.push({
            type: 'name',
            value: p.full_name,
            label: p.full_name,
            icon: TYPE_ICONS.name,
            user_id: p.user_id, // ✅ IMPORTANT
          });
        });
      }

      setSuggestions(results);
      setShowSuggestions(true);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search alumni..."
          className="w-full pl-12 pr-4 h-14 rounded-xl border-2 border-primary/20 focus:border-primary"
        />
      </div>

      {showSuggestions && (
        <div className="absolute z-50 w-full bg-white border rounded-lg shadow mt-1">
          {suggestions.map((s) => (
            <button
              key={s.label}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
              onMouseDown={(e) => {
                e.preventDefault();

                // ✅ MAIN FIX (NAVIGATE TO PROFILE)
                if (s.type === 'name' && s.user_id) {
                  navigate(`/alumni/${s.user_id}`);
                } else {
                  onSuggestionSelect(s);
                }

                setShowSuggestions(false);
              }}
            >
              {s.icon}
              {s.label}
            </button>
          ))}

          {/* Search all */}
          <button
            className="w-full px-4 py-2 text-left hover:bg-gray-100 text-primary"
            onMouseDown={(e) => {
              e.preventDefault();
              onSearch(query);
              setShowSuggestions(false);
            }}
          >
            Search all for "{query}"
          </button>
        </div>
      )}
    </div>
  );
};

export default AlumniSearchSuggestions;
