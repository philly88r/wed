import { Check, Minus, MoveRight, PhoneCall } from "lucide-react";
import { Badge } from "./badge";
import { Button } from "./button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";

// Define feature data structure
interface PricingFeature {
  title: string;
  essentialIncluded: boolean;
  premiumIncluded: boolean;
  luxuryIncluded: boolean;
  premiumText?: string;
  luxuryText?: string;
}

// Define all features with their availability in each plan
const features: PricingFeature[] = [
  {
    title: "Wedding Planning Video Tutorials",
    essentialIncluded: true,
    premiumIncluded: true,
    luxuryIncluded: true
  },
  {
    title: "Journal Prompts for Reflection",
    essentialIncluded: true,
    premiumIncluded: true,
    luxuryIncluded: true
  },
  {
    title: "Address Book",
    essentialIncluded: true,
    premiumIncluded: true,
    luxuryIncluded: true
  },
  {
    title: "Budget Calculator",
    essentialIncluded: true,
    premiumIncluded: true,
    luxuryIncluded: true
  },
  {
    title: "Vendor Directory",
    essentialIncluded: true,
    premiumIncluded: true,
    luxuryIncluded: true
  },
  {
    title: "Planning Timeline Calculator",
    essentialIncluded: true,
    premiumIncluded: true,
    luxuryIncluded: true
  },
  {
    title: "Floor Plan & Seating Chart Creator",
    essentialIncluded: false,
    premiumIncluded: true,
    luxuryIncluded: true
  },
  {
    title: "Video Calls with Altare Planner",
    essentialIncluded: false,
    premiumIncluded: true,
    luxuryIncluded: true,
    premiumText: "Quarterly 60-min calls",
    luxuryText: "Quarterly 60-min calls"
  },
  {
    title: "Moodboard Inspo Creation",
    essentialIncluded: false,
    premiumIncluded: false,
    luxuryIncluded: true
  },
  {
    title: "Month-Of Coordinator (8 weeks before)",
    essentialIncluded: false,
    premiumIncluded: false,
    luxuryIncluded: true
  }
];

// Day-of coordinator features
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
          <Badge>Pricing</Badge>
          <div className="flex gap-2 flex-col">
            <h2 className="text-3xl md:text-5xl tracking-tighter max-w-xl text-center font-regular text-[#054697]">
              Your Perfect Planning Journey
            </h2>
            <p className="text-lg leading-relaxed tracking-tight text-[#054697]/80 max-w-xl text-center">
              Choose the level of support that matches your vision, from essential tools to full-service planning.
            </p>
          </div>
          
          {/* Card-based layout for mobile */}
          <div className="grid pt-20 text-left grid-cols-1 lg:grid-cols-3 w-full gap-8 lg:hidden">
            {/* Essential Planning Card */}
            <Card className="w-full rounded-md hover:transform hover:-translate-y-1 transition-transform duration-200">
              <CardHeader>
                <CardTitle className="text-[#054697]">Essential Planning</CardTitle>
                <CardDescription className="text-[#054697]/80">
                  Perfect for the self-guided couple who wants to plan at their own pace with professional tools.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-8 justify-start">
                  <p className="flex flex-row items-center gap-2 text-xl">
                    <span className="text-4xl font-semibold text-[#054697]">$19</span>
                    <span className="text-sm text-[#054697]/80"> / month</span>
                  </p>
                  <div className="flex flex-col gap-4 justify-start">
                    {features.filter(f => f.essentialIncluded).map((feature, i) => (
                      <div key={i} className="flex flex-row gap-4">
                        <Check className="w-4 h-4 mt-1 text-[#FFE8E4]" />
                        <div className="flex flex-col">
                          <p className="text-[#054697]">{feature.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="gap-4 mt-4 border-[#FFE8E4] text-[#054697] hover:bg-[#FFE8E4]/10">
                    Get started <MoveRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Premium Planning Card */}
            <Card className="w-full rounded-md shadow-2xl ring-2 ring-[#FFE8E4] hover:transform hover:-translate-y-1 transition-transform duration-200">
              <CardHeader>
                <div className="flex justify-center mb-2">
                  <Badge variant="default" className="bg-[#FFE8E4] text-[#054697]">Most Popular</Badge>
                </div>
                <CardTitle className="text-[#054697]">Premium Planning</CardTitle>
                <CardDescription className="text-[#054697]/80">
                  Get expert guidance while maintaining control of your planning journey.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-8 justify-start">
                  <p className="flex flex-row items-center gap-2 text-xl">
                    <span className="text-4xl font-semibold text-[#054697]">$89</span>
                    <span className="text-sm text-[#054697]/80"> / month</span>
                    <span className="text-sm text-[#054697]/80 ml-0">(min. 4 months)</span>
                  </p>
                  <div className="flex flex-col gap-4 justify-start">
                    {features.filter(f => f.premiumIncluded).map((feature, i) => (
                      <div key={i} className="flex flex-row gap-4">
                        <Check className="w-4 h-4 mt-1 text-[#FFE8E4]" />
                        <div className="flex flex-col">
                          <p className="text-[#054697]">{feature.title}</p>
                          {feature.premiumText && (
                            <p className="text-[#054697]/80 text-sm">{feature.premiumText}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="gap-4 mt-4 bg-[#FFE8E4] text-[#054697] hover:bg-[#FFD5CC]">
                    Get started <MoveRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Luxury Planning Card */}
            <Card className="w-full rounded-md hover:transform hover:-translate-y-1 transition-transform duration-200">
              <CardHeader>
                <CardTitle className="text-[#054697]">Luxury Planning</CardTitle>
                <CardDescription className="text-[#054697]/80">
                  The ultimate planning experience with dedicated month-of coordination.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-8 justify-start">
                  <p className="flex flex-row items-center gap-2 text-xl">
                    <span className="text-4xl font-semibold text-[#054697]">$199</span>
                    <span className="text-sm text-[#054697]/80"> / month</span>
                    <span className="text-sm text-[#054697]/80 ml-0">(min. 4 months)</span>
                  </p>
                  <div className="flex flex-col gap-4 justify-start">
                    {features.filter(f => f.luxuryIncluded).map((feature, i) => (
                      <div key={i} className="flex flex-row gap-4">
                        <Check className="w-4 h-4 mt-1 text-[#FFE8E4]" />
                        <div className="flex flex-col">
                          <p className="text-[#054697]">{feature.title}</p>
                          {feature.luxuryText && (
                            <p className="text-[#054697]/80 text-sm">{feature.luxuryText}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="gap-4 mt-4 border-[#FFE8E4] text-[#054697] hover:bg-[#FFE8E4]/10">
                    Contact us <PhoneCall className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Table-based layout for desktop */}
          <div className="hidden lg:grid text-left w-full grid-cols-4 divide-x pt-20">
            <div className="col-span-1"></div>
            <div className="px-3 py-1 md:px-6 md:py-4 gap-2 flex flex-col">
              <p className="text-2xl text-[#054697]">Essential Planning</p>
              <p className="text-sm text-[#054697]/80">
                Perfect for the self-guided couple who wants to plan at their own pace with professional tools.
              </p>
              <p className="flex flex-col lg:flex-row lg:items-center gap-2 text-xl mt-8">
                <span className="text-4xl font-semibold text-[#054697]">$19</span>
                <span className="text-sm text-[#054697]/80"> / month</span>
              </p>
              <Button variant="outline" className="gap-4 mt-8 border-[#FFE8E4] text-[#054697] hover:bg-[#FFE8E4]/10">
                Get started <MoveRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 gap-2 flex flex-col relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge variant="default" className="bg-[#FFE8E4] text-[#054697]">Most Popular</Badge>
              </div>
              <p className="text-2xl text-[#054697]">Premium Planning</p>
              <p className="text-sm text-[#054697]/80">
                Get expert guidance while maintaining control of your planning journey.
              </p>
              <p className="flex flex-col lg:flex-row lg:items-center gap-2 text-xl mt-8">
                <span className="text-4xl font-semibold text-[#054697]">$89</span>
                <span className="text-sm text-[#054697]/80"> / month</span>
                <span className="text-sm text-[#054697]/80 ml-0 lg:ml-2">(min. 4 months)</span>
              </p>
              <Button className="gap-4 mt-8 bg-[#FFE8E4] text-[#054697] hover:bg-[#FFD5CC]">
                Get started <MoveRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 gap-2 flex flex-col">
              <p className="text-2xl text-[#054697]">Luxury Planning</p>
              <p className="text-sm text-[#054697]/80">
                The ultimate planning experience with dedicated month-of coordination.
              </p>
              <p className="flex flex-col lg:flex-row lg:items-center gap-2 text-xl mt-8">
                <span className="text-4xl font-semibold text-[#054697]">$199</span>
                <span className="text-sm text-[#054697]/80"> / month</span>
                <span className="text-sm text-[#054697]/80 ml-0 lg:ml-2">(min. 4 months)</span>
              </p>
              <Button variant="outline" className="gap-4 mt-8 border-[#FFE8E4] text-[#054697] hover:bg-[#FFE8E4]/10">
                Contact us <PhoneCall className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Features Header */}
            <div className="px-3 lg:px-6 col-span-1 py-4 text-[#054697] font-semibold">
              Features
            </div>
            <div></div>
            <div></div>
            <div></div>
            
            {/* Feature rows */}
            {features.map((feature, index) => (
              <>
                <div key={`title-${index}`} className="px-3 lg:px-6 col-span-1 py-4 text-[#054697]">
                  {feature.title}
                </div>
                <div key={`essential-${index}`} className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
                  {feature.essentialIncluded ? (
                    <Check className="w-4 h-4 text-[#054697]" />
                  ) : (
                    <Minus className="w-4 h-4 text-[#054697]/60" />
                  )}
                </div>
                <div key={`premium-${index}`} className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
                  {feature.premiumIncluded ? (
                    feature.premiumText ? (
                      <p className="text-[#054697]/80 text-sm">{feature.premiumText}</p>
                    ) : (
                      <Check className="w-4 h-4 text-[#054697]" />
                    )
                  ) : (
                    <Minus className="w-4 h-4 text-[#054697]/60" />
                  )}
                </div>
                <div key={`luxury-${index}`} className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
                  {feature.luxuryIncluded ? (
                    feature.luxuryText ? (
                      <p className="text-[#054697]/80 text-sm">{feature.luxuryText}</p>
                    ) : (
                      <Check className="w-4 h-4 text-[#054697]" />
                    )
                  ) : (
                    <Minus className="w-4 h-4 text-[#054697]/60" />
                  )}
                </div>
              </>
            ))}
          </div>

          {/* Day-of Coordinator Card */}
          <div className="w-full max-w-2xl mt-16 rounded-md bg-gradient-to-br from-[#FFE8E4]/5 to-[#FFE8E4]/10 hover:transform hover:-translate-y-1 transition-transform duration-200 p-8 border border-[#FFE8E4]">
            <div className="flex flex-col gap-2">
              <h3 className="text-2xl text-[#054697]">Day-of Wedding Coordination</h3>
              <p className="text-[#054697]/80">
                Let us handle the details on your big day while you focus on creating memories.
              </p>
            </div>
            <div className="flex flex-col gap-8 justify-start mt-6">
              <p className="flex flex-row items-center gap-2 text-xl">
                <span className="text-4xl font-semibold text-[#054697]">Custom</span>
                <span className="text-sm text-[#054697]/80">pricing based on your needs</span>
              </p>
              <div className="flex flex-col gap-4 justify-start">
                {dayOfFeatures.map((feature, i) => (
                  <div key={i} className="flex flex-row gap-4">
                    <Check className="w-4 h-4 mt-1 text-[#FFE8E4]" />
                    <div className="flex flex-col">
                      <p className="text-[#054697]">{feature.title}</p>
                      <p className="text-[#054697]/80 text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="gap-4 mt-4 border-[#FFE8E4] text-[#054697] hover:bg-[#FFE8E4]/10 w-fit">
                Book a consultation <PhoneCall className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Pricing };
