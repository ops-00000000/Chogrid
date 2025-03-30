import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Avatar,
  Divider,
  CircularProgress,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const ProfileContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: '16px',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  backgroundColor: theme.palette.primary.main,
  fontSize: '2.5rem',
  marginBottom: theme.spacing(2),
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  position: 'relative',
  display: 'inline-block',
  paddingBottom: theme.spacing(0.5),
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '40%',
    height: '3px',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '4px',
  }
}));

const StatsCard = styled(Card)(({ theme }) => ({
  height: '100%',
  textAlign: 'center',
  padding: theme.spacing(2),
  borderRadius: '12px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '50px',
  padding: theme.spacing(1, 2),
  fontWeight: 600,
  textTransform: 'none',
}));

const UserProfile = () => {
  const { user, loading, updateUser } = useContext(AuthContext);
  const [editMode, setEditMode] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [userStats, setUserStats] = useState({
    tablesCount: 0,
    objectsCount: 0,
    publicTablesCount: 0,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    if (user) {
      setUserData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        confirmPassword: '',
      });
      
      // В реальном приложении здесь может быть запрос на получение статистики пользователя
      setUserStats({
        tablesCount: user.tablesCount || 0,
        objectsCount: user.objectsCount || 0,
        publicTablesCount: user.publicTablesCount || 0,
      });
    }
  }, [user]);
  
  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };
  
  const toggleEditMode = () => {
    setEditMode(!editMode);
    if (!editMode) {
      // Сбрасываем пароли при входе в режим редактирования
      setUserData({
        ...userData,
        password: '',
        confirmPassword: '',
      });
    }
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Проверка на совпадение паролей
    if (userData.password && userData.password !== userData.confirmPassword) {
      toast.error('Пароли не совпадают');
      return;
    }
    
    // Составляем объект для обновления
    const updateData = {
      name: userData.name,
    };
    
    // Добавляем пароль только если он был введен
    if (userData.password) {
      updateData.password = userData.password;
    }
    
    try {
      setSubmitting(true);
      const success = await updateUser(updateData);
      
      if (success) {
        setEditMode(false);
      }
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
      toast.error('Не удалось обновить профиль');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Анимации
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };
  
  if (loading) {
    return (
      <Container>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 'calc(100vh - 200px)' 
        }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Мой профиль
          </Typography>
        </motion.div>

        <Grid container spacing={4}>
          {/* Профиль пользователя */}
          <Grid item xs={12} md={8}>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants}>
                <ProfileContainer>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    mb: 4 
                  }}>
                    <ProfileAvatar>
                      {user?.name ? user.name[0].toUpperCase() : <PersonIcon fontSize="large" />}
                    </ProfileAvatar>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {user?.name || 'Пользователь'}
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      {user?.email || ''}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mb: 3 
                  }}>
                    <SectionTitle variant="h6">
                      Личная информация
                    </SectionTitle>
                    {!editMode ? (
                      <ActionButton 
                        variant="outlined" 
                        color="primary" 
                        startIcon={<EditIcon />}
                        onClick={toggleEditMode}
                      >
                        Редактировать
                      </ActionButton>
                    ) : (
                      <Box>
                        <ActionButton 
                          variant="outlined" 
                          color="error"
                          startIcon={<CancelIcon />}
                          onClick={toggleEditMode}
                          sx={{ mr: 1 }}
                        >
                          Отмена
                        </ActionButton>
                      </Box>
                    )}
                  </Box>

                  <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Имя"
                          name="name"
                          value={userData.name}
                          onChange={handleChange}
                          disabled={!editMode}
                          variant="outlined"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PersonIcon color="primary" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Email"
                          name="email"
                          value={userData.email}
                          disabled
                          variant="outlined"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <EmailIcon color="primary" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      {editMode && (
                        <>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Новый пароль"
                              name="password"
                              type={showPassword ? 'text' : 'password'}
                              value={userData.password}
                              onChange={handleChange}
                              variant="outlined"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <LockIcon color="primary" />
                                  </InputAdornment>
                                ),
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton
                                      onClick={toggleShowPassword}
                                      edge="end"
                                    >
                                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Повторите пароль"
                              name="confirmPassword"
                              type={showPassword ? 'text' : 'password'}
                              value={userData.confirmPassword}
                              onChange={handleChange}
                              variant="outlined"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <LockIcon color="primary" />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                        </>
                      )}
                      {editMode && (
                        <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                          <ActionButton 
                            type="submit"
                            variant="contained" 
                            color="primary"
                            startIcon={<SaveIcon />}
                            disabled={submitting}
                          >
                            {submitting ? 'Сохранение...' : 'Сохранить изменения'}
                          </ActionButton>
                        </Grid>
                      )}
                    </Grid>
                  </form>
                </ProfileContainer>
              </motion.div>
            </motion.div>
          </Grid>

          {/* Статистика пользователя */}
          <Grid item xs={12} md={4}>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
            >
              <motion.div variants={itemVariants}>
                <Paper sx={{ 
                  p: 3, 
                  borderRadius: '16px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
                }}>
                  <SectionTitle variant="h6" gutterBottom>
                    Статистика
                  </SectionTitle>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <StatsCard>
                        <Typography variant="h3" color="primary" sx={{ fontWeight: 700 }}>
                          {userStats.tablesCount}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Всего таблиц
                        </Typography>
                      </StatsCard>
                    </Grid>
                    <Grid item xs={6}>
                      <StatsCard>
                        <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                          {userStats.objectsCount}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Объектов
                        </Typography>
                      </StatsCard>
                    </Grid>
                    <Grid item xs={6}>
                      <StatsCard>
                        <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                          {userStats.publicTablesCount}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Публичных
                        </Typography>
                      </StatsCard>
                    </Grid>
                  </Grid>
                </Paper>
              </motion.div>
              
              <motion.div variants={itemVariants} style={{ marginTop: '16px' }}>
                <Card sx={{ 
                  p: 3, 
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  backgroundColor: 'primary.main',
                  color: 'white'
                }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      Присоединился
                    </Typography>
                    <Typography variant="body1">
                      {user && user.createdAt 
                        ? new Date(user.createdAt).toLocaleDateString('ru-RU', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'Неизвестно'
                      }
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default UserProfile; 