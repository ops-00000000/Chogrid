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
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login';
import Lottie from 'react-lottie';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import securityAnimation from '../assets/animations/security-animation.json';

const LoginPaper = styled(Paper)(({ theme }) => ({
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
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  }
}));

const FormAvatar = styled(Avatar)(({ theme }) => ({
  margin: theme.spacing(1),
  backgroundColor: theme.palette.primary.main,
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

const LoginTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    borderRadius: '8px',
    transition: 'all 0.3s ease',
  },
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      borderWidth: '2px',
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.light,
    },
  }
}));

const lottieOptions = {
  loop: true,
  autoplay: true,
  animationData: securityAnimation,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice'
  }
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Ошибка при входе. Пожалуйста, проверьте ваши данные.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
                    background: `linear-gradient(120deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Добро пожаловать!
                </Typography>
                <Typography variant="h6" color="textSecondary" sx={{ mb: 4 }}>
                  Войдите в свой аккаунт, чтобы вернуться к своим таблицам и продолжить работу.
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
              <LoginPaper>
                <motion.div variants={itemVariants}>
                  <FormAvatar>
                    <LockOutlinedIcon />
                  </FormAvatar>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Typography component="h1" variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                    Вход в аккаунт
                  </Typography>
                </motion.div>
                
                {error && (
                  <motion.div variants={itemVariants}>
                    <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                      {error}
                    </Alert>
                  </motion.div>
                )}
                
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
                  <motion.div variants={itemVariants}>
                    <LoginTextField
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
                      autoFocus
                      sx={{ mb: 2 }}
                    />
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <LoginTextField
                      margin="normal"
                      required
                      fullWidth
                      name="password"
                      label="Пароль"
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      autoComplete="current-password"
                      variant="outlined"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      sx={{ mb: 1 }}
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
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <Link 
                      component={RouterLink} 
                      to="/forgot-password" 
                      variant="body2"
                      sx={{ 
                        float: 'right', 
                        mb: 3, 
                        color: theme.palette.primary.main,
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                        }
                      }}
                    >
                      Забыли пароль?
                    </Link>
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <SubmitButton
                      type="submit"
                      fullWidth
                      variant="contained"
                      color="primary"
                      size="large"
                      disabled={loading}
                      startIcon={<LoginIcon />}
                    >
                      {loading ? 'Вход...' : 'Войти'}
                    </SubmitButton>
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                      <Typography variant="body2" color="textSecondary">
                        Ещё нет аккаунта?{' '}
                        <Link 
                          component={RouterLink} 
                          to="/register" 
                          sx={{ 
                            color: theme.palette.secondary.main,
                            fontWeight: 500,
                            textDecoration: 'none',
                            '&:hover': {
                              textDecoration: 'underline',
                            }
                          }}
                        >
                          Зарегистрироваться
                        </Link>
                      </Typography>
                    </Box>
                  </motion.div>
                </Box>
              </LoginPaper>
            </motion.div>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Login; 