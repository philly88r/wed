import { UploadCloud, Calendar, Users, DollarSign, Map, FileText, MessageSquare, Settings, PenTool } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";

interface DashboardTool {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

function MemberDashboard() {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
  
  const dashboardTools: DashboardTool[] = [
    {
      title: "Timeline",
      description: "Plan and manage your wedding day schedule",
      icon: <Calendar className="w-6 h-6 text-[#054697]" />,
      href: "/timeline"
    },
    {
      title: "Guest List",
      description: "Manage invitations and track RSVPs",
      icon: <Users className="w-6 h-6 text-[#054697]" />,
      href: "/guests"
    },
    {
      title: "Budget Calculator",
      description: "Track expenses and manage your wedding budget",
      icon: <DollarSign className="w-6 h-6 text-[#054697]" />,
      href: "/budget"
    },
    {
      title: "Seating Chart",
      description: "Create and manage your reception seating plan",
      icon: <Map className="w-6 h-6 text-[#054697]" />,
      href: "/seating"
    },
    {
      title: "Checklist",
      description: "Stay on track with wedding planning tasks",
      icon: <FileText className="w-6 h-6 text-[#054697]" />,
      href: "/checklist"
    },
    {
      title: "AI Wedding Planner",
      description: "Get personalized suggestions and assistance",
      icon: <MessageSquare className="w-6 h-6 text-[#054697]" />,
      href: "/ai-planner"
    },
    {
      title: "Vendor Directory",
      description: "Find and manage your wedding vendors",
      icon: <Settings className="w-6 h-6 text-[#054697]" />,
      href: "/vendors"
    },
    {
      title: "Moodboard Creator",
      description: "Design and visualize your wedding aesthetic",
      icon: <PenTool className="w-6 h-6 text-[#054697]" />,
      href: "/moodboard"
    }
  ];

  return (
    <div className="w-full py-12 lg:py-20">
      <div className="container mx-auto">
        <div className="flex flex-col gap-12">
          {/* Welcome Section with Photo Upload */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-r from-[#FFE8E4]/20 to-[#FFE8E4]/5 p-8 rounded-lg">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl md:text-4xl font-semibold text-[#054697]">Welcome, Lara</h1>
              <p className="text-[#054697]/80">Your wedding is in 187 days</p>
            </div>
            
            <div className="flex flex-col items-center gap-3">
              <div 
                className="w-32 h-32 rounded-full border-4 border-[#FFE8E4] flex items-center justify-center overflow-hidden bg-[#FFE8E4]/20 cursor-pointer relative"
                onClick={triggerFileInput}
              >
                {profileImage ? (
                  <img 
                    src={profileImage} 
                    alt="Couple" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <UploadCloud className="w-10 h-10 text-[#054697]" />
                    <span className="text-xs text-[#054697] mt-1">Upload Photo</span>
                  </div>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*" 
                className="hidden"
              />
              <Button 
                variant="outline" 
                className="text-sm border-[#FFE8E4] text-[#054697] hover:bg-[#FFE8E4]/10 font-medium"
                onClick={triggerFileInput}
              >
                {profileImage ? "Change Photo" : "Upload Couple Photo"}
              </Button>
            </div>
          </div>
          
          {/* Dashboard Tools Grid */}
          <div>
            <h2 className="text-2xl font-semibold text-[#054697] mb-6">Your Planning Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {dashboardTools.map((tool, index) => (
                <Card 
                  key={index} 
                  className="hover:shadow-md hover:transform hover:-translate-y-1 transition-all duration-200 border-[#FFE8E4]/30"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-[#FFE8E4]/20">
                        {tool.icon}
                      </div>
                      <CardTitle className="text-xl text-[#054697]">{tool.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-[#054697]/70">
                      {tool.description}
                    </CardDescription>
                    <Button 
                      variant="outline" 
                      className="w-full mt-4 border-[#FFE8E4] text-[#054697] hover:bg-[#FFE8E4]/10"
                      onClick={() => window.location.href = tool.href}
                    >
                      Open
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { MemberDashboard };
