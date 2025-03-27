// Timeline Creator Utility Functions and Types

export interface TimelineEvent {
  time: string;
  event: string;
  notes: string;
  category: string;
  order?: number; // Added order field for proper sorting
}

export interface WeddingTimelineData {
  weddingDate: string;
  venueSame: boolean;
  ceremonyVenue?: string;
  receptionVenue?: string;
  ceremonyStart?: string;
  ceremonyEnd?: string;
  receptionStart?: string;
  receptionEnd?: string;
  guestArrival?: string;
  isChurch?: boolean;
  hairMakeup?: boolean;
  hairMakeupStart?: string;
  hairMakeupLocation?: string;
  numHMU?: number;
  firstLook?: boolean;
  firstLookTime?: string;
  firstLookLocation?: string;
  photosBeforeCeremony?: boolean;
  photographyStart?: string;
  photographyEnd?: string;
  cocktailHour?: boolean;
  entrance?: boolean;
  dinnerService?: 'plated' | 'buffet' | 'family' | 'stations';
  mealServiceStyle?: string;
  mealDetails?: any;
  firstDance?: boolean;
  firstDanceTime?: 'entrance' | 'after_dinner';
  familyDances?: number;
  speeches?: number;
  specialMoments?: any;
  thankYouToast?: boolean;
  thankYouTime?: 'toasts' | 'dinner';
  cake?: boolean;
  cakeCutting?: boolean;
  cakeAnnounced?: boolean;
  bouquetToss?: boolean;
  garterToss?: boolean;
  lastDance?: boolean;
  grandExit?: boolean;
  exitType?: 'sparklers' | 'bubbles' | 'ribbon' | 'confetti' | 'other';
  dessert?: boolean;
  dessertService?: 'table' | 'buffet' | 'passed' | 'other';
  venueEndTime?: string;
  transportation?: boolean;
  transportationDetails?: any;
  vendors: {
    dayOfCoordinator: boolean;
    photographer: boolean;
    videographer: boolean;
    florist: boolean;
    dj: boolean;
    band: boolean;
    officiant: boolean;
    rentals: boolean;
    other: string;
  };
  readyAtVenue?: boolean;
  gettingReadyLocation?: string;
  travelTime?: number;
  photosInCocktailHour?: boolean;
  events: TimelineEvent[];
  // Vendor information
}

// Format time string to a more readable format (e.g., "15:30" to "3:30 PM")
export const formatTime = (timeString: string): string => {
  if (!timeString || timeString.trim() === '') {
    return '';
  }

  try {
    // Handle if already in HH:mm format
    const [hoursStr, minutesStr] = timeString.split(':');
    const hours = parseInt(hoursStr, 10);
    const minutes = minutesStr ? parseInt(minutesStr, 10) : 0;
    
    if (isNaN(hours) || isNaN(minutes)) {
      return timeString; // Return original if parsing fails
    }
    
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHour = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    
    return `${formattedHour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString; // Return original on error
  }
};

// Parse time string to HH:mm format for Mermaid
export const parseTime = (timeString: string): string => {
  if (!timeString || timeString.trim() === '') {
    console.warn('Empty time string provided to parseTime');
    return '00:00'; // Default to midnight
  }

  // Try to handle various time formats
  try {
    // Remove any non-numeric characters except : and am/pm indicators
    const cleanedTime = timeString.trim().toLowerCase();
    
    // Check if it's already in HH:mm format
    if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(cleanedTime)) {
      // Ensure two digits for hours
      const [hours, minutes] = cleanedTime.split(':');
      return `${hours.padStart(2, '0')}:${minutes}`;
    }
    
    // Handle AM/PM format
    if (/^([0-9]|1[0-2])(:[0-5][0-9])?\s*(am|pm)$/.test(cleanedTime)) {
      let [time, period] = cleanedTime.split(/\s+/);
      let [hours, minutes = '00'] = time.split(':');
      
      let hoursNum = parseInt(hours, 10);
      
      // Convert to 24-hour format
      if (period === 'pm' && hoursNum < 12) {
        hoursNum += 12;
      } else if (period === 'am' && hoursNum === 12) {
        hoursNum = 0;
      }
      
      return `${hoursNum.toString().padStart(2, '0')}:${minutes}`;
    }
    
    // Try to parse as a Date object if it's a more complex format
    const date = new Date(`2023-01-01T${cleanedTime}`);
    if (!isNaN(date.getTime())) {
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    
    // Last resort: try to extract numbers
    const matches = cleanedTime.match(/(\d{1,2})(?::(\d{1,2}))?(?:\s*(am|pm))?/i);
    if (matches) {
      let hours = parseInt(matches[1], 10);
      const minutes = matches[2] ? parseInt(matches[2], 10) : 0;
      const period = matches[3] ? matches[3].toLowerCase() : null;
      
      // Convert to 24-hour format if period is specified
      if (period === 'pm' && hours < 12) {
        hours += 12;
      } else if (period === 'am' && hours === 12) {
        hours = 0;
      }
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    console.warn(`Could not parse time string: ${timeString}, using default`);
    return '00:00';
  } catch (error) {
    console.error(`Error parsing time: ${timeString}`, error);
    return '00:00';
  }
};

// Generate Mermaid timeline code from wedding timeline data
export const generateMermaidTimeline = (data: WeddingTimelineData): string => {
  if (!data.events || data.events.length === 0) {
    return `gantt
    title Wedding Timeline - ${data.weddingDate}
    dateFormat HH:mm
    axisFormat %H:%M
    
    section Timeline
    Wedding Day :00:00, 24h`;
  }

  // Sort events by time
  const sortedEvents = [...data.events].sort((a, b) => {
    const timeA = parseTime(a.time);
    const timeB = parseTime(b.time);
    return timeA.localeCompare(timeB);
  });

  // Group events by category
  const eventsByCategory: Record<string, TimelineEvent[]> = {};
  
  sortedEvents.forEach(event => {
    const category = event.category || 'Other';
    if (!eventsByCategory[category]) {
      eventsByCategory[category] = [];
    }
    eventsByCategory[category].push(event);
  });

  // Generate Mermaid code
  let mermaidCode = `gantt
  title Wedding Timeline - ${data.weddingDate}
  dateFormat HH:mm
  axisFormat %H:%M
`;

  // Add events by category
  Object.entries(eventsByCategory).forEach(([category, events]) => {
    mermaidCode += `\n  section ${category}\n`;
    
    events.forEach(event => {
      const startTime = parseTime(event.time);
      
      // Default duration of 30 minutes if not specified
      const duration = '30min';
      
      // Escape any colons in the event description
      const escapedEvent = event.event.replace(/:/g, '\\:');
      
      // Add the event to the timeline
      // Format: Task name :startTime, duration
      mermaidCode += `  ${escapedEvent} :${startTime}, ${duration}\n`;
    });
  });

  return mermaidCode;
};

// Generate a default wedding timeline based on inputs
export const generateDefaultTimeline = (data: Partial<WeddingTimelineData>): WeddingTimelineData => {
  const defaultData: WeddingTimelineData = {
    weddingDate: data.weddingDate || new Date().toISOString().split('T')[0],
    venueSame: data.venueSame !== undefined ? data.venueSame : true,
    ceremonyVenue: data.ceremonyVenue || '',
    receptionVenue: data.receptionVenue || '',
    ceremonyStart: data.ceremonyStart || '17:30',
    ceremonyEnd: data.ceremonyEnd || '18:00',
    receptionStart: data.receptionStart || '18:00',
    receptionEnd: data.receptionEnd || '23:00',
    guestArrival: data.guestArrival || '17:00',
    isChurch: data.isChurch || false,
    hairMakeup: data.hairMakeup || false,
    hairMakeupStart: data.hairMakeupStart || '14:00',
    hairMakeupLocation: data.hairMakeupLocation || '',
    numHMU: data.numHMU || 1,
    firstLook: data.firstLook || false,
    firstLookTime: data.firstLookTime || '15:00',
    firstLookLocation: data.firstLookLocation || '',
    photosBeforeCeremony: data.photosBeforeCeremony || false,
    photographyStart: data.photographyStart || '15:30',
    photographyEnd: data.photographyEnd || '17:00',
    cocktailHour: data.cocktailHour || true,
    entrance: data.entrance || true,
    dinnerService: data.dinnerService || 'plated',
    mealServiceStyle: data.mealServiceStyle || '',
    mealDetails: data.mealDetails || {},
    firstDance: data.firstDance || true,
    firstDanceTime: data.firstDanceTime || 'entrance',
    familyDances: data.familyDances || 0,
    speeches: data.speeches || 0,
    specialMoments: data.specialMoments || {},
    thankYouToast: data.thankYouToast || false,
    thankYouTime: data.thankYouTime || 'dinner',
    cake: data.cake || true,
    cakeCutting: data.cakeCutting || false,
    cakeAnnounced: data.cakeAnnounced || false,
    bouquetToss: data.bouquetToss || false,
    garterToss: data.garterToss || false,
    lastDance: data.lastDance || false,
    grandExit: data.grandExit || false,
    exitType: data.exitType || 'sparklers',
    dessert: data.dessert || false,
    dessertService: data.dessertService || 'table',
    venueEndTime: data.venueEndTime || '00:00',
    transportation: data.transportation || false,
    transportationDetails: data.transportationDetails || {},
    vendors: {
      dayOfCoordinator: data.vendors?.dayOfCoordinator || false,
      photographer: data.vendors?.photographer || false,
      videographer: data.vendors?.videographer || false,
      florist: data.vendors?.florist || false,
      dj: data.vendors?.dj || false,
      band: data.vendors?.band || false,
      officiant: data.vendors?.officiant || false,
      rentals: data.vendors?.rentals || false,
      other: data.vendors?.other || ''
    },
    readyAtVenue: data.readyAtVenue || false,
    gettingReadyLocation: data.gettingReadyLocation || '',
    travelTime: data.travelTime || 0,
    photosInCocktailHour: data.photosInCocktailHour || false,
    events: []
  };
  
  // Generate events after all properties are set
  defaultData.events = generateEventsFromData(defaultData);
  
  return defaultData;
};

// Helper function to add minutes to a time string
export const addMinutesToTime = (time: string, minutes: number): string => {
  const [hours, mins] = time.split(':').map(part => parseInt(part, 10));
  const totalMinutes = hours * 60 + mins + minutes;
  
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;
  
  return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
};

// Generate timeline events based on wedding data
export const generateEventsFromData = (data: Partial<WeddingTimelineData>): TimelineEvent[] => {
  const events: TimelineEvent[] = [];
  
  // Default ceremony time is 5:30 PM if not specified
  const ceremonyStart = data.ceremonyStart || '17:30';
  const guestArrival = data.guestArrival || addMinutesToTime(ceremonyStart, -30);
  
  // Calculate ceremony end based on whether it's at a church
  const ceremonyDuration = data.isChurch ? 60 : 30;
  const ceremonyEndTime = addMinutesToTime(ceremonyStart, ceremonyDuration);
  
  // Pre-ceremony events
  if (data.hairMakeup) {
    const numPeople = data.numHMU || 1;
    // New formula: 1-3 people = 2 hours per person, 4+ people = people/2 hours with multiple artists
    const hmuDuration = numPeople >= 4 ? (numPeople / 2) * 60 : numPeople * 120; // Convert to minutes
    
    const hmuEnd = addMinutesToTime(ceremonyStart, -90); // HMU ends 1.5 hours before ceremony
    const hmuStart = addMinutesToTime(hmuEnd, -hmuDuration);
    const hmuArrive = addMinutesToTime(hmuStart, -15);
    
    events.push({
      time: formatTime(hmuArrive),
      event: 'HMU ARRIVE',
      notes: 'Hair and makeup arrives',
      category: 'Pre-Ceremony'
    });
    
    events.push({
      time: formatTime(hmuStart),
      event: 'HMU START',
      notes: numPeople >= 4 
        ? `Hair and makeup begins for ${numPeople} people (with multiple artists)`
        : `Hair and makeup begins for ${numPeople} people`,
      category: 'Pre-Ceremony'
    });
    
    events.push({
      time: formatTime(hmuEnd),
      event: 'HMU END',
      notes: 'Hair and makeup is complete',
      category: 'Pre-Ceremony'
    });
    
    events.push({
      time: formatTime(addMinutesToTime(hmuEnd, 0)),
      event: 'CLOTHING',
      notes: 'Couple gets dressed and puts on finishing touches',
      category: 'Pre-Ceremony'
    });
  }
  
  if (data.firstLook) {
    const firstLookTime = addMinutesToTime(ceremonyStart, -180); // 3 hours before ceremony
    
    events.push({
      time: formatTime(firstLookTime),
      event: 'FIRST LOOK',
      notes: 'First Look',
      category: 'Pre-Ceremony'
    });
    
    events.push({
      time: formatTime(addMinutesToTime(firstLookTime, 15)),
      event: 'CP',
      notes: 'Couples portraits',
      category: 'Pre-Ceremony'
    });
  }
  
  if (data.photosBeforeCeremony) {
    const photoStartTime = data.firstLook 
      ? addMinutesToTime(ceremonyStart, -150) // 2.5 hours before ceremony if first look
      : addMinutesToTime(ceremonyStart, -120); // 2 hours before ceremony if no first look
    
    events.push({
      time: formatTime(photoStartTime),
      event: 'WEDDING PARTY',
      notes: 'Wedding party photos',
      category: 'Pre-Ceremony'
    });
    
    events.push({
      time: formatTime(addMinutesToTime(photoStartTime, 30)),
      event: 'FAMILY PHOTO',
      notes: 'Family photos',
      category: 'Pre-Ceremony'
    });
    
    events.push({
      time: formatTime(addMinutesToTime(photoStartTime, 60)),
      event: 'BUFFER',
      notes: 'Photo buffer time/travel time',
      category: 'Pre-Ceremony'
    });
    
    events.push({
      time: formatTime(addMinutesToTime(photoStartTime, 75)),
      event: 'COMPLETE',
      notes: 'Photos are completed',
      category: 'Pre-Ceremony'
    });
  }
  
  // Ceremony events
  events.push({
    time: formatTime(guestArrival),
    event: 'GUEST ARRIVAL',
    notes: 'Guests arrive at venue',
    category: 'Ceremony'
  });
  
  events.push({
    time: formatTime(ceremonyStart),
    event: 'CEREMONY START',
    notes: 'Ceremony begins',
    category: 'Ceremony'
  });
  
  events.push({
    time: formatTime(ceremonyEndTime),
    event: 'CEREMONY END',
    notes: 'Ceremony ends',
    category: 'Ceremony'
  });
  
  // Reception events
  if (data.cocktailHour) {
    events.push({
      time: formatTime(ceremonyEndTime),
      event: 'COCKTAIL START',
      notes: 'Cocktail hour begins',
      category: 'Reception'
    });
    
    const cocktailEnd = addMinutesToTime(ceremonyEndTime, 60);
    
    events.push({
      time: formatTime(addMinutesToTime(cocktailEnd, -10)),
      event: 'ASK',
      notes: 'Gently begin to ask guests to be seated',
      category: 'Reception'
    });
    
    events.push({
      time: formatTime(cocktailEnd),
      event: 'COCKTAIL END',
      notes: 'Cocktail hour ends',
      category: 'Reception'
    });
    
    events.push({
      time: formatTime(cocktailEnd),
      event: 'DINNER START',
      notes: 'Guests are seated',
      category: 'Reception'
    });
  } else {
    events.push({
      time: formatTime(ceremonyEndTime),
      event: 'DINNER START',
      notes: 'Guests are seated',
      category: 'Reception'
    });
  }
  
  if (data.entrance) {
    const entranceTime = data.cocktailHour 
      ? addMinutesToTime(ceremonyEndTime, 75) // 1 hour 15 min after ceremony
      : addMinutesToTime(ceremonyEndTime, 15); // 15 min after ceremony
    
    events.push({
      time: formatTime(entranceTime),
      event: 'COUPLES ENTRANCE',
      notes: 'Couple enter into the reception',
      category: 'Reception'
    });
  }
  
  if (data.firstDance && data.firstDanceTime === 'entrance') {
    const danceTime = data.entrance 
      ? addMinutesToTime(data.cocktailHour ? addMinutesToTime(ceremonyEndTime, 75) : addMinutesToTime(ceremonyEndTime, 15), 5) 
      : addMinutesToTime(data.cocktailHour ? addMinutesToTime(ceremonyEndTime, 60) : ceremonyEndTime, 15);
    
    events.push({
      time: formatTime(danceTime),
      event: 'FIRST DANCE',
      notes: 'First dance',
      category: 'Reception'
    });
  }
  
  const foodServiceTime = data.firstDance && data.firstDanceTime === 'entrance'
    ? addMinutesToTime(data.cocktailHour ? addMinutesToTime(ceremonyEndTime, 75) : addMinutesToTime(ceremonyEndTime, 15), 15)
    : addMinutesToTime(data.cocktailHour ? addMinutesToTime(ceremonyEndTime, 60) : ceremonyEndTime, 15);
  
  events.push({
    time: formatTime(foodServiceTime),
    event: 'FOOD SERVICE',
    notes: 'Food service begins',
    category: 'Reception'
  });
  
  if (data.speeches && data.speeches > 0) {
    const toastTime = addMinutesToTime(foodServiceTime, 30);
    
    events.push({
      time: formatTime(toastTime),
      event: 'TOAST',
      notes: 'Toasts begin',
      category: 'Reception'
    });
    
    const toastEndTime = addMinutesToTime(toastTime, data.speeches * 5);
    
    events.push({
      time: formatTime(toastEndTime),
      event: 'TOAST END',
      notes: 'Toasts are complete',
      category: 'Reception'
    });
    
    if (data.thankYouToast && data.thankYouTime === 'toasts') {
      events.push({
        time: formatTime(toastEndTime),
        event: 'THANK YOU',
        notes: 'Couple gives thank you toast',
        category: 'Reception'
      });
    }
  }
  
  // Dinner duration based on service type
  let dinnerDuration = 120; // Default 2 hours
  if (data.dinnerService === 'family') {
    dinnerDuration = 90; // 1.5 hours for family style
  }
  
  const dinnerEndTime = addMinutesToTime(foodServiceTime, dinnerDuration);
  
  events.push({
    time: formatTime(dinnerEndTime),
    event: 'DINNER END',
    notes: 'Food service is complete',
    category: 'Reception'
  });
  
  if (data.thankYouToast && data.thankYouTime === 'dinner') {
    events.push({
      time: formatTime(dinnerEndTime),
      event: 'THANK YOU',
      notes: 'Couple gives thank you toast',
      category: 'Reception'
    });
  }
  
  if (data.firstDance && data.firstDanceTime === 'after_dinner') {
    events.push({
      time: formatTime(dinnerEndTime),
      event: 'FIRST DANCE',
      notes: 'First dance',
      category: 'Reception'
    });
  }
  
  if (data.familyDances && data.familyDances > 0) {
    const familyDanceTime = data.firstDance && data.firstDanceTime === 'after_dinner'
      ? addMinutesToTime(dinnerEndTime, 5)
      : dinnerEndTime;
    
    events.push({
      time: formatTime(familyDanceTime),
      event: 'FAMILY DANCE',
      notes: `Family dance${data.familyDances > 1 ? 's' : ''}`,
      category: 'Reception'
    });
  }
  
  const dancePartyStartTime = data.familyDances && data.familyDances > 0
    ? addMinutesToTime(dinnerEndTime, 10)
    : addMinutesToTime(dinnerEndTime, 0);
  
  events.push({
    time: formatTime(dancePartyStartTime),
    event: 'DANCE PARTY START',
    notes: 'DANCE PARTY!',
    category: 'Reception'
  });
  
  if (data.cake) {
    const cakeTime = addMinutesToTime(dancePartyStartTime, 20);
    
    events.push({
      time: formatTime(cakeTime),
      event: 'CAKE',
      notes: `Couple cuts cake${data.cakeCutting ? ' (Announced)' : ' (Private)'}`,
      category: 'Reception'
    });
  }
  
  if (data.dessert) {
    const dessertTime = data.cake 
      ? addMinutesToTime(dancePartyStartTime, 20)
      : addMinutesToTime(dancePartyStartTime, 30);
    
    const dessertServiceOptions: Record<string, string> = {
      'table': 'served at the table',
      'buffet': 'available at the buffet',
      'passed': 'passed around by servers',
      'other': 'available for guests'
    };
    
    const dessertServiceText = dessertServiceOptions[data.dessertService || 'table'];
    
    events.push({
      time: formatTime(dessertTime),
      event: 'DESSERT & COFFEE',
      notes: `Dessert and coffee ${dessertServiceText}`,
      category: 'Reception'
    });
  }
  
  // Calculate event end time (1 hour before venue end time)
  const venueEndTime = data.venueEndTime || '00:00';
  const eventEndTime = addMinutesToTime(venueEndTime, -60);
  
  events.push({
    time: formatTime(eventEndTime),
    event: 'EVENT END',
    notes: 'Wedding is complete but it is just the beginning!',
    category: 'Closing'
  });
  
  events.push({
    time: formatTime(venueEndTime),
    event: 'LOAD OUT',
    notes: 'Cleanup and packup is complete',
    category: 'Closing'
  });
  
  // Sort events by time to ensure chronological order
  return events.sort((a, b) => {
    // Parse times properly, handling AM/PM format
    const parseTimeToMinutes = (timeStr: string): number => {
      // Check if the time is in 12-hour format with AM/PM
      if (timeStr.includes('AM') || timeStr.includes('PM')) {
        const [timePart, period] = timeStr.split(' ');
        let [hours, minutes] = timePart.split(':').map(Number);
        
        // Convert 12-hour format to 24-hour
        if (period === 'PM' && hours < 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        
        // Special handling for EVENT END and LOAD OUT events
        // These should always be at the end of the timeline
        if ((a.event === 'EVENT END' || a.event === 'LOAD OUT') && 
            (b.event !== 'EVENT END' && b.event !== 'LOAD OUT')) {
          return 1; // a comes after b
        }
        
        if ((b.event === 'EVENT END' || b.event === 'LOAD OUT') && 
            (a.event !== 'EVENT END' && a.event !== 'LOAD OUT')) {
          return -1; // b comes after a
        }
        
        // If both are closing events, maintain their relative order
        if ((a.event === 'EVENT END' || a.event === 'LOAD OUT') && 
            (b.event === 'EVENT END' || b.event === 'LOAD OUT')) {
          return a.event === 'EVENT END' ? -1 : 1;
        }
        
        return hours * 60 + minutes;
      } else {
        // Handle 24-hour format
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
      }
    };
    
    // Special handling for EVENT END and LOAD OUT events
    // These should always be at the end of the timeline
    if ((a.event === 'EVENT END' || a.event === 'LOAD OUT') && 
        (b.event !== 'EVENT END' && b.event !== 'LOAD OUT')) {
      return 1; // a comes after b
    }
    
    if ((b.event === 'EVENT END' || b.event === 'LOAD OUT') && 
        (a.event !== 'EVENT END' && a.event !== 'LOAD OUT')) {
      return -1; // b comes after a
    }
    
    // If both are closing events, maintain their relative order
    if ((a.event === 'EVENT END' || a.event === 'LOAD OUT') && 
        (b.event === 'EVENT END' || b.event === 'LOAD OUT')) {
      return a.event === 'EVENT END' ? -1 : 1;
    }
    
    const minutesA = parseTimeToMinutes(a.time);
    const minutesB = parseTimeToMinutes(b.time);
    
    return minutesA - minutesB;
  });
};
