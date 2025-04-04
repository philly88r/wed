import { Check, Minus, MoveRight, PhoneCall } from "lucide-react";
import { Badge } from "./badge";
import { Button } from "./button";

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
          <div className="grid text-left w-full grid-cols-3 lg:grid-cols-4 divide-x pt-20">
            <div className="col-span-3 lg:col-span-1"></div>
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
            <div className="px-3 lg:px-6 col-span-3 lg:col-span-1 py-4 text-[#054697] font-semibold">
              Features
            </div>
            <div></div>
            <div></div>
            <div></div>
            
            {/* Wedding Planning Video Tutorials */}
            <div className="px-3 lg:px-6 col-span-3 lg:col-span-1 py-4 text-[#054697]">
              Wedding Planning Video Tutorials
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <Check className="w-4 h-4 text-[#054697]" />
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <Check className="w-4 h-4 text-[#054697]" />
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <Check className="w-4 h-4 text-[#054697]" />
            </div>
            
            {/* Journal Prompts */}
            <div className="px-3 lg:px-6 col-span-3 lg:col-span-1 py-4 text-[#054697]">
              Journal Prompts for Reflection
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <Check className="w-4 h-4 text-[#054697]" />
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <Check className="w-4 h-4 text-[#054697]" />
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <Check className="w-4 h-4 text-[#054697]" />
            </div>
            
            {/* Address Book */}
            <div className="px-3 lg:px-6 col-span-3 lg:col-span-1 py-4 text-[#054697]">
              Address Book
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <Check className="w-4 h-4 text-[#054697]" />
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <Check className="w-4 h-4 text-[#054697]" />
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <Check className="w-4 h-4 text-[#054697]" />
            </div>
            
            {/* Budget Calculator */}
            <div className="px-3 lg:px-6 col-span-3 lg:col-span-1 py-4 text-[#054697]">
              Budget Calculator
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <Check className="w-4 h-4 text-[#054697]" />
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <Check className="w-4 h-4 text-[#054697]" />
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <Check className="w-4 h-4 text-[#054697]" />
            </div>
            
            {/* Vendor Directory */}
            <div className="px-3 lg:px-6 col-span-3 lg:col-span-1 py-4 text-[#054697]">
              Vendor Directory
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <Check className="w-4 h-4 text-[#054697]" />
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <Check className="w-4 h-4 text-[#054697]" />
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <Check className="w-4 h-4 text-[#054697]" />
            </div>
            
            {/* Planning Timeline Calculator */}
            <div className="px-3 lg:px-6 col-span-3 lg:col-span-1 py-4 text-[#054697]">
              Planning Timeline Calculator
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <Check className="w-4 h-4 text-[#054697]" />
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <Check className="w-4 h-4 text-[#054697]" />
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <Check className="w-4 h-4 text-[#054697]" />
            </div>
            
            {/* Floor Plan & Seating Chart */}
            <div className="px-3 lg:px-6 col-span-3 lg:col-span-1 py-4 text-[#054697]">
              Floor Plan & Seating Chart Creator
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <Minus className="w-4 h-4 text-[#054697]/60" />
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <Check className="w-4 h-4 text-[#054697]" />
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <Check className="w-4 h-4 text-[#054697]" />
            </div>
            
            {/* Video Calls */}
            <div className="px-3 lg:px-6 col-span-3 lg:col-span-1 py-4 text-[#054697]">
              Video Calls with Altare Planner
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <Minus className="w-4 h-4 text-[#054697]/60" />
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <p className="text-[#054697]/80 text-sm">Quarterly 60-min calls</p>
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <p className="text-[#054697]/80 text-sm">Quarterly 60-min calls</p>
            </div>
            
            {/* Moodboard Creation */}
            <div className="px-3 lg:px-6 col-span-3 lg:col-span-1 py-4 text-[#054697]">
              Moodboard Inspo Creation
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <Minus className="w-4 h-4 text-[#054697]/60" />
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <Minus className="w-4 h-4 text-[#054697]/60" />
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <Check className="w-4 h-4 text-[#054697]" />
            </div>
            
            {/* Month-Of Coordination */}
            <div className="px-3 lg:px-6 col-span-3 lg:col-span-1 py-4 text-[#054697]">
              Month-Of Coordinator (8 weeks before)
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <Minus className="w-4 h-4 text-[#054697]/60" />
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <Minus className="w-4 h-4 text-[#054697]/60" />
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <Check className="w-4 h-4 text-[#054697]" />
            </div>
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
                <div className="flex flex-row gap-4">
                  <Check className="w-4 h-4 mt-1 text-[#FFE8E4]" />
                  <div className="flex flex-col">
                    <p className="text-[#054697]">Professional Coordination</p>
                    <p className="text-[#054697]/80 text-sm">
                      Experienced coordinator to manage your wedding day
                    </p>
                  </div>
                </div>
                <div className="flex flex-row gap-4">
                  <Check className="w-4 h-4 mt-1 text-[#FFE8E4]" />
                  <div className="flex flex-col">
                    <p className="text-[#054697]">Vendor Management</p>
                    <p className="text-[#054697]/80 text-sm">
                      Coordination with all vendors before and during the event
                    </p>
                  </div>
                </div>
                <div className="flex flex-row gap-4">
                  <Check className="w-4 h-4 mt-1 text-[#FFE8E4]" />
                  <div className="flex flex-col">
                    <p className="text-[#054697]">Timeline Management</p>
                    <p className="text-[#054697]/80 text-sm">
                      Detailed schedule creation and execution
                    </p>
                  </div>
                </div>
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
