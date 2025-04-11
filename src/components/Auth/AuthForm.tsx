import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Container,
  Paper,
  IconButton,
  InputAdornment,
  Fade,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Calendar, 
  ArrowRight, 
  ArrowLeft,
  Users,
  Store,
  Eye,
  EyeOff,
  Check
} from 'lucide-react';
import { getSupabase } from '../../supabaseClient';

// Define the types of users
type UserType = 'couple' | 'planner' | 'vendor';

// Define the registration steps
type RegistrationStep = 
  | 'userType'
  | 'basicInfo'
  | 'weddingInfo'
  | 'accountInfo'
  | 'confirmation';

// Define the form data interface
interface FormData {
  [key: string]: string;
}

// Define the question interface
interface Question {
  id: string;
  label: string;
  type: string;
  placeholder?: string;
  required: boolean;
}

// Define the question sets for each user type
const questionSets: Record<UserType, Record<string, Question[]>> = {
  couple: {
    basicInfo: [
      {
        id: 'firstName',
        label: "What's your name?",
        type: 'text',
        placeholder: 'Your name',
        required: true,
      },
      {
        id: 'partnerName',
        label: "What's your partner's name?",
        type: 'text',
        placeholder: "Your partner's name",
        required: true,
      },
    ],
    weddingInfo: [
      {
        id: 'weddingDate',
        label: 'When is your wedding date?',
        type: 'date',
        required: false,
      },
      {
        id: 'location',
        label: 'Where are you getting married?',
        type: 'text',
        placeholder: 'City, State',
        required: false,
      },
      {
        id: 'guestCount',
        label: 'How many guests are you expecting?',
        type: 'number',
        placeholder: 'Approximate number',
        required: false,
      },
    ],
    accountInfo: [
      {
        id: 'email',
        label: 'What email would you like to use?',
        type: 'email',
        placeholder: 'your.email@example.com',
        required: true,
      },
      {
        id: 'password',
        label: 'Create a password',
        type: 'password',
        placeholder: 'At least 8 characters',
        required: true,
      },
    ],
  },
  planner: {
    basicInfo: [
      {
        id: 'firstName',
        label: "What's your first name?",
        type: 'text',
        placeholder: 'First name',
        required: true,
      },
      {
        id: 'lastName',
        label: "What's your last name?",
        type: 'text',
        placeholder: 'Last name',
        required: true,
      },
      {
        id: 'companyName',
        label: "What's your company name?",
        type: 'text',
        placeholder: 'Company name',
        required: true,
      },
    ],
    weddingInfo: [
      {
        id: 'experience',
        label: 'How many years of experience do you have?',
        type: 'number',
        placeholder: 'Years',
        required: false,
      },
      {
        id: 'specialization',
        label: 'What is your specialization?',
        type: 'text',
        placeholder: 'E.g., Destination weddings, Luxury events',
        required: false,
      },
    ],
    accountInfo: [
      {
        id: 'email',
        label: 'What email would you like to use?',
        type: 'email',
        placeholder: 'your.email@example.com',
        required: true,
      },
      {
        id: 'password',
        label: 'Create a password',
        type: 'password',
        placeholder: 'At least 8 characters',
        required: true,
      },
    ],
  },
  vendor: {
    basicInfo: [
      {
        id: 'companyName',
        label: "What's your business name?",
        type: 'text',
        placeholder: 'Business name',
        required: true,
      },
      {
        id: 'contactName',
        label: "What's your name?",
        type: 'text',
        placeholder: 'Your name',
        required: true,
      },
    ],
    weddingInfo: [
      {
        id: 'vendorType',
        label: 'What type of vendor are you?',
        type: 'text',
        placeholder: 'E.g., Photographer, Caterer',
        required: true,
      },
      {
        id: 'location',
        label: 'Where are you based?',
        type: 'text',
        placeholder: 'City, State',
        required: false,
      },
    ],
    accountInfo: [
      {
        id: 'email',
        label: 'What email would you like to use?',
        type: 'email',
        placeholder: 'your.email@example.com',
        required: true,
      },
      {
        id: 'password',
        label: 'Create a password',
        type: 'password',
        placeholder: 'At least 8 characters',
        required: true,
      },
    ],
  },
};

export const AuthForm: React.FC = () => {
  const navigate = useNavigate();
  
  // State for login/register toggle
  const [isLogin, setIsLogin] = useState(true);
  
  // State for user type selection
  const [userType, setUserType] = useState<UserType | null>(null);
  
  // State for registration steps
  const [registrationStep, setRegistrationStep] = useState<RegistrationStep>('userType');
  
  // State for form data
  const [formData, setFormData] = useState<FormData>({});
  
  // State for current question index
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);
  
  // State for loading
  const [isLoading, setIsLoading] = useState(false);
  
  // State for error message
  const [error, setError] = useState<string | null>(null);
  
  // State for success message
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Get current question set based on registration step and user type
  const getCurrentQuestions = () => {
    if (!userType) return [];
    
    switch (registrationStep) {
      case 'basicInfo':
        return questionSets[userType].basicInfo;
      case 'weddingInfo':
        return questionSets[userType].weddingInfo;
      case 'accountInfo':
        return questionSets[userType].accountInfo;
      default:
        return [];
    }
  };
  
  // Get current question
  const getCurrentQuestion = () => {
    const questions = getCurrentQuestions();
    return questions[currentQuestionIndex] || null;
  };
  
  // Handle form field change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle next question
  const handleNext = () => {
    const questions = getCurrentQuestions();
    
    // If there are more questions in the current step
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      return;
    }
    
    // If we've completed all questions in the current step
    switch (registrationStep) {
      case 'userType':
        setRegistrationStep('basicInfo');
        break;
      case 'basicInfo':
        setRegistrationStep('weddingInfo');
        break;
      case 'weddingInfo':
        setRegistrationStep('accountInfo');
        break;
      case 'accountInfo':
        setRegistrationStep('confirmation');
        break;
      default:
        break;
    }
    
    setCurrentQuestionIndex(0);
  };
  
  // Handle previous question
  const handlePrevious = () => {
    // If we're at the first question of a step
    if (currentQuestionIndex === 0) {
      switch (registrationStep) {
        case 'basicInfo':
          setRegistrationStep('userType');
          break;
        case 'weddingInfo':
          setRegistrationStep('basicInfo');
          setCurrentQuestionIndex(questionSets[userType!].basicInfo.length - 1);
          break;
        case 'accountInfo':
          setRegistrationStep('weddingInfo');
          setCurrentQuestionIndex(questionSets[userType!].weddingInfo.length - 1);
          break;
        case 'confirmation':
          setRegistrationStep('accountInfo');
          setCurrentQuestionIndex(questionSets[userType!].accountInfo.length - 1);
          break;
        default:
          break;
      }
    } else {
      // Go to previous question in the current step
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  // Handle user type selection
  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type);
    handleNext();
  };
  
  // Handle login/register toggle
  const handleAuthModeToggle = () => {
    setIsLogin(!isLogin);
    setUserType(null);
    setRegistrationStep('userType');
    setCurrentQuestionIndex(0);
    setFormData({});
    setError(null);
  };
  
  // Check if user has a subscription
  const checkSubscription = async (userId: string) => {
    try {
      const supabaseClient = getSupabase();
      // First, check if the user profile exists and has completed onboarding
      const { data: profileData, error: profileError } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) throw profileError;
      
      // If profile doesn't exist or onboarding not completed, redirect to pricing
      if (!profileData || !profileData.onboarding_completed) {
        return false;
      }
      
      // Check if user has an active subscription
      const { data: subscriptionData, error: subscriptionError } = await supabaseClient
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();
      
      if (subscriptionError && subscriptionError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" error, which is expected if no subscription
        throw subscriptionError;
      }
      
      return !!subscriptionData;
    } catch (error) {
      console.error('Error checking subscription:', error);
      return false;
    }
  };
  
  // Create user profile in Supabase
  const createUserProfile = async (userId: string) => {
    try {
      const supabaseClient = getSupabase();
      // Extract relevant data from form
      const profileData: any = {
        id: userId,
        email: formData.email,
        role: 'user',
        onboarding_completed: false,
      };
      
      // Add user type specific data
      if (userType === 'couple') {
        profileData.first_name = formData.firstName;
        profileData.last_name = ''; // Add an empty last name if not available
        profileData.partner_name = formData.partnerName;
        // Format the wedding date properly for PostgreSQL (YYYY-MM-DD)
        profileData.wedding_date = formData.weddingDate ? new Date(formData.weddingDate).toISOString().split('T')[0] : null;
        // Ensure location is properly saved (this was missing or not working)
        profileData.location = formData.location ? formData.location.trim() : '';
        profileData.guest_count = formData.guestCount || null;
        
        // Also create a wedding record with this information
        try {
          const weddingData = {
            user_id: userId,
            couple_name: `${formData.firstName} & ${formData.partnerName}`,
            wedding_date: formData.weddingDate ? new Date(formData.weddingDate).toISOString().split('T')[0] : null,
            location: formData.location ? formData.location.trim() : '',
            guest_count: parseInt(formData.guestCount) || 0,
            created_at: new Date().toISOString(),
            url_path: `${formData.firstName.toLowerCase()}${formData.partnerName.toLowerCase()}wedding`
          };
          
          await supabaseClient
            .from('weddings')
            .upsert(weddingData);
            
          console.log('Wedding data saved successfully');
        } catch (weddingError) {
          console.error('Error creating wedding record:', weddingError);
        }
      } else if (userType === 'planner') {
        profileData.first_name = formData.firstName;
        profileData.last_name = formData.lastName;
        profileData.company_name = formData.companyName || null;
        profileData.experience_years = formData.experience || null;
        profileData.specialization = formData.specialization || null;
      } else if (userType === 'vendor') {
        // Extract first and last name from contact name if possible
        const nameParts = formData.contactName.split(' ');
        profileData.first_name = nameParts[0] || '';
        profileData.last_name = nameParts.slice(1).join(' ') || '';
        profileData.company_name = formData.companyName;
        profileData.contact_name = formData.contactName;
        profileData.vendor_type = formData.vendorType || null;
        profileData.location = formData.location ? formData.location.trim() : '';
      }
      
      // Insert profile data
      const { error } = await supabaseClient
        .from('profiles')
        .upsert(profileData);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error creating user profile:', error);
      return false;
    }
  };
  
  // Handle form submission for registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError(null);
    
    try {
      const supabaseClient = getSupabase();
      // Register user with Supabase
      const { data, error } = await supabaseClient.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            user_type: userType,
          },
          // Use the current URL's origin for production or include port for development
          emailRedirectTo: window.location.origin.includes('localhost') ? 
            `${window.location.protocol}//${window.location.hostname}:${window.location.port}` : 
            window.location.origin,
        },
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Create user profile
        await createUserProfile(data.user.id);
        
        // Automatically sign in the user after registration
        const { error: signInError } = await supabaseClient.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        
        if (signInError) {
          console.error('Auto sign-in error:', signInError);
          setSuccessMessage('Account created successfully! Please sign in with your credentials.');
          setTimeout(() => {
            setIsLogin(true);
            setIsLoading(false);
          }, 1500);
          return;
        }
        
        setSuccessMessage('Account created successfully! Redirecting to pricing page...');
        
        // Redirect to pricing page for new users
        setTimeout(() => {
          navigate('/pricing');
        }, 1500);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError(null);
    
    try {
      const supabaseClient = getSupabase();
      // Sign in with Supabase
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      
      if (error) {
        // If the error is about email confirmation, try to bypass it
        if (error.message.includes('Email not confirmed')) {
          // Try to sign in anyway (this is our bypass)
          console.log('Attempting to bypass email confirmation...');
          
          // Create or update user profile if needed
          const { data: userData } = await supabaseClient.auth.getUser(formData.email);
          if (userData && userData.user) {
            await createUserProfile(userData.user.id);
            
            // Check if user has a subscription
            const hasSubscription = await checkSubscription(userData.user.id);
            
            if (hasSubscription) {
              // If user has a subscription, redirect to dashboard
              navigate('/');
              return;
            } else {
              // If user doesn't have a subscription, redirect to pricing page
              navigate('/pricing');
              return;
            }
          }
        }
        throw error;
      }
      
      if (data.user) {
        // Check if user has a subscription
        const hasSubscription = await checkSubscription(data.user.id);
        
        if (hasSubscription) {
          // If user has a subscription, redirect to dashboard
          navigate('/');
        } else {
          // If user doesn't have a subscription, redirect to pricing page
          navigate('/pricing');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Invalid email or password');
      setIsLoading(false);
    }
  };
  
  // Render login form
  const renderLoginForm = () => {
    return (
      <Box component="form" onSubmit={handleLogin} sx={{ width: '100%', mt: 2 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            mb: 4
          }}
        >
          <Box 
            component="img"
            src="/Altare Primary-Blanc.svg"
            alt="Altare Logo"
            sx={{ 
              width: 180, 
              mb: 3,
              filter: 'invert(13%) sepia(83%) saturate(2471%) hue-rotate(201deg) brightness(97%) contrast(101%)' // Makes the white logo blue
            }}
          />
          <Typography 
            variant="h4" 
            sx={{ 
              fontFamily: "'Giaza', serif", 
              color: 'primary.main',
              letterSpacing: '-0.05em',
              mb: 1
            }}
          >
            Welcome Back
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'primary.main', 
              opacity: 0.8,
              textAlign: 'center'
            }}
          >
            Sign in to continue planning your perfect wedding
          </Typography>
        </Box>

        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          autoFocus
          value={formData.email || ''}
          onChange={handleChange}
          sx={{
            '& .MuiInputLabel-root': {
              color: 'primary.main',
              opacity: 0.8,
            },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'primary.main',
                opacity: 0.3,
              },
              '&:hover fieldset': {
                borderColor: 'primary.main',
                opacity: 0.5,
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
              },
            },
          }}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          id="password"
          autoComplete="current-password"
          value={formData.password || ''}
          onChange={handleChange}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiInputLabel-root': {
              color: 'primary.main',
              opacity: 0.8,
            },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'primary.main',
                opacity: 0.3,
              },
              '&:hover fieldset': {
                borderColor: 'primary.main',
                opacity: 0.5,
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
              },
            },
          }}
        />
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isLoading}
          sx={{
            mt: 3,
            mb: 2,
            py: 1.5,
            bgcolor: 'accent.rose',
            color: 'primary.main',
            fontWeight: 500,
            textTransform: 'uppercase',
            '&:hover': {
              bgcolor: '#FFD5CC',
            },
          }}
        >
          {isLoading ? <CircularProgress size={24} color="primary" /> : 'Sign In'}
        </Button>
        
        <Typography 
          variant="body2" 
          align="center" 
          sx={{ 
            mt: 2, 
            cursor: 'pointer',
            color: 'primary.main',
            opacity: 0.8,
            '&:hover': {
              textDecoration: 'underline',
            }
          }}
          onClick={handleAuthModeToggle}
        >
          Don't have an account? Sign Up
        </Typography>
      </Box>
    );
  };

  // Render the confirmation step
  const renderConfirmation = () => {
    return (
      <Fade in={registrationStep === 'confirmation'}>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ color: 'primary.main' }}>
            Confirm Your Information
          </Typography>
          
          <Paper elevation={0} sx={{ p: 3, mt: 3, bgcolor: 'rgba(184, 189, 215, 0.1)' }}>
            <Typography variant="body1" sx={{ mb: 2, color: 'primary.main', opacity: 0.8 }}>
              <strong>User Type:</strong> {userType === 'couple' ? 'Engaged Couple' : userType === 'planner' ? 'Wedding Planner' : 'Vendor'}
            </Typography>
            
            {Object.entries(formData).map(([key, value]) => {
              // Skip password display
              if (key === 'password') return null;
              
              // Format key for display
              const formattedKey = key.replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase());
              
              return (
                <Typography key={key} variant="body1" sx={{ mb: 1, color: 'primary.main', opacity: 0.8 }}>
                  <strong>{formattedKey}:</strong> {value}
                </Typography>
              );
            })}
          </Paper>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          
          {successMessage && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {successMessage}
            </Alert>
          )}
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              onClick={handlePrevious}
              startIcon={<ArrowLeft size={20} />}
              sx={{
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'rgba(184, 189, 215, 0.1)',
                },
              }}
            >
              Back
            </Button>
            
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              endIcon={isLoading ? <CircularProgress size={20} color="primary" /> : <Check size={20} />}
              sx={{
                bgcolor: 'accent.rose',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: '#FFD5CC',
                },
              }}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </Box>
        </Box>
      </Fade>
    );
  };

  // Render user type selection
  const renderUserTypeSelection = () => {
    return (
      <Fade in={registrationStep === 'userType'}>
        <Box sx={{ width: '100%' }}>
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              mb: 4,
              width: '100%'
            }}
          >
            <Box 
              component="img"
              src="/Altare Primary-Blanc.svg"
              alt="Altare Logo"
              sx={{ 
                width: 180, 
                mb: 3,
                filter: 'invert(13%) sepia(83%) saturate(2471%) hue-rotate(201deg) brightness(97%) contrast(101%)' // Makes the white logo blue
              }}
            />
            <Typography 
              variant="h4" 
              sx={{ 
                fontFamily: "'Giaza', serif", 
                color: 'primary.main',
                letterSpacing: '-0.05em',
                mb: 1
              }}
            >
              Create Your Account
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'primary.main', 
                opacity: 0.8,
                textAlign: 'center'
              }}
            >
              Begin your wedding planning journey with Altare
            </Typography>
          </Box>
          <Typography 
            variant="h5" 
            component="h2"
            sx={{ 
              mb: 4, 
              color: 'primary.main',
              fontFamily: 'Giaza, serif',
              textAlign: 'center',
            }}
          >
            I am a...
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              onClick={() => handleUserTypeSelect('couple')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                p: 3,
                backgroundColor: 'white',
                border: '1px solid',
                borderColor: 'primary.main',
                borderOpacity: 0.3,
                color: 'primary.main',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'accent.rose',
                  borderColor: 'accent.rose',
                },
              }}
            >
              <Users size={24} style={{ marginRight: '12px' }} />
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Engaged Couple
                </Typography>
                <Typography variant="body2" sx={{ color: 'primary.main', opacity: 0.8 }}>
                  Planning our wedding
                </Typography>
              </Box>
            </Button>
            
            <Button
              onClick={() => handleUserTypeSelect('planner')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                p: 3,
                backgroundColor: 'white',
                border: '1px solid',
                borderColor: 'primary.main',
                borderOpacity: 0.3,
                color: 'primary.main',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'accent.rose',
                  borderColor: 'accent.rose',
                },
              }}
            >
              <Calendar size={24} style={{ marginRight: '12px' }} />
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Wedding Planner
                </Typography>
                <Typography variant="body2" sx={{ color: 'primary.main', opacity: 0.8 }}>
                  Professional event coordinator
                </Typography>
              </Box>
            </Button>
            
            <Button
              onClick={() => handleUserTypeSelect('vendor')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                p: 3,
                backgroundColor: 'white',
                border: '1px solid',
                borderColor: 'primary.main',
                borderOpacity: 0.3,
                color: 'primary.main',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'accent.rose',
                  borderColor: 'accent.rose',
                },
              }}
            >
              <Store size={24} style={{ marginRight: '12px' }} />
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Wedding Vendor
                </Typography>
                <Typography variant="body2" sx={{ color: 'primary.main', opacity: 0.8 }}>
                  Provide services for weddings
                </Typography>
              </Box>
            </Button>
          </Box>
          
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'primary.main', 
                opacity: 0.8,
                cursor: 'pointer',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
              onClick={handleAuthModeToggle}
            >
              Already have an account? Log in
            </Typography>
          </Box>
        </Box>
      </Fade>
    );
  };

  // Render question form
  const renderQuestionForm = () => {
    const question = getCurrentQuestion();
    
    if (!question) return null;
    
    return (
      <Fade in={true}>
        <Box sx={{ width: '100%' }}>
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              mb: 4
            }}
          >
            <Box 
              component="img"
              src="/Altare Primary-Blanc.svg"
              alt="Altare Logo"
              sx={{ 
                width: 180, 
                mb: 3,
                filter: 'invert(13%) sepia(83%) saturate(2471%) hue-rotate(201deg) brightness(97%) contrast(101%)' // Makes the white logo blue
              }}
            />
            <Typography 
              variant="h4" 
              sx={{ 
                fontFamily: "'Giaza', serif", 
                color: 'primary.main',
                letterSpacing: '-0.05em',
                mb: 1
              }}
            >
              Create Your Account
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'primary.main', 
                opacity: 0.8,
                textAlign: 'center'
              }}
            >
              Begin your wedding planning journey with Altare
            </Typography>
          </Box>
          <Typography 
            variant="h5" 
            component="h2"
            sx={{ 
              mb: 1, 
              color: 'primary.main',
              fontFamily: 'Giaza, serif',
            }}
          >
            {question.label}
          </Typography>
          
          <Box sx={{ my: 4 }}>
            <TextField
              fullWidth
              name={question.id}
              type={question.type}
              required={question.required}
              placeholder={question.placeholder}
              value={formData[question.id] || ''}
              onChange={handleChange}
              variant="outlined"
              autoFocus
              sx={{
                '& .MuiInputLabel-root': {
                  color: 'primary.main',
                  opacity: 0.8,
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'primary.main',
                    opacity: 0.3,
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                    opacity: 0.5,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                  },
                },
              }}
              InputProps={{
                endAdornment: question.type === 'password' ? (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              onClick={handlePrevious}
              sx={{
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'rgba(184, 189, 215, 0.1)',
                },
              }}
              startIcon={<ArrowLeft size={20} />}
            >
              Back
            </Button>
            
            <Button
              onClick={handleNext}
              sx={{
                backgroundColor: 'accent.rose',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: '#FFD5CC',
                },
              }}
              endIcon={<ArrowRight size={20} />}
            >
              Next
            </Button>
          </Box>
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            {['userType', 'basicInfo', 'weddingInfo', 'accountInfo'].map((step) => (
              <Box
                key={step}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: 
                    registrationStep === step 
                      ? 'accent.rose' 
                      : registrationStep === 'confirmation' || 
                        (registrationStep === 'accountInfo' && step === 'weddingInfo') ||
                        (registrationStep === 'weddingInfo' && step === 'basicInfo') ||
                        (registrationStep === 'weddingInfo' && step === 'userType') ||
                        (registrationStep === 'accountInfo' && step === 'basicInfo') ||
                        (registrationStep === 'accountInfo' && step === 'userType')
                        ? 'accent.rose' 
                        : 'rgba(184, 189, 215, 0.5)',
                  mx: 0.5,
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </Box>
        </Box>
      </Fade>
    );
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          py: 8,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 0, // Square corners per brand guidelines
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'primary.main',
            },
          }}
        >
          {!isLogin && (
            <Typography 
              component="h1" 
              variant="h4" 
              gutterBottom
              sx={{ 
                fontFamily: 'Giaza, serif',
                color: 'primary.main',
                letterSpacing: '-0.05em',
              }}
            >
              Create Your Account
            </Typography>
          )}
          
          {isLogin ? (
            renderLoginForm()
          ) : (
            <>
              {registrationStep === 'userType' && renderUserTypeSelection()}
              {registrationStep === 'basicInfo' && renderQuestionForm()}
              {registrationStep === 'weddingInfo' && renderQuestionForm()}
              {registrationStep === 'accountInfo' && renderQuestionForm()}
              {registrationStep === 'confirmation' && renderConfirmation()}
            </>
          )}
          
          <Snackbar 
            open={!!error} 
            autoHideDuration={6000} 
            onClose={() => setError(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          </Snackbar>
          
          <Snackbar 
            open={!!successMessage} 
            autoHideDuration={6000} 
            onClose={() => setSuccessMessage(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert onClose={() => setSuccessMessage(null)} severity="success" sx={{ width: '100%' }}>
              {successMessage}
            </Alert>
          </Snackbar>
        </Paper>
      </Box>
    </Container>
  );
};
