import { UploadCloud, Users, DollarSign, Map, FileText, Video, Calendar, Settings, PenTool, Heart, Clock, Bell, Camera, MessageSquare, ArrowRight } from "lucide-react";
import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import * as React from 'react';
import { useTheme } from "@mui/material/styles";
import { Typography, Box, Container, Grid, Card, CardContent, Button, Avatar, Paper } from "@mui/material";

interface DashboardTool {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  category?: 'planning' | 'design' | 'management' | 'essential';
  featured?: boolean;
}

function MemberDashboard() {
  const theme = useTheme();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Calculate wedding date (example: 187 days from now)
  const weddingDate = new Date();
  weddingDate.setDate(weddingDate.getDate() + 187);
  const daysUntilWedding = 187;
  const formattedWeddingDate = format(weddingDate, 'MMMM d, yyyy');
  
  // Define upcoming tasks
  const upcomingTasks = [
    { id: 1, title: "Book venue tour", dueDate: "Next week" },
    { id: 2, title: "Meet with photographer", dueDate: "In 2 weeks" },
    { id: 3, title: "Send save-the-dates", dueDate: "This month" }
  ];
  
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
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  // Define dashboard tools
  const dashboardTools: DashboardTool[] = [
    {
      title: "Guest Directory",
      description: "Manage your guest contact information",
      icon: <Users className="w-6 h-6" />,
      href: "/directory",
      category: "essential",
      featured: true
    },
    {
      title: "Video Tutorials",
      description: "Learn how to use our wedding planning tools",
      icon: <FileText className="w-6 h-6" />,
      href: "/tutorials",
      category: "planning"
    },
    {
      title: "Seating Chart",
      description: "Design your reception seating arrangement with grid layout",
      icon: <Map className="w-6 h-6" />,
      href: "/seating-chart",
      category: "management"
    },
    {
      title: "Budget Calculator",
      description: "Track expenses and manage your wedding budget",
      icon: <DollarSign className="w-6 h-6" />,
      href: "/budget",
      category: "management",
      featured: true
    },
    {
      title: "Checklist",
      description: "Stay on track with wedding planning tasks",
      icon: <FileText className="w-6 h-6" />,
      href: "/checklist",
      category: "planning",
      featured: true
    },
    {
      title: "Timeline",
      description: "Plan and manage your wedding day schedule",
      icon: <Calendar className="w-6 h-6" />,
      href: "/timeline",
      category: "planning"
    },
    {
      title: "Vendor Directory",
      description: "Find and manage your wedding vendors",
      icon: <Settings className="w-6 h-6" />,
      href: "/vendors",
      category: "essential"
    },
    {
      title: "Moodboard Creator",
      description: "Design and visualize your wedding aesthetic",
      icon: <PenTool className="w-6 h-6" />,
      href: "/moodboard",
      category: "design",
      featured: true
    },
    {
      title: "Wedding Journal",
      description: "Document your wedding planning journey",
      icon: <Heart className="w-6 h-6" />,
      href: "/journal",
      category: "design"
    },
    {
      title: "Countdown Timer",
      description: "Track days until your special day",
      icon: <Clock className="w-6 h-6" />,
      href: "/countdown",
      category: "essential"
    },
    {
      title: "Notifications",
      description: "Stay updated with important reminders",
      icon: <Bell className="w-6 h-6" />,
      href: "/notifications",
      category: "management"
    },
    {
      title: "Photo Gallery",
      description: "Collect and organize wedding photos",
      icon: <Camera className="w-6 h-6" />,
      href: "/gallery",
      category: "design"
    }
  ];

  return (
    <div className="w-full py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col space-y-8">
          {/* Welcome Section with Photo Upload */}
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-r from-[#FFE8E4]/20 to-[#FFE8E4]/5 p-6 md:p-8 rounded-lg">
            {/* AI Wedding Planner in the corner */}
            <div 
              className="absolute top-4 right-4 flex items-center gap-2 bg-[#FFE8E4]/30 p-2 rounded cursor-pointer hover:bg-[#FFE8E4]/50 transition-colors"
              onClick={() => window.location.href = '/ai-planner'}
            >
              <MessageSquare className="w-5 h-5 text-[#054697]" />
              <span className="text-xs font-medium uppercase text-[#054697]">AI Wedding Planner</span>
            </div>

            <div className="flex flex-col gap-2 w-full md:w-2/3">
              <h1 className="text-3xl md:text-4xl font-semibold text-[#054697] font-['Giaza',serif]">Welcome, Lara</h1>
              <p className="text-[#054697]/80 font-light text-lg">Your wedding is in {daysUntilWedding} days ({formattedWeddingDate})</p>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap gap-3 mt-4">
                <div className="inline-flex items-center">
                  <span className="bg-[#FFE8E4] text-[#054697] font-medium px-3 py-1">
                    {upcomingTasks.length} Tasks
                  </span>
                </div>
                <div className="inline-flex items-center">
                  <span className="bg-[#B8BDD7] text-[#054697] font-medium px-3 py-1">
                    Budget: $25,000
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-3 mt-6 md:mt-0">
              <div 
                className="relative w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-[#FFE8E4] flex items-center justify-center overflow-hidden bg-[#FFE8E4]/20 cursor-pointer"
                onClick={triggerFileInput}
              >
                {profileImage ? (
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <UploadCloud className="w-10 h-10 text-[#054697]/70" />
                    <span className="text-xs text-[#054697]/70 mt-1">Upload Photo</span>
                  </div>
                )}
                <div className="absolute bottom-0 right-0 bg-[#FFE8E4] p-1 rounded-full cursor-pointer hover:bg-[#FFD5CC] transition-colors">
                  <Camera className="w-4 h-4 text-[#054697]" />
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
                variant="outline" 
                size="sm" 
                className="border-[#FFE8E4] text-[#054697] hover:bg-[#FFE8E4]/10"
                onClick={triggerFileInput}
              >
                {profileImage ? "CHANGE PHOTO" : "ADD PHOTO"}
              </Button>
            </div>
          </div>
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button 
              className={`px-4 py-1.5 text-sm font-medium text-[#054697] border border-[#FFE8E4] transition-colors ${activeCategory === null ? 'bg-[#FFE8E4]' : 'bg-transparent hover:bg-[#FFE8E4]/50'}`}
              onClick={() => filterToolsByCategory(null)}
            >
              ALL TOOLS
            </button>
            <button 
              className={`px-4 py-1.5 text-sm font-medium text-[#054697] border border-[#FFE8E4] transition-colors ${activeCategory === 'planning' ? 'bg-[#FFE8E4]' : 'bg-transparent hover:bg-[#FFE8E4]/50'}`}
              onClick={() => filterToolsByCategory('planning')}
            >
              PLANNING
            </button>
            <button 
              className={`px-4 py-1.5 text-sm font-medium text-[#054697] border border-[#FFE8E4] transition-colors ${activeCategory === 'design' ? 'bg-[#FFE8E4]' : 'bg-transparent hover:bg-[#FFE8E4]/50'}`}
              onClick={() => filterToolsByCategory('design')}
            >
              DESIGN
            </button>
            <button 
              className={`px-4 py-1.5 text-sm font-medium text-[#054697] border border-[#FFE8E4] transition-colors ${activeCategory === 'management' ? 'bg-[#FFE8E4]' : 'bg-transparent hover:bg-[#FFE8E4]/50'}`}
              onClick={() => filterToolsByCategory('management')}
            >
              MANAGEMENT
            </button>
            <button 
              className={`px-4 py-1.5 text-sm font-medium text-[#054697] border border-[#FFE8E4] transition-colors ${activeCategory === 'essential' ? 'bg-[#FFE8E4]' : 'bg-transparent hover:bg-[#FFE8E4]/50'}`}
              onClick={() => filterToolsByCategory('essential')}
            >
              ESSENTIAL
            </button>
          </div>
        
          {/* Featured Tools Section */}
          {(!activeCategory || getFeaturedTools().some(tool => !activeCategory || tool.category === activeCategory)) && (
            <div className="mb-10">
              <h2 className="text-2xl font-semibold text-[#054697] font-['Giaza',serif] mb-6">
                Featured Tools
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {getFeaturedTools()
                  .filter(tool => !activeCategory || tool.category === activeCategory)
                  .map((tool) => (
                    <div 
                      key={tool.title}
                      className="border border-[#B8BDD7]/40 hover:border-[#B8BDD7] transition-all duration-300 flex flex-col h-full hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="p-4 flex items-start">
                        <div className="flex justify-between w-full">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 flex items-center justify-center bg-[#FFE8E4]/30 text-[#054697] rounded-full">
                              {tool.icon}
                            </div>
                            <h3 className="text-lg font-medium text-[#054697]">
                              {tool.title}
                            </h3>
                          </div>
                          <span className="bg-[#FFE8E4] text-[#054697] text-xs font-medium px-2 py-0.5">
                            FEATURED
                          </span>
                        </div>
                      </div>
                      <div className="px-4 pb-4 flex flex-col flex-grow">
                        <p className="text-[#054697]/80 mb-4 font-light">
                          {tool.description}
                        </p>
                        
                        <Link 
                          to={tool.href}
                          className="w-full mt-auto border border-[#FFE8E4] text-[#054697] py-2 text-sm font-medium hover:bg-[#FFE8E4]/10 transition-colors uppercase flex items-center justify-center"
                        >
                          <span>Open</span>
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        
          {/* All Tools Section */}
          <div className="mb-10">
            <h2 className="text-2xl font-semibold text-[#054697] font-['Giaza',serif] mb-6">
              {activeCategory ? 
                `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Tools` : 
                'All Tools'}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {getFilteredTools()
                .filter(tool => !tool.featured || activeCategory)
                .map((tool) => (
                  <div 
                    key={tool.title}
                    className="border border-[#B8BDD7]/40 hover:border-[#B8BDD7] transition-all duration-300 flex flex-col h-full hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="p-4 flex items-start">
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-10 h-10 flex items-center justify-center bg-[#FFE8E4]/30 text-[#054697] rounded-full">
                          {tool.icon}
                        </div>
                        <h3 className="text-lg font-medium text-[#054697]">
                          {tool.title}
                        </h3>
                      </div>
                    </div>
                    <div className="px-4 pb-4 flex flex-col flex-grow">
                      <p className="text-[#054697]/80 mb-4 font-light">
                        {tool.description}
                      </p>
                      
                      <button 
                        className="w-full mt-auto border border-[#FFE8E4] text-[#054697] py-2 text-sm font-medium hover:bg-[#FFE8E4]/10 transition-colors uppercase"
                        onClick={() => window.location.href = tool.href}
                      >
                        Open
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { MemberDashboard };
