import { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  TextField,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Grid,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  useTheme,
} from '@mui/material';
import ThemeWrapper, {
  BrandPaper,
  BrandHeading,
  BrandButton,
  BrandTextField,
  brandStyles
} from '../components/ThemeWrapper';
import { 
  Add as AddIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Timeline as TimelineIcon,
  TableChart as TableChartIcon,
  Email as EmailIcon,
  ContentCopy as ContentCopyIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { format, parse, parseISO } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import WizardStep from '../components/WizardStep';
import ChronoTimeline from '../components/ChronoTimeline';
import TimelineTable from '../components/TimelineTable';
import { 
  WeddingTimelineData, 
  TimelineEvent,
  generateEventsFromData,
} from '../utils/timelineCreatorUtils';

// Interface for form validation
interface FormErrors {
  [key: string]: string;
}

export default function TimelineCreator() {
  // Get URL parameters to check if we're in share mode
  const searchParams = new URLSearchParams(window.location.search);
  const sharedData = searchParams.get('data');
  const isShareMode = Boolean(sharedData);
  
  // State for the current step in the wizard
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 8; // Increased from 7 to 8 to add vendor step
  
  // Parse shared data if available
  const initialTimelineData = isShareMode && sharedData ? 
    JSON.parse(decodeURIComponent(sharedData)) : 
    {
      weddingDate: format(new Date(), 'yyyy-MM-dd'),
      venueSame: true,
      ceremonyStart: '16:00',
      ceremonyEnd: '16:30',
      guestArrival: '15:30',
      isChurch: false,
      firstLook: false,
      hairMakeup: true,
      numHMU: 4,
      hmuStart: '10:00',
      hmuEnd: '14:00',
      hmuArrive: '09:30',
      readyAtVenue: false,
      travelTime: 30,
      photosBeforeCeremony: true,
      photosInCocktailHour: true,
      cocktailHour: true,
      cocktailStart: '16:30',
      cocktailEnd: '17:30',
      dinnerStart: '17:30',
      dinnerService: 'plated',
      dinnerEnd: '19:00',
      entrance: true,
      firstDance: true,
      firstDanceTime: 'entrance',
      familyDances: 2,
      speeches: 3,
      thankYouToast: true,
      thankYouTime: 'toasts',
      cake: true,
      cakeAnnounced: false,
      dessert: true,
      dessertService: 'table',
      venueEndTime: '23:00',
      transportation: false,
      specialPerformances: [],
      events: [],
      vendors: {
        dayOfCoordinator: false,
        photographer: false,
        videographer: false,
        florist: false,
        dj: false,
        band: false,
        officiant: false,
        rentals: false,
        other: ''
      }
    };
  
  // State for the timeline data
  const [timelineData, setTimelineData] = useState<WeddingTimelineData>(initialTimelineData);
  
  // State for form validation
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
  // State for view mode (timeline or table)
  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline');
  
  // Get theme for consistent styling
  const theme = useTheme();
  
  // State for share dialog
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  
  // State for notification
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // State for custom events
  const [newEvent, setNewEvent] = useState<Partial<TimelineEvent>>({
    time: '',
    event: '',
    notes: '',
    category: 'Custom',
  });

  // Refs for export
  const timelineRef = useRef<HTMLDivElement>(null);
  
  // Effect to generate events on initial load
  useEffect(() => {
    try {
      // Ensure we have events to display on initial load
      if (!timelineData.events || timelineData.events.length === 0) {
        // Generate initial events based on default values
        const initialEvents = generateEventsFromData(timelineData);
        setTimelineData(prev => ({
          ...prev,
          events: initialEvents
        }));
      }
      
      // If in share mode, skip to the final step
      if (isShareMode) {
        setCurrentStep(totalSteps);
      }
    } catch (error) {
      console.error('Error generating timeline:', error);
      setNotification({
        open: true,
        message: 'Error generating timeline. Please check your data.',
        severity: 'error'
      });
    }
  }, [isShareMode, totalSteps]); // Only run on initial load and when share mode changes
  
  // Function to handle next step
  const handleNext = () => {
    if (currentStep === totalSteps) {
      // Final step - generate the timeline
      generateFinalTimeline();
    } else {
      // If moving to the review step, regenerate the timeline
      if (currentStep + 1 === totalSteps) {
        generateFinalTimeline();
      }
      setCurrentStep(currentStep + 1);
    }
  };
  
  // Function to handle back step
  const handleBack = () => {
    setCurrentStep(Math.max(1, currentStep - 1));
  };
  
  // Function to handle input change
  const handleInputChange = (field: keyof WeddingTimelineData, value: any) => {
    setTimelineData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field if it exists
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Regenerate timeline for key inputs that affect timing
    const timeAffectingFields: (keyof WeddingTimelineData)[] = [
      'ceremonyStart', 'guestArrival', 'isChurch', 'hairMakeup', 'numHMU',
      'firstLook', 'cocktailHour', 'dinnerService', 'firstDance', 'firstDanceTime',
      'familyDances', 'speeches', 'cake', 'dessert', 'dessertService'
    ];
    
    if (timeAffectingFields.includes(field)) {
      // Use setTimeout to ensure state is updated before regenerating
      setTimeout(() => generateFinalTimeline(), 0);
    }
  };
  
  // Function to handle time input change
  const handleTimeChange = (field: keyof WeddingTimelineData, value: Date | null) => {
    if (value) {
      const timeString = format(value, 'HH:mm');
      handleInputChange(field, timeString);
      
      // Time changes always affect the timeline
      setTimeout(() => generateFinalTimeline(), 0);
    }
  };
  
  // Function to validate the current step
  const validateCurrentStep = (): boolean => {
    const errors: FormErrors = {};
    
    switch (currentStep) {
      case 1: // General Wedding Info
        if (!timelineData.weddingDate) {
          errors.weddingDate = 'Wedding date is required';
        }
        if (!timelineData.venueSame) {
          if (!timelineData.ceremonyVenue) {
            errors.ceremonyVenue = 'Ceremony venue is required';
          }
          if (!timelineData.receptionVenue) {
            errors.receptionVenue = 'Reception venue is required';
          }
        } else if (!timelineData.ceremonyVenue) {
          errors.ceremonyVenue = 'Wedding venue is required';
        }
        break;
      
      // Add validation for other steps as needed
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Function to generate the final timeline
  const generateFinalTimeline = () => {
    // First, regenerate all events based on the latest user inputs
    const events = generateEventsFromData(timelineData);
    
    // Update the timeline data with the newly generated events
    // while preserving any custom events added by the user
    const customEvents = timelineData.events.filter(event => event.category === 'Custom');
    
    setTimelineData(prev => ({
      ...prev,
      events: [...events, ...customEvents].sort((a, b) => {
        // Sort events by time
        const timeA = a.time.split(':').map(Number);
        const timeB = b.time.split(':').map(Number);
        
        if (timeA[0] !== timeB[0]) {
          return timeA[0] - timeB[0]; // Sort by hour
        }
        return timeA[1] - timeB[1]; // Sort by minute
      })
    }));

    // Save the timeline data to localStorage
    saveTimelineToDatabase();
  };

  // Function to save timeline data to localStorage
  const saveTimelineToDatabase = async () => {
    try {
      // Save to localStorage for now since the database tables aren't available
      localStorage.setItem('wedding_timeline_data', JSON.stringify(timelineData));
      
      setNotification({
        open: true,
        message: 'Timeline saved successfully!',
        severity: 'success'
      });
      
      // Also generate timeline events and store them
      const events = generateEventsFromData(timelineData);
      localStorage.setItem('wedding_timeline_events', JSON.stringify(events));
      
    } catch (error) {
      console.error('Error saving timeline:', error);
      setNotification({
        open: true,
        message: 'An unexpected error occurred while saving your timeline',
        severity: 'error'
      });
    }
  };

  // Function to update an event in the timeline
  const handleUpdateEvent = (index: number, updatedEvent: TimelineEvent) => {
    const updatedEvents = [...timelineData.events];
    updatedEvents[index] = updatedEvent;
    setTimelineData(prev => ({
      ...prev,
      events: updatedEvents
    }));
  };
  
  // Function to delete an event from the timeline
  const handleDeleteEvent = (index: number) => {
    const updatedEvents = [...timelineData.events];
    updatedEvents.splice(index, 1);
    setTimelineData(prev => ({
      ...prev,
      events: updatedEvents
    }));
  };
  
  // Function to add a new event to the timeline
  const handleAddEvent = (newEvent: TimelineEvent) => {
    setTimelineData(prev => {
      // Add the new event and sort all events by time
      const updatedEvents = [...prev.events, newEvent].sort((a, b) => {
        // Sort events by time
        const timeA = a.time.split(':').map(Number);
        const timeB = b.time.split(':').map(Number);
        
        if (timeA[0] !== timeB[0]) {
          return timeA[0] - timeB[0]; // Sort by hour
        }
        return timeA[1] - timeB[1]; // Sort by minute
      });
      
      return {
        ...prev,
        events: updatedEvents
      };
    });
  };
  
  // Function to export the timeline as PDF
  const handleExportPDF = async () => {
    if (!timelineRef.current) return;
    
    try {
      const canvas = await html2canvas(timelineRef.current);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
      });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Wedding_Timeline_${timelineData.weddingDate}.pdf`);
      
      setNotification({
        open: true,
        message: 'Timeline exported successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setNotification({
        open: true,
        message: 'Failed to export timeline. Please try again.',
        severity: 'error'
      });
    }
  };

  // Function to handle sharing the timeline
  const handleShareTimeline = () => {
    setShareDialogOpen(true);
  };

  // Function to close share dialog
  const handleCloseShareDialog = () => {
    setShareDialogOpen(false);
  };

  // Function to copy timeline link
  const handleCopyLink = () => {
    const timelineDataStr = JSON.stringify(timelineData);
    const encodedData = encodeURIComponent(timelineDataStr);
    const shareUrl = `${window.location.origin}/timeline-share?data=${encodedData}`;
    
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setNotification({
          open: true,
          message: 'Link copied to clipboard!',
          severity: 'success'
        });
        handleCloseShareDialog();
      })
      .catch(() => {
        setNotification({
          open: true,
          message: 'Failed to copy link. Please try again.',
          severity: 'error'
        });
      });
  };

  // Function to share via email
  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Wedding Timeline for ${timelineData.weddingDate}`);
    const body = encodeURIComponent(`Here's our wedding timeline for ${timelineData.weddingDate}.\n\nCeremony: ${timelineData.ceremonyStart} at ${timelineData.ceremonyVenue}\n\nPlease review and let us know if you have any questions!`);
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    handleCloseShareDialog();
  };

  // Function to close notification
  const handleCloseNotification = () => {
    setNotification(prev => ({
      ...prev,
      open: false
    }));
  };

  // Function to render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderGeneralInfoStep();
      case 2:
        return renderPreCeremonyStep();
      case 3:
        return renderPostCeremonyStep();
      case 4:
        return renderReceptionActivitiesStep();
      case 5:
        return renderFinalDetailsStep();
      case 6:
        return renderVendorSelectionStep();
      case 7:
        return renderCustomEventsStep();
      case 8:
        return renderReviewStep();
      default:
        return null;
    }
  };

  // Function to render the general info step
  const renderGeneralInfoStep = () => {
    return (
      <WizardStep
        title="General Wedding Information"
        description="Let's start with the basic details about your wedding day."
        currentStep={1}
        totalSteps={totalSteps}
        onNext={() => {
          if (validateCurrentStep()) {
            handleNext();
          }
        }}
        onBack={handleBack}
        isNextDisabled={!timelineData.weddingDate || !timelineData.ceremonyVenue || (!timelineData.venueSame && !timelineData.receptionVenue)}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Wedding Date"
                value={timelineData.weddingDate ? parseISO(timelineData.weddingDate) : null}
                onChange={(date) => {
                  if (date) {
                    handleInputChange('weddingDate', format(date, 'yyyy-MM-dd'));
                  }
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!formErrors.weddingDate,
                    helperText: formErrors.weddingDate,
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={timelineData.venueSame}
                  onChange={(e) => handleInputChange('venueSame', e.target.checked)}
                />
              }
              label="Ceremony and reception are at the same location"
            />
          </Grid>

          {timelineData.venueSame ? (
            <Grid item xs={12}>
              <BrandTextField
                label="Wedding Venue"
                value={timelineData.ceremonyVenue || ''}
                onChange={(e) => handleInputChange('ceremonyVenue', e.target.value)}
                error={!!formErrors.ceremonyVenue}
                helperText={formErrors.ceremonyVenue || ''}
              />
            </Grid>
          ) : (
            <>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Ceremony Venue"
                  value={timelineData.ceremonyVenue}
                  onChange={(e) => handleInputChange('ceremonyVenue', e.target.value)}
                  error={!!formErrors.ceremonyVenue}
                  helperText={formErrors.ceremonyVenue}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Reception Venue"
                  value={timelineData.receptionVenue}
                  onChange={(e) => handleInputChange('receptionVenue', e.target.value)}
                  error={!!formErrors.receptionVenue}
                  helperText={formErrors.receptionVenue}
                />
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={timelineData.isChurch}
                  onChange={(e) => handleInputChange('isChurch', e.target.checked)}
                />
              }
              label="Getting married at a church or house of worship"
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {timelineData.isChurch
                ? 'Ceremony duration will be set to 60 minutes'
                : 'Ceremony duration will be set to 30 minutes'}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Ceremony Timing
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={timelineData.ceremonyStart !== ''}
                  onChange={(e) => {
                    if (!e.target.checked) {
                      handleInputChange('ceremonyStart', '');
                      handleInputChange('guestArrival', '');
                    } else {
                      handleInputChange('ceremonyStart', '17:30');
                      handleInputChange('guestArrival', '17:00');
                    }
                  }}
                />
              }
              label="Is your guest arrival or ceremony start time already set?"
            />
          </Grid>

          {timelineData.ceremonyStart !== '' && (
            <Grid item container spacing={3}>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <TimePicker
                    label="Guest Arrival Time"
                    value={
                      timelineData.guestArrival
                        ? parse(timelineData.guestArrival, 'HH:mm', new Date())
                        : null
                    }
                    onChange={(time) => handleTimeChange('guestArrival', time)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                      },
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <TimePicker
                    label="Ceremony Start Time"
                    value={
                      timelineData.ceremonyStart
                        ? parse(timelineData.ceremonyStart, 'HH:mm', new Date())
                        : null
                    }
                    onChange={(time) => handleTimeChange('ceremonyStart', time)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                      },
                    }}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          )}
        </Grid>
      </WizardStep>
    );
  };

  // Function to render the pre-ceremony step
  const renderPreCeremonyStep = () => {
    return (
      <WizardStep
        title="Pre-Ceremony Schedule"
        description="Let's plan what happens before the ceremony."
        currentStep={2}
        totalSteps={totalSteps}
        onNext={() => {
          if (validateCurrentStep()) {
            handleNext();
          }
        }}
        onBack={handleBack}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={timelineData.firstLook}
                  onChange={(e) => handleInputChange('firstLook', e.target.checked)}
                />
              }
              label="Are you doing a first look?"
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={timelineData.hairMakeup}
                  onChange={(e) => handleInputChange('hairMakeup', e.target.checked)}
                />
              }
              label="Are either or both marriers getting hair and makeup?"
            />
          </Grid>

          {timelineData.hairMakeup && (
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="num-hmu-label">Number of People</InputLabel>
                <Select
                  labelId="num-hmu-label"
                  value={timelineData.numHMU || 1}
                  label="Number of People"
                  onChange={(e) => handleInputChange('numHMU', e.target.value)}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <MenuItem key={num} value={num}>
                      {num} {num === 1 ? 'person' : 'people'} {(timelineData.numHMU || 1) >= 4 && num >= 4 ? '(multiple artists)' : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={timelineData.readyAtVenue}
                  onChange={(e) => handleInputChange('readyAtVenue', e.target.checked)}
                />
              }
              label="Are you getting ready at the venue?"
            />
          </Grid>

          {!timelineData.readyAtVenue && (
            <>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Getting Ready Location"
                  value={timelineData.gettingReadyLocation}
                  onChange={(e) => handleInputChange('gettingReadyLocation', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Travel Time to Venue (minutes)"
                  value={timelineData.travelTime}
                  onChange={(e) => handleInputChange('travelTime', parseInt(e.target.value))}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={timelineData.photosBeforeCeremony}
                  onChange={(e) => handleInputChange('photosBeforeCeremony', e.target.checked)}
                />
              }
              label="Do you want family/wedding party photos before the ceremony?"
            />
          </Grid>

          {!timelineData.photosBeforeCeremony && (
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={timelineData.photosInCocktailHour}
                    onChange={(e) => handleInputChange('photosInCocktailHour', e.target.checked)}
                  />
                }
                label="Do you want family/wedding party photos during cocktail hour?"
              />
            </Grid>
          )}
        </Grid>
      </WizardStep>
    );
  };

  // Function to render the post-ceremony step
  const renderPostCeremonyStep = () => {
    return (
      <WizardStep
        title="Post-Ceremony Events"
        description="Let's plan what happens after the ceremony."
        currentStep={3}
        totalSteps={totalSteps}
        onNext={() => {
          if (validateCurrentStep()) {
            handleNext();
          }
        }}
        onBack={handleBack}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={timelineData.cocktailHour}
                  onChange={(e) => handleInputChange('cocktailHour', e.target.checked)}
                />
              }
              label="Will you have a cocktail hour?"
            />
            {timelineData.cocktailHour && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Cocktail hour will start after the ceremony and last for 1 hour
              </Typography>
            )}
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Dinner Service
            </Typography>
            <FormControl fullWidth>
              <InputLabel>What type of dinner service are you having?</InputLabel>
              <Select
                value={timelineData.dinnerService}
                label="What type of dinner service are you having?"
                onChange={(e) => handleInputChange('dinnerService', e.target.value)}
              >
                <MenuItem value="buffet">Buffet (2 hours)</MenuItem>
                <MenuItem value="plated">Plated (2 hours)</MenuItem>
                <MenuItem value="family">Family Style (1.5 hours)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </WizardStep>
    );
  };

  // Function to render the reception activities step
  const renderReceptionActivitiesStep = () => {
    return (
      <WizardStep
        title="Reception Activities"
        description="Let's plan the activities during your reception."
        currentStep={4}
        totalSteps={totalSteps}
        onNext={() => {
          if (validateCurrentStep()) {
            handleNext();
          }
        }}
        onBack={handleBack}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={timelineData.entrance}
                  onChange={(e) => handleInputChange('entrance', e.target.checked)}
                />
              }
              label="Would you like an entrance announcement?"
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={timelineData.firstDance}
                  onChange={(e) => handleInputChange('firstDance', e.target.checked)}
                />
              }
              label="Will you have a first dance?"
            />
          </Grid>

          {timelineData.firstDance && (
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>When would you like to have your first dance?</InputLabel>
                <Select
                  value={timelineData.firstDanceTime}
                  label="When would you like to have your first dance?"
                  onChange={(e) => handleInputChange('firstDanceTime', e.target.value)}
                >
                  <MenuItem value="entrance">Right after entrance</MenuItem>
                  <MenuItem value="after_dinner">After dinner to kick off dance party</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={(timelineData.familyDances || 0) > 0}
                  onChange={(e) => handleInputChange('familyDances', e.target.checked ? 1 : 0)}
                />
              }
              label="Are you having any parent/family dances?"
            />
          </Grid>

          {(timelineData.familyDances || 0) > 0 && (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="How many family dances?"
                value={timelineData.familyDances}
                onChange={(e) => handleInputChange('familyDances', parseInt(e.target.value))}
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
          )}

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={(timelineData.speeches || 0) > 0}
                  onChange={(e) => handleInputChange('speeches', e.target.checked ? 1 : 0)}
                />
              }
              label="Are you having any speeches/toasts?"
            />
          </Grid>

          {(timelineData.speeches || 0) > 0 && (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="How many speeches/toasts?"
                value={timelineData.speeches}
                onChange={(e) => handleInputChange('speeches', parseInt(e.target.value))}
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={timelineData.thankYouToast}
                  onChange={(e) => handleInputChange('thankYouToast', e.target.checked)}
                />
              }
              label="Are you giving a 'Thank you' toast?"
            />
          </Grid>

          {timelineData.thankYouToast && (
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>When would you like to give your thank you toast?</InputLabel>
                <Select
                  value={timelineData.thankYouTime}
                  label="When would you like to give your thank you toast?"
                  onChange={(e) => handleInputChange('thankYouTime', e.target.value)}
                >
                  <MenuItem value="toasts">At the end of the toasts</MenuItem>
                  <MenuItem value="dinner">At the end of dinner</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={!!timelineData.cake}
                  onChange={(e) => handleInputChange('cake', e.target.checked)}
                />
              }
              label="Are you cutting a cake?"
            />
          </Grid>

          {timelineData.cake && (
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={!!timelineData.cakeAnnounced}
                    onChange={(e) => handleInputChange('cakeAnnounced', e.target.checked)}
                  />
                }
                label="Will cake cutting be announced?"
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={!!timelineData.dessert}
                  onChange={(e) => handleInputChange('dessert', e.target.checked)}
                />
              }
              label="Will you be serving dessert?"
            />
          </Grid>

          {timelineData.dessert && (
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="dessert-service-label">Dessert Service Style</InputLabel>
                <Select
                  labelId="dessert-service-label"
                  value={timelineData.dessertService || 'table'}
                  label="Dessert Service Style"
                  onChange={(e) => handleInputChange('dessertService', e.target.value)}
                >
                  <MenuItem value="table">Served at table</MenuItem>
                  <MenuItem value="buffet">Buffet style</MenuItem>
                  <MenuItem value="passed">Passed by servers</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>
      </WizardStep>
    );
  };

  // Function to render the final details step
  const renderFinalDetailsStep = () => {
    return (
      <WizardStep
        title="Final Details"
        description="Let's add the final details to your timeline."
        currentStep={5}
        totalSteps={totalSteps}
        onNext={() => {
          if (validateCurrentStep()) {
            handleNext();
          }
        }}
        onBack={handleBack}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <TimePicker
                label="What time does your venue contract end?"
                value={
                  timelineData.venueEndTime
                    ? parse(timelineData.venueEndTime, 'HH:mm', new Date())
                    : null
                }
                onChange={(time) => time && handleTimeChange('venueEndTime', time)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            </LocalizationProvider>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              We'll schedule load out at this time and end the event 1 hour before
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={!!timelineData.transportation}
                  onChange={(e) => handleInputChange('transportation', e.target.checked)}
                />
              }
              label="Will you be providing transportation for guests?"
            />
          </Grid>
        </Grid>
      </WizardStep>
    );
  };

  // Function to render the vendor selection step
  const renderVendorSelectionStep = () => {
    const handleVendorChange = (field: keyof WeddingTimelineData['vendors'], value: boolean | string) => {
      setTimelineData(prev => ({
        ...prev,
        vendors: {
          ...prev.vendors,
          [field]: value
        }
      }));
    };

    return (
      <WizardStep
        title="Vendor Selection"
        description="Select the vendors that will be part of your wedding day."
        currentStep={6}
        totalSteps={totalSteps}
        onNext={() => {
          if (validateCurrentStep()) {
            handleNext();
          }
        }}
        onBack={handleBack}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Which vendors will be part of your wedding day?
            </Typography>
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={timelineData.vendors.dayOfCoordinator}
                        onChange={(e) => handleVendorChange('dayOfCoordinator', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Day of Coordinator"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={timelineData.vendors.photographer}
                        onChange={(e) => handleVendorChange('photographer', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Photographer"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={timelineData.vendors.videographer}
                        onChange={(e) => handleVendorChange('videographer', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Videographer"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={timelineData.vendors.florist}
                        onChange={(e) => handleVendorChange('florist', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Florist"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={timelineData.vendors.dj}
                        onChange={(e) => handleVendorChange('dj', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="DJ"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={timelineData.vendors.band}
                        onChange={(e) => handleVendorChange('band', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Band"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={timelineData.vendors.officiant}
                        onChange={(e) => handleVendorChange('officiant', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Officiant"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={timelineData.vendors.rentals}
                        onChange={(e) => handleVendorChange('rentals', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Rentals"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Other Vendors"
                    value={timelineData.vendors.other}
                    onChange={(e) => handleVendorChange('other', e.target.value)}
                    placeholder="Please list any other vendors you'll have"
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </WizardStep>
    );
  };

  // Function to render the custom events step
  const renderCustomEventsStep = () => {
    const handleAddCustomEvent = () => {
      if (newEvent.time && newEvent.event) {
        handleAddEvent({
          time: newEvent.time,
          event: newEvent.event,
          notes: newEvent.notes || '',
          category: newEvent.category || 'Custom',
        });
        // Reset the newEvent state
        setNewEvent({
          time: '',
          event: '',
          notes: '',
          category: 'Custom',
        });
      }
    };

    return (
      <WizardStep
        title="Special Performances or Traditions"
        description="Add any special performances, traditions, or custom events to your timeline."
        currentStep={7}
        totalSteps={totalSteps}
        onNext={() => {
          if (validateCurrentStep()) {
            handleNext();
          }
        }}
        onBack={handleBack}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Add Custom Events
            </Typography>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Time"
                    placeholder="e.g. 8:30 PM"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Event"
                    placeholder="e.g. Cultural Dance"
                    value={newEvent.event}
                    onChange={(e) => setNewEvent({ ...newEvent, event: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Category"
                    placeholder="e.g. Reception"
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddCustomEvent}
                    disabled={!newEvent.time || !newEvent.event}
                    sx={{ height: '100%' }}
                  >
                    Add Event
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    placeholder="Add any details about this event"
                    value={newEvent.notes}
                    onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {timelineData.events.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Custom Events Added
              </Typography>
              <TimelineTable
                events={timelineData.events.filter(event => event.category === 'Custom')}
                onUpdateEvent={handleUpdateEvent}
                onDeleteEvent={handleDeleteEvent}
              />
            </Grid>
          )}
        </Grid>
      </WizardStep>
    );
  };

  // Function to render the review step
  const renderReviewStep = () => {
    return (
      <WizardStep
        title="Review & Export"
        description="Review your wedding day timeline and make any final adjustments."
        currentStep={8}
        totalSteps={totalSteps}
        onNext={handleNext}
        onBack={handleBack}
      >
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="h3">
              Wedding Day Timeline - {timelineData.weddingDate}
            </Typography>
            <Box>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<SaveIcon />}
                onClick={saveTimelineToDatabase}
                sx={{ mr: 1 }}
              >
                Save Timeline
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<DownloadIcon />} 
                onClick={handleExportPDF}
                sx={{ mr: 1 }}
              >
                Export PDF
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<ShareIcon />} 
                onClick={handleShareTimeline}
              >
                Share
              </Button>
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Tabs
              value={viewMode}
              onChange={(_, newValue) => setViewMode(newValue)}
              aria-label="timeline view mode"
              sx={{
                '& .MuiTab-root': {
                  '&:hover': {
                    backgroundColor: theme.palette.accent.rose,
                  },
                  color: theme.palette.primary.main,
                },
                '& .Mui-selected': {
                  color: `${theme.palette.primary.main} !important`,
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: theme.palette.primary.main,
                }
              }}
            >
              <Tab
                icon={<TimelineIcon />}
                label="Timeline View"
                value="timeline"
                id="timeline-tab"
                aria-controls="timeline-panel"
              />
              <Tab
                icon={<TableChartIcon />}
                label="Table View"
                value="table"
                id="table-tab"
                aria-controls="table-panel"
              />
            </Tabs>
          </Box>

          <Box role="tabpanel" hidden={viewMode !== 'timeline'} id="timeline-panel" aria-labelledby="timeline-tab">
            {viewMode === 'timeline' && (
              <Box sx={{ overflowX: 'auto', mb: 4 }} ref={timelineRef}>
                <ChronoTimeline 
                  events={timelineData.events} 
                  weddingDate={timelineData.weddingDate}
                />
              </Box>
            )}
          </Box>

          <Box role="tabpanel" hidden={viewMode !== 'table'} id="table-panel" aria-labelledby="table-tab">
            {viewMode === 'table' && (
              <TimelineTable
                events={timelineData.events}
                onUpdateEvent={handleUpdateEvent}
                onDeleteEvent={handleDeleteEvent}
              />
            )}
          </Box>
        </Box>
      </WizardStep>
    );
  };

  return (
    <ThemeWrapper>
    <Container maxWidth="lg" sx={brandStyles.container}>
      <BrandHeading variant="h3" sx={{ textAlign: 'center' }}>
        Wedding Day Timeline Creator
      </BrandHeading>
      <Typography 
        variant="subtitle1" 
        align="center" 
        sx={{ 
          mb: 4, 
          color: theme.palette.text.secondary,
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        Let's build your perfect wedding day timeline! Answer a few questions, and we'll handle the details.
      </Typography>

      {renderStep()}

      <Dialog
        open={shareDialogOpen}
        onClose={handleCloseShareDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 0,
            backgroundColor: theme.palette.background.paper,
          }
        }}
      >
        <DialogTitle sx={{ color: theme.palette.primary.main, fontFamily: "'Giaza', serif" }}>
          Share Your Timeline
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <BrandButton
                variant="primary"
                startIcon={<ContentCopyIcon />}
                onClick={handleCopyLink}
                sx={{ width: '100%' }}
              >
                Copy Link
              </BrandButton>
            </Grid>
            <Grid item xs={12}>
              <BrandButton
                variant="primary"
                startIcon={<EmailIcon />}
                onClick={handleEmailShare}
                sx={{ width: '100%' }}
              >
                Share via Email
              </BrandButton>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <BrandButton 
            variant="secondary"
            onClick={handleCloseShareDialog}
          >
            Cancel
          </BrandButton>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
    </ThemeWrapper>
  );
}
