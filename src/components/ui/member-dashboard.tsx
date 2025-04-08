import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button, Snackbar, Alert } from "@mui/material";
import { 
  Video, 
  Users, 
  DollarSign, 
  FileText, 
  Settings, 
  Calendar, 
  Map, 
  Camera, 
  MessageSquare,
  UploadCloud,
  Heart,
  ChevronRight
} from "lucide-react";
import { supabase } from "../../supabaseClient";

// Define the dashboard tool interface
interface DashboardTool {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  category: "planning" | "design" | "management" | "essential";
}

// Define upcoming tasks
interface Task {
  id: number;
  title: string;
  dueDate: string;
  category: string;
}

export function MemberDashboard() {
  const location = useLocation();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("Wedding Planner");
  const [weddingDate, setWeddingDate] = useState<Date>(new Date());
  const [budget, setBudget] = useState<number>(0);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Fetch user profile data and wedding details
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Get user profile from the profiles table
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('first_name, last_name, wedding_date, budget, location, guest_count, selected_plan')
            .eq('id', user.id)
            .single();
            
          if (profileError) {
            console.error('Error fetching profile:', profileError);
          } else if (profileData) {
            // Set user name based on available data
            if (profileData.first_name) {
              setUserName(profileData.first_name as string);
            } else if (profileData.last_name) {
              setUserName(`${profileData.last_name as string} Family`);
            }
            
            // Set wedding date if available
            if (profileData.wedding_date) {
              setWeddingDate(new Date(profileData.wedding_date as string));
            }
            
            // Set budget if available
            if (profileData.budget) {
              setBudget(Number(profileData.budget) || 0);
            }
            
            // Generate personalized tasks based on profile data
            const personalizedTasks = generatePersonalizedTasks(
              profileData.wedding_date ? new Date(profileData.wedding_date as string) : new Date(),
              profileData.budget ? Number(profileData.budget) : 0,
              profileData.location as string || '',
              profileData.guest_count ? Number(profileData.guest_count) : 0,
              profileData.selected_plan as string || ''
            );
            
            setUpcomingTasks(personalizedTasks);
          }
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  // Function to generate personalized tasks based on user profile
  const generatePersonalizedTasks = (
    weddingDate: Date,
    budget: number = 0,
    location: string = '',
    guestCount: number = 0,
    selectedPlan: string = ''
  ): Task[] => {
    const today = new Date();
    const monthsUntilWedding = Math.floor((weddingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30));
    const tasks: Task[] = [];
    
    // Tasks based on timeline
    if (monthsUntilWedding > 9) {
      // 9+ months before wedding
      tasks.push(
        { id: 1, title: "Book Your Venue", dueDate: formatDueDate(1), category: "essential" },
        { id: 2, title: "Start Guest List", dueDate: formatDueDate(2), category: "planning" },
        { id: 3, title: "Research Photographers", dueDate: formatDueDate(3), category: "vendor" }
      );
    } else if (monthsUntilWedding > 6) {
      // 6-9 months before wedding
      tasks.push(
        { id: 1, title: "Book Photographer & Videographer", dueDate: formatDueDate(1), category: "vendor" },
        { id: 2, title: "Shop for Wedding Attire", dueDate: formatDueDate(2), category: "planning" },
        { id: 3, title: "Book Caterer", dueDate: formatDueDate(2), category: "vendor" }
      );
    } else if (monthsUntilWedding > 3) {
      // 3-6 months before wedding
      tasks.push(
        { id: 1, title: "Send Save-the-Dates", dueDate: formatDueDate(1), category: "planning" },
        { id: 2, title: "Book Florist", dueDate: formatDueDate(2), category: "vendor" },
        { id: 3, title: "Plan Honeymoon", dueDate: formatDueDate(3), category: "planning" }
      );
    } else if (monthsUntilWedding > 1) {
      // 1-3 months before wedding
      tasks.push(
        { id: 1, title: "Send Invitations", dueDate: formatDueDate(0.5), category: "essential" },
        { id: 2, title: "Finalize Menu", dueDate: formatDueDate(1), category: "vendor" },
        { id: 3, title: "Wedding Dress Fitting", dueDate: formatDueDate(1.5), category: "planning" }
      );
    } else {
      // Less than 1 month before wedding
      tasks.push(
        { id: 1, title: "Confirm All Vendors", dueDate: formatDueDate(0.25), category: "essential" },
        { id: 2, title: "Create Seating Chart", dueDate: formatDueDate(0.5), category: "planning" },
        { id: 3, title: "Pack for Honeymoon", dueDate: formatDueDate(0.75), category: "planning" }
      );
    }
    
    // Add budget-specific tasks if budget is set
    if (budget > 0) {
      if (budget > 30000) {
        tasks.push({ id: 4, title: "Research Luxury Venues", dueDate: formatDueDate(1), category: "planning" });
      } else if (budget < 15000) {
        tasks.push({ id: 4, title: "DIY Decoration Planning", dueDate: formatDueDate(1.5), category: "budget" });
      }
    }
    
    // Add guest count specific tasks
    if (guestCount > 150) {
      tasks.push({ id: 5, title: "Book Larger Venue", dueDate: formatDueDate(2), category: "planning" });
    } else if (guestCount < 50) {
      tasks.push({ id: 5, title: "Plan Intimate Reception", dueDate: formatDueDate(2), category: "planning" });
    }
    
    // Add location-specific tasks if location is set
    if (location && location.trim() !== '') {
      tasks.push({ id: 6, title: `Research Vendors in ${location}`, dueDate: formatDueDate(1.5), category: "vendor" });
    }
    
    // Limit to 3 tasks for display
    return tasks.slice(0, 3);
  };
  
  // Helper function to format due dates based on months from now
  const formatDueDate = (monthsFromNow: number): string => {
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + Math.floor(monthsFromNow));
    
    // For partial months, add the appropriate number of days
    const fractionalPart = monthsFromNow % 1;
    if (fractionalPart > 0) {
      dueDate.setDate(dueDate.getDate() + Math.floor(fractionalPart * 30));
    }
    
    return dueDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Check if a plan was selected from the pricing page
  useEffect(() => {
    if (location.state && location.state.selectedPlan) {
      setSelectedPlan(location.state.selectedPlan);
      setNotification(`Thank you for selecting the ${location.state.selectedPlan} plan!`);
      
      // Clear the location state after 5 seconds to prevent the notification from showing again on refresh
      const timer = setTimeout(() => {
        window.history.replaceState({}, document.title);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location]);
  
  // Calculate days until wedding
  const today = new Date();
  const daysUntilWedding = Math.ceil((weddingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const formattedWeddingDate = weddingDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Handle file input trigger
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Dashboard tools definition
  const dashboardTools: DashboardTool[] = [
    {
      title: "Wedding Planning Video Tutorials",
      description: "Step-by-step video guides for planning your perfect day",
      icon: <Video className="w-6 h-6" />,
      href: "/tutorials",
      category: "planning"
    },
    {
      title: "Address Book",
      description: "Organize your guest addresses beautifully",
      icon: <Users className="w-6 h-6" />,
      href: "/directory",
      category: "essential"
    },
    {
      title: "Budget Calculator",
      description: "Track expenses and stay within your budget",
      icon: <DollarSign className="w-6 h-6" />,
      href: "/budget",
      category: "management"
    },
    {
      title: "Wedding Checklist",
      description: "Comprehensive quarter-by-quarter planning guide",
      icon: <FileText className="w-6 h-6" />,
      href: "/wedding-checklist",
      category: "planning"
    },
    {
      title: "Vendor Directory",
      description: "Find trusted vendors in your area",
      icon: <Settings className="w-6 h-6" />,
      href: "/vendors",
      category: "essential"
    },
    {
      title: "Day Of Timeline Calculator",
      description: "Create the perfect wedding day schedule",
      icon: <Calendar className="w-6 h-6" />,
      href: "/timeline-creator",
      category: "planning"
    },
    {
      title: "Floor Plan + Seating Chart Creator",
      description: "Design your perfect reception layout",
      icon: <Map className="w-6 h-6" />,
      href: "/seating-chart",
      category: "management"
    },
    {
      title: "Moodboard",
      description: "Visualize your dream wedding aesthetic",
      icon: <Camera className="w-6 h-6" />,
      href: "/mood-board",
      category: "design"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F9F9FF]">
      {/* Hero Section with Profile */}
      <div className="relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#E8B4B4]/20 blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#B8BDD7]/10 blur-3xl"></div>
        
        {selectedPlan && (
          <div className="bg-[#E8B4B4] p-4 text-[#054697] text-center">
            <p className="font-medium">
              Thank you for choosing our {selectedPlan} plan! Your subscription has been activated.
            </p>
          </div>
        )}
        
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-r from-[#E8B4B4]/30 to-[#E8B4B4]/10 p-8 md:p-10 rounded-none shadow-sm">
          {/* AI Wedding Planner in the corner */}
          <div 
            className="absolute top-4 right-4 flex items-center gap-2 bg-[#E8B4B4]/50 p-2 rounded-none cursor-pointer hover:bg-[#E8B4B4]/70 transition-colors duration-300 shadow-sm"
            onClick={() => window.location.href = '/ai-planner'}
          >
            <MessageSquare className="w-5 h-5 text-[#054697]" />
            <span className="text-xs font-medium uppercase text-[#054697]">AI Wedding Planner</span>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-2/3">
            <h1 className="text-4xl md:text-5xl font-['Giaza',serif] text-[#054697] mb-3 tracking-[-0.05em]">Welcome, {userName}</h1>
            <p className="text-[#054697]/80 font-light text-xl">Your wedding is in <span className="font-medium">{daysUntilWedding} days</span> ({formattedWeddingDate})</p>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap gap-4 mt-6">
              <div className="inline-flex items-center">
                <span className="bg-[#E8B4B4] text-[#054697] font-medium px-4 py-2 shadow-sm">
                  {upcomingTasks.length} Tasks
                </span>
              </div>
              <div className="inline-flex items-center">
                <span className="bg-[#B8BDD7] text-[#054697] font-medium px-4 py-2 shadow-sm">
                  Budget: ${budget.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-4 mt-6 md:mt-0">
            <div 
              className="relative w-32 h-32 md:w-40 md:h-40 border-4 border-[#E8B4B4] flex items-center justify-center overflow-hidden bg-[#E8B4B4]/20 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={triggerFileInput}
            >
              {profileImage ? (
                <img 
                  src={profileImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-4">
                  <UploadCloud className="w-12 h-12 text-[#054697]/70" />
                  <span className="text-sm text-[#054697]/70 mt-2 font-medium">Upload Your Photo</span>
                </div>
              )}
              <div className="absolute bottom-0 right-0 bg-[#E8B4B4] p-2 cursor-pointer hover:bg-[#FFD5CC] transition-colors duration-300">
                <Camera className="w-5 h-5 text-[#054697]" />
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              className="hidden" 
              accept="image/*"
            />
            <Button 
              variant="outlined" 
              size="small" 
              className="border-[#E8B4B4] text-[#054697] hover:bg-[#E8B4B4]/10 uppercase font-medium tracking-wide"
              onClick={triggerFileInput}
            >
              Change Photo
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-8 py-12">
        {/* Section Title with decorative elements */}
        <div className="mb-12 text-center relative">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 -mt-6 text-[#E8B4B4]">
            <Heart className="w-12 h-12 opacity-20" />
          </div>
          <h2 className="text-3xl font-['Giaza',serif] text-[#054697] mb-3 tracking-[-0.05em]">Your Wedding Planning Tools</h2>
          <p className="text-[#054697]/80 max-w-2xl mx-auto">Everything you need to plan your perfect day, all in one place.</p>
          <div className="w-24 h-1 bg-[#E8B4B4] mx-auto mt-6"></div>
        </div>

        {/* Tools Grid with hover effects */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {dashboardTools.map((tool, index) => (
            <div 
              key={index}
              className="group bg-white border-none rounded-none overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 relative"
              style={{
                boxShadow: '0 10px 30px rgba(5, 70, 151, 0.08)',
              }}
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-[#054697]"></div>
              <div className="p-8 flex flex-col h-full">
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 flex items-center justify-center bg-[#E8B4B4]/30 text-[#054697] group-hover:bg-[#E8B4B4]/60 transition-colors duration-300 rounded-none">
                    {tool.icon}
                  </div>
                  <h3 className="ml-5 text-xl font-['Giaza',serif] font-medium text-[#054697] tracking-[-0.05em] leading-tight">{tool.title}</h3>
                </div>
                
                <p className="text-[#054697]/80 mb-8 flex-grow">{tool.description}</p>
                
                <Link 
                  to={tool.href} 
                  className="w-full border-2 border-[#E8B4B4] bg-[#E8B4B4] text-[#054697] py-3 text-sm font-medium hover:bg-transparent hover:text-[#054697] transition-all duration-300 uppercase flex items-center justify-center tracking-wider"
                >
                  <span>Open</span>
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:ml-3 transition-all duration-300" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Upcoming Tasks Section with improved styling */}
        <div className="mb-16 bg-white border-none rounded-none p-10 shadow-lg relative" style={{ boxShadow: '0 10px 30px rgba(5, 70, 151, 0.05)' }}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#B8BDD7] to-[#E8B4B4]"></div>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-['Giaza',serif] text-[#054697] tracking-[-0.05em]">Upcoming Tasks</h2>
            <Link to="/checklist" className="text-[#054697] hover:text-[#E8B4B4] text-sm uppercase font-medium flex items-center transition-colors duration-300">
              <span>View All</span>
              <ChevronRight className="w-4 h-4 ml-1 group-hover:ml-2 transition-all duration-300" />
            </Link>
          </div>
          
          {isLoading ? (
            <div className="text-center py-8 text-[#054697]/70">Loading your personalized tasks...</div>
          ) : upcomingTasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {upcomingTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="bg-white border-none rounded-none p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative"
                  style={{ boxShadow: '0 5px 20px rgba(5, 70, 151, 0.05)' }}
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#054697]"></div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-['Giaza',serif] font-medium text-[#054697] tracking-[-0.05em]">{task.title}</h3>
                    <span className="bg-[#E8B4B4]/50 text-[#054697] text-xs px-3 py-1">
                      {task.category}
                    </span>
                  </div>
                  <p className="text-[#054697]/70 text-sm">Due: {task.dueDate}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[#054697]/70">
              No upcoming tasks. Please update your wedding details in your profile.
            </div>
          )}
        </div>
        
        {/* Wedding Countdown Section */}
        <div className="bg-gradient-to-r from-[#054697]/5 to-[#E8B4B4]/5 p-10 text-center mb-16 shadow-md relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#B8BDD7] to-[#E8B4B4]"></div>
          <h2 className="text-3xl font-['Giaza',serif] text-[#054697] mb-6 tracking-[-0.05em]">Wedding Countdown</h2>
          <div className="flex justify-center gap-8 mt-8">
            <div className="bg-white p-6 shadow-lg w-24 border-t-4 border-[#E8B4B4]">
              <div className="text-4xl font-semibold text-[#054697]">{Math.floor(daysUntilWedding / 30)}</div>
              <div className="text-sm text-[#054697]/70 uppercase tracking-wider mt-1">Months</div>
            </div>
            <div className="bg-white p-6 shadow-lg w-24 border-t-4 border-[#E8B4B4]">
              <div className="text-4xl font-semibold text-[#054697]">{daysUntilWedding % 30}</div>
              <div className="text-sm text-[#054697]/70 uppercase tracking-wider mt-1">Days</div>
            </div>
            <div className="bg-white p-6 shadow-lg w-24 border-t-4 border-[#E8B4B4]">
              <div className="text-4xl font-semibold text-[#054697]">24</div>
              <div className="text-sm text-[#054697]/70 uppercase tracking-wider mt-1">Hours</div>
            </div>
          </div>
          <p className="mt-8 text-[#054697]/80 text-lg">Your special day is approaching! Make sure to check your tasks regularly.</p>
        </div>
        
        {/* Snackbar notification for plan selection */}
        <Snackbar
          open={!!notification}
          autoHideDuration={5000}
          onClose={() => setNotification(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setNotification(null)} 
            severity="success" 
            sx={{ 
              width: '100%',
              backgroundColor: '#E8B4B4',
              color: '#054697',
              '& .MuiAlert-icon': {
                color: '#054697',
              },
            }}
          >
            {notification}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
}
