// Timeline Creator Utility Functions and Types

export interface TimelineEvent {
  time: string;
  event: string;
  notes: string;
  category: string;
}

export interface WeddingTimelineData {
  weddingDate: string;
  venueSame: boolean;
  ceremonyVenue?: string;
  receptionVenue?: string;
  ceremonyStart: string;
  ceremonyEnd: string;
  guestArrival: string;
  isChurch: boolean;
  firstLook: boolean;
  hairMakeup: boolean;
  numHMU: number;
  hmuStart: string;
  hmuEnd: string;
  hmuArrive: string;
  readyAtVenue: boolean;
  gettingReadyLocation?: string;
  travelTime?: number;
  photosBeforeCeremony: boolean;
  photosInCocktailHour: boolean;
  cocktailHour: boolean;
  cocktailStart: string;
  cocktailEnd: string;
  dinnerStart: string;
  dinnerService: 'buffet' | 'plated' | 'family';
  dinnerEnd: string;
  entrance: boolean;
  firstDance: boolean;
  firstDanceTime: 'beginning' | 'end';
  familyDances: number;
  speeches: number;
  thankYouToast: boolean;
  thankYouTime: 'toasts' | 'dinner';
  cake: boolean;
  cakeAnnounced: boolean;
  dessert: boolean;
  venueEndTime: string;
  transportation: boolean;
  specialPerformances: string[];
  events: TimelineEvent[];
}

// Helper function to format time (convert 24h to 12h format)
export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minutes} ${ampm}`;
};

// Helper function to parse time (convert 12h to 24h format)
export const parseTime = (time: string): string => {
  // Handle empty or invalid input
  if (!time || typeof time !== 'string') {
    return '00:00';
  }
  
  // If time is already in 24h format (no AM/PM), return it
  if (!time.includes('AM') && !time.includes('PM') && time.includes(':')) {
    const [hours, minutes] = time.split(':').map(part => parseInt(part, 10));
    if (!isNaN(hours) && !isNaN(minutes)) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
  }
  
  // Handle 12h format with AM/PM
  const timeUpperCase = time.toUpperCase();
  const isPM = timeUpperCase.includes('PM');
  const isAM = timeUpperCase.includes('AM');
  
  // Extract time part without AM/PM
  let timePart = timeUpperCase;
  if (isPM) {
    timePart = timePart.replace('PM', '').trim();
  } else if (isAM) {
    timePart = timePart.replace('AM', '').trim();
  }
  
  // Parse hours and minutes
  let hours = 0;
  let minutes = 0;
  
  if (timePart.includes(':')) {
    const parts = timePart.split(':');
    hours = parseInt(parts[0], 10);
    minutes = parseInt(parts[1], 10);
  } else {
    // Handle case where only hours are provided
    hours = parseInt(timePart, 10);
    minutes = 0;
  }
  
  // Handle NaN values
  if (isNaN(hours)) hours = 0;
  if (isNaN(minutes)) minutes = 0;
  
  // Convert to 24h format
  if (isPM && hours < 12) {
    hours += 12;
  } else if (isAM && hours === 12) {
    hours = 0;
  }
  
  // Ensure hours and minutes are in valid range
  hours = Math.max(0, Math.min(23, hours));
  minutes = Math.max(0, Math.min(59, minutes));
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Generate Mermaid timeline code from wedding timeline data
export const generateMermaidTimeline = (data: WeddingTimelineData): string => {
  // Sort events by time
  const sortedEvents = [...data.events].sort((a, b) => {
    const timeA = parseTime(a.time);
    const timeB = parseTime(b.time);
    return timeA.localeCompare(timeB);
  });

  // Group events by category
  const eventsByCategory: Record<string, TimelineEvent[]> = {};
  sortedEvents.forEach(event => {
    if (!eventsByCategory[event.category]) {
      eventsByCategory[event.category] = [];
    }
    eventsByCategory[event.category].push(event);
  });

  // Generate Mermaid gantt chart
  let mermaidCode = `gantt
    title Wedding Day Timeline - ${data.weddingDate || 'Your Wedding Day'}
    dateFormat HH:mm
    axisFormat %H:%M
    tickInterval 1hour
    `;

  // Add events by category
  Object.entries(eventsByCategory).forEach(([category, events]) => {
    if (events.length === 0) return;
    
    mermaidCode += `\n    section ${category}`;
    
    events.forEach((event, index) => {
      const startTime = parseTime(event.time);
      
      // Calculate duration to next event or default to 30 minutes
      let duration = '30m';
      if (index < events.length - 1) {
        const nextStartTime = parseTime(events[index + 1].time);
        
        // Parse hours and minutes safely
        const [startHours, startMinutes] = startTime.split(':').map(part => parseInt(part, 10));
        const [nextHours, nextMinutes] = nextStartTime.split(':').map(part => parseInt(part, 10));
        
        // Ensure we have valid numbers
        if (!isNaN(startHours) && !isNaN(startMinutes) && !isNaN(nextHours) && !isNaN(nextMinutes)) {
          const startTotalMinutes = startHours * 60 + startMinutes;
          const nextTotalMinutes = nextHours * 60 + nextMinutes;
          
          // Handle case where next event is on the next day (after midnight)
          let durationMinutes = nextTotalMinutes - startTotalMinutes;
          if (durationMinutes < 0) {
            durationMinutes = (24 * 60) + durationMinutes; // Add 24 hours
          }
          
          // Ensure minimum duration is 15 minutes for visibility
          durationMinutes = Math.max(15, durationMinutes);
          
          if (durationMinutes > 0) {
            const durationHours = Math.floor(durationMinutes / 60);
            const remainingMinutes = durationMinutes % 60;
            
            if (durationHours > 0) {
              duration = `${durationHours}h${remainingMinutes > 0 ? remainingMinutes + 'm' : ''}`;
            } else {
              duration = `${remainingMinutes}m`;
            }
          }
        }
      }
      
      // Escape colons and other special characters in event names to avoid Mermaid syntax issues
      const escapedEventName = event.event.replace(/:/g, '\\:').replace(/,/g, '\\,');
      
      // Add notes as crit if they exist
      const critTag = event.notes ? 'crit, ' : '';
      
      // Add the event to the timeline
      mermaidCode += `\n    ${escapedEventName.padEnd(25)} :${critTag}${startTime}, ${duration}`;
      
      // Add notes as a comment if they exist
      if (event.notes) {
        mermaidCode += `\n    %% ${event.notes.replace(/\n/g, ' ')}`;
      }
    });
  });

  return mermaidCode;
};

// Generate a default wedding timeline based on inputs
export const generateDefaultTimeline = (data: Partial<WeddingTimelineData>): WeddingTimelineData => {
  // Default ceremony time is 5:30 PM if not specified
  const ceremonyStart = data.ceremonyStart || '17:30';
  const guestArrival = data.guestArrival || '17:00';
  
  // Calculate ceremony end based on whether it's at a church
  const ceremonyDuration = data.isChurch ? 60 : 30;
  const ceremonyEndTime = addMinutesToTime(ceremonyStart, ceremonyDuration);
  
  // Default timeline data
  const defaultData: WeddingTimelineData = {
    weddingDate: data.weddingDate || new Date().toISOString().split('T')[0],
    venueSame: data.venueSame !== undefined ? data.venueSame : true,
    ceremonyVenue: data.ceremonyVenue || '',
    receptionVenue: data.receptionVenue || '',
    ceremonyStart: ceremonyStart,
    ceremonyEnd: ceremonyEndTime,
    guestArrival: guestArrival,
    isChurch: data.isChurch || false,
    firstLook: data.firstLook || false,
    hairMakeup: data.hairMakeup || false,
    numHMU: data.numHMU || 0,
    hmuStart: '09:15',
    hmuEnd: '13:45',
    hmuArrive: '09:00',
    readyAtVenue: data.readyAtVenue || true,
    gettingReadyLocation: data.gettingReadyLocation || '',
    travelTime: data.travelTime || 0,
    photosBeforeCeremony: data.photosBeforeCeremony || false,
    photosInCocktailHour: data.photosInCocktailHour || false,
    cocktailHour: data.cocktailHour || true,
    cocktailStart: ceremonyEndTime,
    cocktailEnd: addMinutesToTime(ceremonyEndTime, 60),
    dinnerStart: addMinutesToTime(ceremonyEndTime, 60),
    dinnerService: data.dinnerService || 'plated',
    dinnerEnd: addMinutesToTime(addMinutesToTime(ceremonyEndTime, 60), 120),
    entrance: data.entrance || false,
    firstDance: data.firstDance || false,
    firstDanceTime: data.firstDanceTime || 'beginning',
    familyDances: data.familyDances || 0,
    speeches: data.speeches || 0,
    thankYouToast: data.thankYouToast || false,
    thankYouTime: data.thankYouTime || 'toasts',
    cake: data.cake || false,
    cakeAnnounced: data.cakeAnnounced || false,
    dessert: data.dessert || false,
    venueEndTime: '00:00',
    transportation: data.transportation || false,
    specialPerformances: data.specialPerformances || [],
    events: generateEventsFromData(data),
  };
  
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
  const guestArrival = data.guestArrival || '17:00';
  
  // Calculate ceremony end based on whether it's at a church
  const ceremonyDuration = data.isChurch ? 60 : 30;
  const ceremonyEndTime = addMinutesToTime(ceremonyStart, ceremonyDuration);
  
  // Pre-ceremony events
  if (data.hairMakeup) {
    const numPeople = data.numHMU || 1;
    const hmuDuration = numPeople > 9 ? numPeople * 30 : numPeople * 60; // Adjust for multiple artists
    
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
      notes: `Hair and makeup begins for ${numPeople} people`,
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
  
  if (data.firstDance && data.firstDanceTime === 'beginning') {
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
  
  const foodServiceTime = data.firstDance && data.firstDanceTime === 'beginning'
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
    dinnerDuration = 60; // 1 hour for family style
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
  
  if (data.firstDance && data.firstDanceTime === 'end') {
    events.push({
      time: formatTime(dinnerEndTime),
      event: 'FIRST DANCE',
      notes: 'First dance',
      category: 'Reception'
    });
  }
  
  if (data.familyDances && data.familyDances > 0) {
    const familyDanceTime = data.firstDance && data.firstDanceTime === 'end'
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
      notes: `Couple cuts cake${data.cakeAnnounced ? ' (Announced)' : ' (Private)'}`,
      category: 'Reception'
    });
  }
  
  if (data.dessert) {
    const dessertTime = data.cake 
      ? addMinutesToTime(dancePartyStartTime, 20)
      : addMinutesToTime(dancePartyStartTime, 30);
    
    events.push({
      time: formatTime(dessertTime),
      event: 'DESSERT',
      notes: 'Dessert is served',
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
  
  return events;
};
