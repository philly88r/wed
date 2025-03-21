import { Check, MoveRight, PhoneCall } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import { Button } from "./button";

interface PricingFeature {
  title: string;
  description: string;
}

interface PricingBundle {
  title: string;
  description: string;
  price: string;
  badge?: string;
  minDuration?: string;
  features: PricingFeature[];
}

const bundles: PricingBundle[] = [
  {
    title: "Essential Planning",
    description: "Perfect for the self-guided couple who wants to plan at their own pace with professional tools.",
    price: "19",
    features: [
      {
        title: "Wedding Planning Video Tutorials",
        description: "Guided planning with journal prompts for reflection"
      },
      {
        title: "Digital Planning Suite",
        description: "Address Book, Budget Calculator & Vendor Directory"
      },
      {
        title: "Timeline Planning",
        description: "Custom timeline based on your wedding date"
      }
    ]
  },
  {
    title: "Premium Planning",
    description: "Get expert guidance while maintaining control of your planning journey.",
    price: "89",
    badge: "Most Popular",
    minDuration: "4 months",
    features: [
      {
        title: "All Essential Features",
        description: "Full access to our digital planning suite"
      },
      {
        title: "Floor Plan & Seating",
        description: "Design your perfect layout with our creator tool"
      },
      {
        title: "Expert Guidance",
        description: "Quarterly 60-min calls with your Altare Planner"
      }
    ]
  },
  {
    title: "Luxury Planning",
    description: "The ultimate planning experience with dedicated month-of coordination.",
    price: "199",
    minDuration: "4 months",
    features: [
      {
        title: "All Premium Features",
        description: "Including expert guidance and planning tools"
      },
      {
        title: "Professional Design",
        description: "Custom moodboard creation for your vision"
      },
      {
        title: "Month-Of Coordination",
        description: "Dedicated coordinator 8 weeks before your day"
      }
    ]
  }
];

interface DayOfFeature {
  title: string;
  description: string;
}

const dayOfFeatures: DayOfFeature[] = [
  {
    title: "Professional Coordination",
    description: "Experienced coordinator to manage your wedding day"
  },
  {
    title: "Vendor Management",
    description: "Coordination with all vendors before and during the event"
  },
  {
    title: "Timeline Management",
    description: "Detailed schedule creation and execution"
  }
];

function Pricing() {
  return (
    <div className="w-full py-20 lg:py-40">
      <div className="container mx-auto">
        <div className="flex text-center justify-center items-center gap-4 flex-col">
          <h2 className="text-3xl md:text-5xl tracking-tighter max-w-xl text-center font-regular text-primary">
            Your Perfect Planning Journey
          </h2>
          <p className="text-lg leading-relaxed tracking-tight text-primary opacity-80 max-w-xl text-center">
            Choose the level of support that matches your vision, from essential tools to full-service planning.
          </p>
          
          {/* Pricing Bundles */}
          <div className="grid pt-20 text-left grid-cols-1 lg:grid-cols-3 w-full gap-8">
            {bundles.map((bundle, index) => (
              <Card 
                key={bundle.title} 
                className={`w-full rounded-md ${
                  index === 1 
                    ? 'shadow-2xl ring-2 ring-accent-rose' 
                    : ''
                } hover:transform hover:-translate-y-1 transition-transform duration-200`}
              >
                <CardHeader>
                  <CardTitle>
                    <span className="flex flex-row gap-4 items-center">
                      {bundle.title}
                      {bundle.badge && (
                        <span className="px-2.5 py-0.5 text-xs bg-accent-rose text-primary rounded-full font-medium">
                          {bundle.badge}
                        </span>
                      )}
                    </span>
                  </CardTitle>
                  <CardDescription className="text-primary opacity-80">{bundle.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-8 justify-start">
                    <p className="flex flex-row items-center gap-2 text-xl">
                      <span className="text-4xl font-semibold text-primary">${bundle.price}</span>
                      <span className="text-sm text-primary opacity-80"> / month</span>
                      {bundle.minDuration && (
                        <span className="text-sm text-primary opacity-80 ml-2">
                          (min. {bundle.minDuration})
                        </span>
                      )}
                    </p>
                    <div className="flex flex-col gap-4 justify-start">
                      {bundle.features.map((feature, i) => (
                        <div key={i} className="flex flex-row gap-4">
                          <Check className="w-4 h-4 mt-2 text-accent-rose" />
                          <div className="flex flex-col">
                            <p className="text-primary">{feature.title}</p>
                            <p className="text-primary opacity-80 text-sm">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button 
                      variant={index === 1 ? "default" : "outline"}
                      className={`gap-4 ${
                        index === 1 
                          ? 'bg-accent-rose text-primary hover:bg-accent-roseDark' 
                          : 'border-accent-rose text-primary hover:bg-accent-rose/10'
                      }`}
                    >
                      Get started <MoveRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Day-of Coordinator Card */}
          <Card className="w-full max-w-2xl mt-16 rounded-md bg-gradient-to-br from-accent-rose/5 to-accent-rose/10 hover:transform hover:-translate-y-1 transition-transform duration-200">
            <CardHeader>
              <CardTitle>
                <span className="flex flex-row gap-4 items-center">
                  Day-of Wedding Coordination
                </span>
              </CardTitle>
              <CardDescription className="text-primary opacity-80">
                Let us handle the details on your big day while you focus on creating memories.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-8 justify-start">
                <p className="flex flex-row items-center gap-2 text-xl">
                  <span className="text-4xl font-semibold text-primary">Custom</span>
                  <span className="text-sm text-primary opacity-80">pricing based on your needs</span>
                </p>
                <div className="flex flex-col gap-4 justify-start">
                  {dayOfFeatures.map((feature, i) => (
                    <div key={i} className="flex flex-row gap-4">
                      <Check className="w-4 h-4 mt-2 text-accent-rose" />
                      <div className="flex flex-col">
                        <p className="text-primary">{feature.title}</p>
                        <p className="text-primary opacity-80 text-sm">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="gap-4 border-accent-rose text-primary hover:bg-accent-rose/10">
                  Book a consultation <PhoneCall className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export { Pricing };
