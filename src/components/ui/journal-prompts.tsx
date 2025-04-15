import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import { Button } from "./button";
import { Textarea } from "./textarea";
import { PenLine, ArrowRight } from "lucide-react";

interface JournalPrompt {
  id: string;
  question: string;
  category: string;
  videoId: string;
  relatedFeature?: {
    name: string;
    path: string;
  };
}

const prompts: JournalPrompt[] = [
  // Your Why? Video Prompts
  {
    id: '1',
    question: "What is your vision for your wedding day? Take a moment to describe the atmosphere, feelings, and key moments you want to create.",
    category: "Your Why?",
    videoId: '1'
  },
  {
    id: '2',
    question: "What values and traditions are most important to you and your partner that you want to incorporate into your celebration?",
    category: "Your Why?",
    videoId: '1'
  },
  {
    id: '3',
    question: "How do you want your guests to feel when they attend your wedding? What experience do you want to create for them?",
    category: "Your Why?",
    videoId: '1'
  },

  // Let's Get Started Prompt
  {
    id: '4',
    question: "Create your ideal guest list. Don't leave anyone out - this is just a first draft to help you start planning.",
    category: "Getting Started",
    videoId: '2',
    relatedFeature: {
      name: "Address Book",
      path: "/directory"
    }
  },

  // Securing Your Vendor Team Prompt
  {
    id: '5',
    question: "Take a moment to list out ideally which vendors you want to have as part of your team.",
    category: "Vendor Planning",
    videoId: '3',
    relatedFeature: {
      name: "Vendor Directory",
      path: "/vendors"
    }
  },

  // Dividing Your Day Prompts
  {
    id: '6',
    question: "What time would you like your ceremony to start?",
    category: "Timeline Planning",
    videoId: '4',
    relatedFeature: {
      name: "Planning Timeline",
      path: "/timeline"
    }
  },
  {
    id: '7',
    question: "How long would you like your cocktail hour to be?",
    category: "Timeline Planning",
    videoId: '4',
    relatedFeature: {
      name: "Planning Timeline",
      path: "/timeline"
    }
  },
  {
    id: '8',
    question: "What time would you like your reception to end?",
    category: "Timeline Planning",
    videoId: '4',
    relatedFeature: {
      name: "Planning Timeline",
      path: "/timeline"
    }
  },

  // Loose Ends Prompts
  {
    id: '9',
    question: "Where are you in your planning process right now?",
    category: "Progress Check",
    videoId: '5'
  },
  {
    id: '10',
    question: "What aspects of wedding planning are causing you the most stress?",
    category: "Progress Check",
    videoId: '5'
  },
  {
    id: '11',
    question: "What parts of the planning process are bringing you the most excitement?",
    category: "Progress Check",
    videoId: '5'
  }
];

export function JournalPrompts({ videoId }: { videoId?: string }) {
  const [currentPrompt, setCurrentPrompt] = useState<JournalPrompt>(
    videoId 
      ? prompts.find(p => p.videoId === videoId) || prompts[0]
      : prompts[0]
  );
  const [response, setResponse] = useState('');
  const [savedResponses, setSavedResponses] = useState<{[key: string]: string}>({});

  const handleNextPrompt = () => {
    // Save current response
    if (response.trim()) {
      setSavedResponses(prev => ({
        ...prev,
        [currentPrompt.id]: response
      }));
    }

    // Get next prompt from same video if available
    const videoPrompts = prompts.filter(p => p.videoId === currentPrompt.videoId);
    const currentIndex = videoPrompts.findIndex(p => p.id === currentPrompt.id);
    const nextPrompt = videoPrompts[currentIndex + 1];
    
    if (nextPrompt) {
      setCurrentPrompt(nextPrompt);
      setResponse(savedResponses[nextPrompt.id] || '');
    }
  };

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenLine className="w-5 h-5 text-accent-rose" />
            Reflection Journal
          </CardTitle>
          <CardDescription className="text-primary opacity-80">
            Take a moment to reflect on your wedding journey
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-primary">{currentPrompt.question}</h3>
            <p className="text-sm text-primary opacity-80">Category: {currentPrompt.category}</p>
            {currentPrompt.relatedFeature && (
              <Button 
                variant="link" 
                className="text-accent-rose hover:text-accent-roseDark p-0 h-auto"
                onClick={() => window.location.href = currentPrompt.relatedFeature!.path}
              >
                Visit {currentPrompt.relatedFeature.name} <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
          <Textarea
            placeholder="Write your thoughts here..."
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            className="min-h-[150px] resize-none"
          />
          <div className="flex justify-between items-center">
            <p className="text-sm text-primary opacity-80">
              {prompts.filter(p => p.videoId === currentPrompt.videoId).length > 1 && (
                <>
                  Prompt {
                    prompts
                      .filter(p => p.videoId === currentPrompt.videoId)
                      .findIndex(p => p.id === currentPrompt.id) + 1
                  } of {
                    prompts.filter(p => p.videoId === currentPrompt.videoId).length
                  }
                </>
              )}
            </p>
            <Button 
              onClick={handleNextPrompt}
              className="bg-accent-rose text-primary hover:bg-accent-roseDark"
              disabled={
                prompts
                  .filter(p => p.videoId === currentPrompt.videoId)
                  .findIndex(p => p.id === currentPrompt.id) === 
                prompts.filter(p => p.videoId === currentPrompt.videoId).length - 1
              }
            >
              Next Prompt
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Previous Responses */}
      {Object.keys(savedResponses).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Previous Reflections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-4">
              {Object.entries(savedResponses)
                .filter(([promptId]) => {
                  const prompt = prompts.find(p => p.id === promptId);
                  return prompt && prompt.videoId === currentPrompt.videoId;
                })
                .map(([promptId, savedResponse]) => {
                  const prompt = prompts.find(p => p.id === promptId);
                  if (!prompt) return null;
                  
                  return (
                    <div key={promptId} className="space-y-2">
                      <h4 className="font-medium text-primary">{prompt.question}</h4>
                      <p className="text-sm text-primary opacity-80 whitespace-pre-wrap">{savedResponse}</p>
                      <div className="border-b border-accent-rose/20 pt-2" />
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
