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
  CircularProgress
} from '@mui/material';
import { 
  Heart, 
  Calendar, 
  ArrowRight, 
  ArrowLeft,
  Users,
  Store,
  Eye,
  EyeOff,
  Check
} from 'lucide-react';

// Define the types of users
type UserType = 'couple' | 'planner' | 'vendor';

// Define the registration steps
type RegistrationStep = 
  | 'userType'
  | 'basicInfo'
  | 'weddingInfo'
  | 'accountInfo'
  | 'confirmation';

// Define the question sets for each user type
interface QuestionSet {
  basicInfo: Question[];
  weddingInfo: Question[];
  accountInfo: Question[];
}

// Define the question interface
interface Question {
  id: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'date' | 'select';
  options?: string[];
  required: boolean;
  placeholder?: string;
}

// Define the form data interface
interface FormData {
  [key: string]: string;
}

// Question sets for each user type
const questionSets: Record<UserType, QuestionSet> = {
  'couple': {
    basicInfo: [
      { id: 'firstName', label: 'What\'s your first name?', type: 'text', required: true, placeholder: 'Enter your first name' },
      { id: 'partnerName', label: 'What\'s your partner\'s name?', type: 'text', required: true, placeholder: 'Enter your partner\'s name' },
    ],
    weddingInfo: [
      { id: 'weddingDate', label: 'When is your wedding date?', type: 'date', required: true },
      { id: 'location', label: 'Where will your wedding take place?', type: 'text', required: false, placeholder: 'City, State or Country' },
    ],
    accountInfo: [
      { id: 'email', label: 'What\'s your email address?', type: 'email', required: true, placeholder: 'Enter your email' },
      { id: 'password', label: 'Create a password', type: 'password', required: true, placeholder: 'Choose a secure password' },
    ],
  },
  'planner': {
    basicInfo: [
      { id: 'firstName', label: 'What\'s your first name?', type: 'text', required: true, placeholder: 'Enter your first name' },
      { id: 'lastName', label: 'What\'s your last name?', type: 'text', required: true, placeholder: 'Enter your last name' },
      { id: 'companyName', label: 'What\'s your company name?', type: 'text', required: false, placeholder: 'Enter your company name' },
    ],
    weddingInfo: [
      { id: 'experience', label: 'How many years of experience do you have?', type: 'text', required: false, placeholder: 'Enter number of years' },
      { id: 'specialization', label: 'What\'s your specialization?', type: 'text', required: false, placeholder: 'E.g., Destination weddings, Luxury weddings' },
    ],
    accountInfo: [
      { id: 'email', label: 'What\'s your email address?', type: 'email', required: true, placeholder: 'Enter your email' },
      { id: 'password', label: 'Create a password', type: 'password', required: true, placeholder: 'Choose a secure password' },
    ],
  },
  'vendor': {
    basicInfo: [
      { id: 'companyName', label: 'What\'s your business name?', type: 'text', required: true, placeholder: 'Enter your business name' },
      { id: 'contactName', label: 'What\'s your name?', type: 'text', required: true, placeholder: 'Enter your full name' },
    ],
    weddingInfo: [
      { id: 'vendorType', label: 'What type of vendor are you?', type: 'text', required: true, placeholder: 'E.g., Photographer, Caterer, Venue' },
      { id: 'location', label: 'Where are you located?', type: 'text', required: true, placeholder: 'City, State or Country' },
    ],
    accountInfo: [
      { id: 'email', label: 'What\'s your business email?', type: 'email', required: true, placeholder: 'Enter your business email' },
      { id: 'password', label: 'Create a password', type: 'password', required: true, placeholder: 'Choose a secure password' },
    ],
  }
};

export const AuthForm: React.FC<{ redirectPath?: string }> = ({ redirectPath = '/' }) => {
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
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      
      // For demo purposes, just navigate to dashboard
      navigate(redirectPath);
    }, 1500);
  };
  
  // Handle login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      
      // For demo purposes, just navigate to dashboard
      navigate(redirectPath);
    }, 1500);
  };

  // Render login form
  const renderLoginForm = () => {
    return (
      <Fade in={isLogin} timeout={500}>
        <form onSubmit={handleLogin} className="w-full">
          <Box sx={{ mb: 4 }}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              required
              variant="outlined"
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 0,
                  '& fieldset': {
                    borderColor: '#B8BDD7',
                  },
                  '&:hover fieldset': {
                    borderColor: '#B8BDD7',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#FFE8E4',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#054697',
                  opacity: 0.8,
                },
                '& .MuiOutlinedInput-input': {
                  color: '#054697',
                },
              }}
            />
            
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: '#054697' }}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 0,
                  '& fieldset': {
                    borderColor: '#B8BDD7',
                  },
                  '&:hover fieldset': {
                    borderColor: '#B8BDD7',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#FFE8E4',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#054697',
                  opacity: 0.8,
                },
                '& .MuiOutlinedInput-input': {
                  color: '#054697',
                },
              }}
            />
          </Box>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{
              py: 1.5,
              backgroundColor: '#FFE8E4',
              color: '#054697',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              borderRadius: 0,
              border: '1px solid #FFE8E4',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#FFD5CC',
                boxShadow: 'none',
              },
            }}
          >
            {isLoading ? <CircularProgress size={24} sx={{ color: '#054697' }} /> : 'Log In'}
          </Button>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#054697', 
                opacity: 0.8,
                fontFamily: "'Poppins', sans-serif",
                cursor: 'pointer',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
              onClick={handleAuthModeToggle}
            >
              Don't have an account? Register
            </Typography>
          </Box>
        </form>
      </Fade>
    );
  };
  
  // Render user type selection
  const renderUserTypeSelection = () => {
    return (
      <Fade in={registrationStep === 'userType'} timeout={500}>
        <Box sx={{ width: '100%' }}>
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 4, 
              color: '#054697', 
              fontFamily: "'Giaza', serif",
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
                border: '1px solid #B8BDD7',
                borderRadius: 0,
                color: '#054697',
                textTransform: 'none',
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 400,
                fontSize: '1rem',
                transition: 'all 0.3s',
                '&:hover': {
                  backgroundColor: '#FFE8E4',
                  borderColor: '#FFE8E4',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Users className="w-6 h-6 mr-3" />
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Engaged Couple
                </Typography>
                <Typography variant="body2" sx={{ color: '#054697', opacity: 0.8 }}>
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
                border: '1px solid #B8BDD7',
                borderRadius: 0,
                color: '#054697',
                textTransform: 'none',
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 400,
                fontSize: '1rem',
                transition: 'all 0.3s',
                '&:hover': {
                  backgroundColor: '#FFE8E4',
                  borderColor: '#FFE8E4',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Calendar className="w-6 h-6 mr-3" />
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Wedding Planner
                </Typography>
                <Typography variant="body2" sx={{ color: '#054697', opacity: 0.8 }}>
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
                border: '1px solid #B8BDD7',
                borderRadius: 0,
                color: '#054697',
                textTransform: 'none',
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 400,
                fontSize: '1rem',
                transition: 'all 0.3s',
                '&:hover': {
                  backgroundColor: '#FFE8E4',
                  borderColor: '#FFE8E4',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Store className="w-6 h-6 mr-3" />
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Wedding Vendor
                </Typography>
                <Typography variant="body2" sx={{ color: '#054697', opacity: 0.8 }}>
                  Provide services for weddings
                </Typography>
              </Box>
            </Button>
          </Box>
          
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#054697', 
                opacity: 0.8,
                fontFamily: "'Poppins', sans-serif",
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
      <Fade in={true} timeout={500}>
        <Box sx={{ width: '100%' }}>
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 1, 
              color: '#054697', 
              fontFamily: "'Giaza', serif",
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
                '& .MuiOutlinedInput-root': {
                  borderRadius: 0,
                  '& fieldset': {
                    borderColor: '#B8BDD7',
                  },
                  '&:hover fieldset': {
                    borderColor: '#B8BDD7',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#FFE8E4',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#054697',
                  opacity: 0.8,
                },
                '& .MuiOutlinedInput-input': {
                  color: '#054697',
                  fontSize: '1.1rem',
                  padding: '16px',
                },
              }}
              InputProps={{
                endAdornment: question.type === 'password' ? (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: '#054697' }}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                color: '#054697',
                borderRadius: 0,
                border: '1px solid #FFE8E4',
                textTransform: 'uppercase',
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 500,
                px: 3,
                '&:hover': {
                  backgroundColor: '#FFE8E4',
                },
              }}
              startIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
            
            <Button
              onClick={handleNext}
              sx={{
                backgroundColor: '#FFE8E4',
                color: '#054697',
                borderRadius: 0,
                textTransform: 'uppercase',
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 500,
                px: 3,
                '&:hover': {
                  backgroundColor: '#FFD5CC',
                },
              }}
              endIcon={<ArrowRight className="w-4 h-4" />}
            >
              Next
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            {['userType', 'basicInfo', 'weddingInfo', 'accountInfo'].map((step) => (
              <Box
                key={step}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: 
                    registrationStep === step 
                      ? '#FFE8E4' 
                      : registrationStep === 'confirmation' || 
                        (registrationStep === 'accountInfo' && step === 'weddingInfo') ||
                        (registrationStep === 'weddingInfo' && step === 'basicInfo') ||
                        (registrationStep === 'weddingInfo' && step === 'userType') ||
                        (registrationStep === 'accountInfo' && step === 'basicInfo') ||
                        (registrationStep === 'accountInfo' && step === 'userType')
                        ? '#FFE8E4' 
                        : '#B8BDD7',
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
  
  // Render confirmation step
  const renderConfirmation = () => {
    return (
      <Fade in={registrationStep === 'confirmation'} timeout={500}>
        <Box sx={{ width: '100%', textAlign: 'center' }}>
          <Box 
            sx={{ 
              width: 80, 
              height: 80, 
              borderRadius: '50%', 
              backgroundColor: '#FFE8E4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px auto',
            }}
          >
            <Check className="w-10 h-10 text-[#054697]" />
          </Box>
          
          <Typography 
            variant="h4" 
            sx={{ 
              mb: 2, 
              color: '#054697', 
              fontFamily: "'Giaza', serif",
            }}
          >
            Almost there!
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 4, 
              color: '#054697', 
              opacity: 0.8,
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Please review your information and create your account.
          </Typography>
          
          <Box sx={{ mb: 4, textAlign: 'left' }}>
            {Object.entries(formData).map(([key, value]) => (
              <Box key={key} sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#054697', 
                    opacity: 0.7,
                    fontFamily: "'Poppins', sans-serif",
                    textTransform: 'capitalize',
                  }}
                >
                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#054697',
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 500,
                  }}
                >
                  {key === 'password' ? '••••••••' : value}
                </Typography>
              </Box>
            ))}
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              onClick={handlePrevious}
              sx={{
                color: '#054697',
                borderRadius: 0,
                border: '1px solid #FFE8E4',
                textTransform: 'uppercase',
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 500,
                px: 3,
                '&:hover': {
                  backgroundColor: '#FFE8E4',
                },
              }}
              startIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
            
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              sx={{
                backgroundColor: '#FFE8E4',
                color: '#054697',
                borderRadius: 0,
                textTransform: 'uppercase',
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 500,
                px: 3,
                '&:hover': {
                  backgroundColor: '#FFD5CC',
                },
              }}
            >
              {isLoading ? <CircularProgress size={24} sx={{ color: '#054697' }} /> : 'Create Account'}
            </Button>
          </Box>
        </Box>
      </Fade>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F9F9FF] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Decorative elements */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#FFE8E4]/20 blur-3xl"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#B8BDD7]/10 blur-3xl"></div>
      
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 6, 
            borderRadius: 0,
            border: '1px solid #B8BDD7',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Heart className="w-10 h-10 text-[#FFE8E4]" />
            </Box>
            
            <Typography 
              component="h1" 
              variant="h4" 
              sx={{ 
                fontFamily: "'Giaza', serif",
                color: '#054697',
                mb: 1,
              }}
            >
              {isLogin ? 'Welcome Back' : 'Join Altare'}
            </Typography>
            
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#054697', 
                opacity: 0.8,
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              {isLogin 
                ? 'Log in to access your wedding planning tools' 
                : 'Create an account to start planning your perfect day'}
            </Typography>
          </Box>
          
          {isLogin ? (
            renderLoginForm()
          ) : (
            <>
              {registrationStep === 'userType' && renderUserTypeSelection()}
              {(registrationStep === 'basicInfo' || registrationStep === 'weddingInfo' || registrationStep === 'accountInfo') && renderQuestionForm()}
              {registrationStep === 'confirmation' && renderConfirmation()}
            </>
          )}
        </Paper>
      </Container>
    </div>
  );
};

export default AuthForm;
