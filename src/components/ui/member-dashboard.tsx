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
  
  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Get user profile from the profiles table
          const { data, error } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', user.id)
            .single();
            
          if (error) {
            console.error('Error fetching profile:', error);
          } else if (data) {
            // Set user name based on available data
            if (data.first_name) {
              setUserName(data.first_name as string);
            } else if (data.last_name) {
              setUserName(`${data.last_name as string} Family`);
            }
          }
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    
    fetchUserProfile();
  }, []);
  
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
  
  // Wedding date calculation
  const weddingDate = new Date("2025-10-15");
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
  
  // Sample upcoming tasks
  const upcomingTasks: Task[] = [
    { id: 1, title: "Book Photographer", dueDate: "April 15, 2025", category: "vendor" },
    { id: 2, title: "Send Save-the-Dates", dueDate: "April 20, 2025", category: "planning" },
    { id: 3, title: "Cake Tasting", dueDate: "May 5, 2025", category: "vendor" }
  ];
  
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
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#FFE8E4]/20 blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#B8BDD7]/10 blur-3xl"></div>
        
        {selectedPlan && (
          <div className="bg-[#FFE8E4] p-4 text-[#054697] text-center">
            <p className="font-medium">
              Thank you for choosing our {selectedPlan} plan! Your subscription has been activated.
            </p>
          </div>
        )}
        
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-r from-[#FFE8E4]/30 to-[#FFE8E4]/10 p-8 md:p-10 rounded-none shadow-sm">
          {/* AI Wedding Planner in the corner */}
          <div 
            className="absolute top-4 right-4 flex items-center gap-2 bg-[#FFE8E4]/50 p-2 rounded-none cursor-pointer hover:bg-[#FFE8E4]/70 transition-colors duration-300 shadow-sm"
            onClick={() => window.location.href = '/ai-planner'}
          >
            <MessageSquare className="w-5 h-5 text-[#054697]" />
            <span className="text-xs font-medium uppercase text-[#054697]">AI Wedding Planner</span>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-2/3">
            <h1 className="text-4xl md:text-5xl font-semibold text-[#054697] font-['Giaza',serif] tracking-tight">Welcome, {userName}</h1>
            <p className="text-[#054697]/80 font-light text-xl">Your wedding is in <span className="font-medium">{daysUntilWedding} days</span> ({formattedWeddingDate})</p>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap gap-4 mt-6">
              <div className="inline-flex items-center">
                <span className="bg-[#FFE8E4] text-[#054697] font-medium px-4 py-2 shadow-sm">
                  {upcomingTasks.length} Tasks
                </span>
              </div>
              <div className="inline-flex items-center">
                <span className="bg-[#B8BDD7] text-[#054697] font-medium px-4 py-2 shadow-sm">
                  Budget: $25,000
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-4 mt-6 md:mt-0">
            <div 
              className="relative w-32 h-32 md:w-40 md:h-40 border-4 border-[#FFE8E4] flex items-center justify-center overflow-hidden bg-[#FFE8E4]/20 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300"
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
              <div className="absolute bottom-0 right-0 bg-[#FFE8E4] p-2 cursor-pointer hover:bg-[#FFD5CC] transition-colors duration-300">
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
              className="border-[#FFE8E4] text-[#054697] hover:bg-[#FFE8E4]/10 uppercase font-medium tracking-wide"
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
          <div className="absolute left-1/2 -translate-x-1/2 top-0 -mt-6 text-[#FFE8E4]">
            <Heart className="w-12 h-12 opacity-20" />
          </div>
          <h2 className="text-3xl font-['Giaza',serif] text-[#054697] mb-3">Your Wedding Planning Tools</h2>
          <p className="text-[#054697]/80 max-w-2xl mx-auto">Everything you need to plan your perfect day, all in one place.</p>
          <div className="w-24 h-1 bg-[#FFE8E4] mx-auto mt-6"></div>
        </div>

        {/* Tools Grid with hover effects */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {dashboardTools.map((tool, index) => (
            <div 
              key={index}
              className="group bg-white border border-[#B8BDD7]/20 hover:border-[#B8BDD7]/40 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-[#FFE8E4]/30 text-[#054697] group-hover:bg-[#FFE8E4]/60 transition-colors duration-300">
                    {tool.icon}
                  </div>
                  <h3 className="ml-4 text-xl font-medium text-[#054697]">{tool.title}</h3>
                </div>
                
                <p className="text-[#054697]/80 mb-6 flex-grow">{tool.description}</p>
                
                <Link 
                  to={tool.href} 
                  className="w-full border border-[#FFE8E4] text-[#054697] py-3 text-sm font-medium hover:bg-[#FFE8E4]/20 transition-colors duration-300 uppercase flex items-center justify-center group-hover:bg-[#FFE8E4]/10"
                >
                  <span>Open</span>
                  <ChevronRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Upcoming Tasks Section with improved styling */}
        <div className="mb-16 bg-white border border-[#B8BDD7]/10 p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-['Giaza',serif] text-[#054697]">Upcoming Tasks</h2>
            <Link to="/checklist" className="text-[#054697] hover:text-[#054697]/80 text-sm uppercase font-medium flex items-center">
              <span>View All</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingTasks.map((task) => (
              <div 
                key={task.id} 
                className="bg-white border border-[#B8BDD7]/20 p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-[#B8BDD7]/40"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-medium text-[#054697]">{task.title}</h3>
                  <span className="bg-[#FFE8E4]/50 text-[#054697] text-xs px-2 py-1">
                    {task.category}
                  </span>
                </div>
                <p className="text-[#054697]/70 text-sm">Due: {task.dueDate}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Wedding Countdown Section */}
        <div className="bg-gradient-to-r from-[#054697]/10 to-[#054697]/5 p-8 text-center mb-16">
          <h2 className="text-2xl font-['Giaza',serif] text-[#054697] mb-3">Wedding Countdown</h2>
          <div className="flex justify-center gap-6 mt-6">
            <div className="bg-white p-4 shadow-md w-20">
              <div className="text-3xl font-semibold text-[#054697]">{Math.floor(daysUntilWedding / 30)}</div>
              <div className="text-sm text-[#054697]/70 uppercase">Months</div>
            </div>
            <div className="bg-white p-4 shadow-md w-20">
              <div className="text-3xl font-semibold text-[#054697]">{daysUntilWedding % 30}</div>
              <div className="text-sm text-[#054697]/70 uppercase">Days</div>
            </div>
            <div className="bg-white p-4 shadow-md w-20">
              <div className="text-3xl font-semibold text-[#054697]">24</div>
              <div className="text-sm text-[#054697]/70 uppercase">Hours</div>
            </div>
          </div>
          <p className="mt-6 text-[#054697]/80">Your special day is approaching! Make sure to check your tasks regularly.</p>
        </div>
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
            backgroundColor: '#FFE8E4',
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
  );
}
