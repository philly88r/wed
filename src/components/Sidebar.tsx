// @ts-nocheck
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Users,
  Calendar,
  CheckSquare,
  Image,
  MapPin,
  ShoppingBag,
  LayoutDashboard,
  DollarSign,
  Truck,
  PartyPopper,
  Music,
  Camera,
  Heart,
  BookHeart,
  Clock,
  AlertCircle,
  Shirt,
  Cake,
  LogOut,
  LogIn,
  TableProperties
} from 'lucide-react';
import { getSupabase } from '../supabaseClient';
import { useState, useEffect } from 'react';

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Timeline', href: '/timeline', icon: Calendar },
  { name: 'Budget', href: '/budget', icon: DollarSign },
  { name: 'Vendors', href: '/vendors', icon: Truck },
  { name: 'Guests', href: '/guests', icon: Users },
  { name: 'Checklist', href: '/checklist', icon: CheckSquare },
  { name: 'Events', href: '/events', icon: PartyPopper },
  { name: 'Vision Board', href: '/vision-board', icon: Image },
  { name: 'Venue Layout', href: '/venue-layout', icon: TableProperties },
  { name: 'Seating Chart', href: '/seating-chart', icon: MapPin },
  { name: 'Catering', href: '/catering', icon: Cake },
  { name: 'Music', href: '/music', icon: Music },
  { name: 'Photos', href: '/photos', icon: Camera },
  { name: 'Ceremony', href: '/ceremony', icon: Heart },
  { name: 'Vows', href: '/vows', icon: BookHeart },
  { name: 'Schedule', href: '/schedule', icon: Clock },
  { name: 'Emergency', href: '/emergency', icon: AlertCircle },
  { name: 'Attire', href: '/attire', icon: Shirt },
  { name: 'TEST PAGE', href: '/test', icon: AlertCircle }
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabaseClient = getSupabase();
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthClick = () => {
    if (user) {
      const supabaseClient = getSupabase();
      supabaseClient.auth.signOut().then(() => {
        navigate('/auth');
      });
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="fixed inset-y-0 z-50 flex w-72 flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
        <div className="flex h-16 shrink-0 items-center justify-between">
          <h1 className="text-2xl font-semibold" style={{ color: '#054697' }}>Wedding Planner</h1>
          <button
            onClick={handleAuthClick}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md" 
            style={{ 
              color: '#054697', 
              backgroundColor: '#FFE8E4',
              borderColor: '#FFE8E4',
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FFD5CC'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FFE8E4'}
          >
            {user ? (
              <>
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4 mr-1" />
                Login
              </>
            )}
          </button>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <li key={item.name}>
                      <NavLink
                        to={item.href}
                        className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold ${
                          isActive
                            ? 'bg-gray-50'
                            : 'hover:bg-gray-50'
                        }`}
                        style={{
                          color: isActive ? '#054697' : 'rgba(5, 70, 151, 0.8)',
                        }}
                      >
                        <item.icon
                          className={`h-6 w-6 shrink-0`}
                          style={{
                            color: isActive ? '#054697' : 'rgba(5, 70, 151, 0.6)',
                          }}
                          aria-hidden="true"
                        />
                        {item.name}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
