import React, { useState, useContext } from 'react';
import { 
  Avatar, 
  Button, 
  TextField, 
  Link, 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Grid, 
  InputAdornment,
  IconButton, 
  Alert,
  Stepper,
  Step,
  StepLabel,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import EmailIcon from '@mui/icons-material/Email';
import Lottie from 'react-lottie';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import registrationAnimation from '../assets/animations/registration-animation.json';

const RegisterPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  borderRadius: '12px',
  boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
  }
}));

const FormAvatar = styled(Avatar)(({ theme }) => ({
  margin: theme.spacing(1),
  backgroundColor: theme.palette.secondary.main,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  width: theme.spacing(7),
  height: theme.spacing(7),
  '& .MuiSvgIcon-root': {
    fontSize: '1.8rem'
  }
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2),
  padding: theme.spacing(1.2),
  borderRadius: '8px',
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '1rem',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 6px 15px rgba(0, 0, 0, 0.2)',
    transform: 'translateY(-2px)'
  }
}));

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  padding: theme.spacing(1, 2),
  borderRadius: '8px',
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '0.9rem',
  transition: 'all 0.3s ease',
}));

const RegisterTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    borderRadius: '8px',
    transition: 'all 0.3s ease',
  },
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.secondary.main,
      borderWidth: '2px',
    },
    '&:hover fieldset': {
      borderColor: theme.palette.secondary.light,
    },
  }
}));

const CustomStepper = styled(Stepper)(({ theme }) => ({
  width: '100%',
  marginBottom: theme.spacing(4),
  '& .MuiStepIcon-root': {
    color: theme.palette.grey[300],
    '&.Mui-active': {
      color: theme.palette.secondary.main,
    },
    '&.Mui-completed': {
      color: theme.palette.secondary.main,
    }
  }
}));

const lottieOptions = {
  loop: true,
  autoplay: true,
  animationData: registrationAnimation,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice'
  }
};

const steps = ['Личные данные', 'Учетные данные'];

const Register = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();

  const handleNext = () => {
    if (activeStep === 0) {
      if (!name.trim()) {
        setError('Пожалуйста, введите ваше имя');
        return;
      }
      if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
        setError('Пожалуйста, введите корректный email');
        return;
      }
      setError('');
      setActiveStep(1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    setActiveStep(0);
    setError('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async () => {
    setError('');
    
    if (password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    
    setLoading(true);

    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Ошибка при регистрации. Пожалуйста, попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <Container component="main" maxWidth="lg">
      <Box sx={{ 
        mt: 8, 
        mb: 8, 
        minHeight: 'calc(100vh - 300px)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center'
      }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Box sx={{ textAlign: { xs: 'center', md: 'left' }, mb: { xs: 4, md: 0 } }}>
                <Typography 
                  component="h1" 
                  variant="h3" 
                  sx={{ 
                    mb: 2,
                    fontWeight: 700,
                    background: `linear-gradient(120deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Создайте аккаунт
                </Typography>
                <Typography variant="h6" color="textSecondary" sx={{ mb: 4 }}>
                  Присоединяйтесь к Chogrid чтобы получить доступ к инструментам для принятия решений
                </Typography>
                <Box sx={{ height: 300, display: { xs: 'none', md: 'block' } }}>
                  <Lottie options={lottieOptions} height={300} />
                </Box>
              </Box>
            </motion.div>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <RegisterPaper>
                <motion.div variants={itemVariants}>
                  <FormAvatar>
                    <PersonAddIcon />
                  </FormAvatar>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Typography component="h1" variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                    Регистрация
                  </Typography>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <CustomStepper activeStep={activeStep} alternativeLabel>
                    {steps.map((label) => (
                      <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                      </Step>
                    ))}
                  </CustomStepper>
                </motion.div>
                
                {error && (
                  <motion.div variants={itemVariants}>
                    <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                      {error}
                    </Alert>
                  </motion.div>
                )}
                
                <Box sx={{ width: '100%' }}>
                  {activeStep === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <RegisterTextField
                        margin="normal"
                        required
                        fullWidth
                        id="name"
                        label="Ваше имя"
                        name="name"
                        autoComplete="name"
                        variant="outlined"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={loading}
                        autoFocus
                        sx={{ mb: 2 }}
                      />
                      
                      <RegisterTextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email адрес"
                        name="email"
                        autoComplete="email"
                        variant="outlined"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <RegisterTextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Пароль"
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        autoComplete="new-password"
                        variant="outlined"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        autoFocus
                        sx={{ mb: 2 }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={togglePasswordVisibility}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      
                      <RegisterTextField
                        margin="normal"
                        required
                        fullWidth
                        name="confirmPassword"
                        label="Подтвердите пароль"
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        autoComplete="new-password"
                        variant="outlined"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle confirm password visibility"
                                onClick={toggleConfirmPasswordVisibility}
                                edge="end"
                              >
                                {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </motion.div>
                  )}
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    <StyledButton
                      disabled={activeStep === 0 || loading}
                      onClick={handleBack}
                      variant="outlined"
                      color="inherit"
                    >
                      Назад
                    </StyledButton>
                    
                    <StyledButton
                      variant="contained"
                      color={activeStep === steps.length - 1 ? 'secondary' : 'primary'}
                      onClick={handleNext}
                      disabled={loading}
                      endIcon={activeStep === steps.length - 1 ? <HowToRegIcon /> : null}
                    >
                      {loading 
                        ? 'Загрузка...' 
                        : activeStep === steps.length - 1 
                          ? 'Зарегистрироваться' 
                          : 'Далее'
                      }
                    </StyledButton>
                  </Box>
                  
                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      Уже есть аккаунт?{' '}
                      <Link 
                        component={RouterLink} 
                        to="/login" 
                        sx={{ 
                          color: theme.palette.primary.main,
                          fontWeight: 500,
                          textDecoration: 'none',
                          '&:hover': {
                            textDecoration: 'underline',
                          }
                        }}
                      >
                        Войти
                      </Link>
                    </Typography>
                  </Box>
                </Box>
              </RegisterPaper>
            </motion.div>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Register; 