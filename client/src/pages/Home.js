import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Box, Button, Grid, Paper, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import TableChartIcon from '@mui/icons-material/TableChart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import VisibilityIcon from '@mui/icons-material/Visibility';

const FeatureItem = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
  }
}));

const StepCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '5px',
    height: '100%',
    background: theme.palette.primary.main,
  }
}));

const StepNumber = styled(Box)(({ theme }) => ({
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: theme.palette.primary.main,
  color: 'white',
  fontWeight: 'bold',
  marginBottom: theme.spacing(2),
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #3f51b5 30%, #7986cb 90%)',
  color: 'white',
  padding: '12px 30px',
  boxShadow: '0 3px 5px 2px rgba(63, 81, 181, 0.3)',
  borderRadius: '50px',
  textTransform: 'none',
  fontWeight: 600,
  '&:hover': {
    background: 'linear-gradient(45deg, #2c387e 30%, #3f51b5 90%)',
    boxShadow: '0 6px 10px 2px rgba(63, 81, 181, 0.3)',
  }
}));

const HeroSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #ffffff 0%, #f5f7ff 100%)',
  borderRadius: '20px',
  padding: theme.spacing(6, 3),
  marginBottom: theme.spacing(6),
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
  border: '1px solid rgba(0,0,0,0.05)',
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(8, 6),
  }
}));

const Home = () => {
  const theme = useTheme();
  
  const [featuresRef, featuresInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  const [stepsRef, stepsInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  // Анимационные варианты
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <Container maxWidth="lg">
      <HeroSection component={motion.div}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Typography variant="h3" component="h1" gutterBottom
                sx={{ 
                  fontWeight: 700, 
                  color: theme.palette.primary.dark,
                  mb: 3,
                  position: 'relative',
                  display: 'inline-block',
                  textAlign: 'center',
                  width: '100%',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: '-8px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '100px',
                    height: '4px',
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: '2px',
                  }
                }}
              >
                Chogrid - Помощник в принятии решений
              </Typography>
              <Typography variant="h5" component="h2" 
                sx={{ 
                  fontWeight: 400, 
                  color: 'text.secondary',
                  mb: 4,
                  textAlign: 'center',
                  maxWidth: '800px',
                  mx: 'auto',
                  lineHeight: 1.6
                }}
              >
                Интерактивные таблицы, которые помогут вам сделать правильный выбор при покупках
              </Typography>
              <Box sx={{ 
                mt: 5, 
                display: 'flex', 
                justifyContent: 'center',
                flexWrap: 'wrap', 
                gap: 3 
              }}>
                <GradientButton
                  component={Link}
                  to="/register"
                  size="large"
                  variant="contained"
                  endIcon={<ChevronRightIcon />}
                >
                  Начать бесплатно
                </GradientButton>
                <Button
                  variant="outlined"
                  size="large"
                  component={Link}
                  to="/public-tables"
                  sx={{ 
                    borderWidth: 2,
                    borderRadius: '50px',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 4
                  }}
                  endIcon={<VisibilityIcon />}
                >
                  Смотреть публичные таблицы
                </Button>
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </HeroSection>

      <Box sx={{ my: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="overline" component="div" gutterBottom
            sx={{ color: theme.palette.primary.main, fontWeight: 600, letterSpacing: 1.5 }}
          >
            ВОЗМОЖНОСТИ
          </Typography>
          <Typography variant="h4" component="h2" gutterBottom
            sx={{ fontWeight: 700, mb: 2 }}
          >
            Что мы предлагаем
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Chogrid помогает сравнивать и оценивать различные варианты покупок по важным для вас критериям
          </Typography>
        </Box>

        <motion.div
          ref={featuresRef}
          variants={containerVariants}
          initial="hidden"
          animate={featuresInView ? "visible" : "hidden"}
        >
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <motion.div variants={itemVariants}>
                <FeatureItem elevation={3}>
                  <Box sx={{ 
                    p: 2, 
                    backgroundColor: 'rgba(63, 81, 181, 0.1)', 
                    borderRadius: '50%',
                    mb: 2
                  }}>
                    <TableChartIcon 
                      sx={{ fontSize: 48, color: theme.palette.primary.main }} 
                    />
                  </Box>
                  <Typography variant="h5" component="h3" gutterBottom fontWeight={600}>
                    Создавайте таблицы
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Добавляйте произвольные критерии оценки товаров и задавайте им веса важности
                  </Typography>
                </FeatureItem>
              </motion.div>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <motion.div variants={itemVariants}>
                <FeatureItem elevation={3}>
                  <Box sx={{ 
                    p: 2, 
                    backgroundColor: 'rgba(63, 81, 181, 0.1)', 
                    borderRadius: '50%',
                    mb: 2
                  }}>
                    <CheckCircleIcon 
                      sx={{ fontSize: 48, color: theme.palette.primary.main }} 
                    />
                  </Box>
                  <Typography variant="h5" component="h3" gutterBottom fontWeight={600}>
                    Автоматический расчет
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Система автоматически рассчитает полезность каждого товара на основе оценок и весов
                  </Typography>
                </FeatureItem>
              </motion.div>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <motion.div variants={itemVariants}>
                <FeatureItem elevation={3}>
                  <Box sx={{ 
                    p: 2, 
                    backgroundColor: 'rgba(63, 81, 181, 0.1)', 
                    borderRadius: '50%',
                    mb: 2
                  }}>
                    <PersonIcon 
                      sx={{ fontSize: 48, color: theme.palette.primary.main }} 
                    />
                  </Box>
                  <Typography variant="h5" component="h3" gutterBottom fontWeight={600}>
                    Публикуйте и делитесь
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Сделайте таблицу публичной, чтобы поделиться своими исследованиями с другими пользователями
                  </Typography>
                </FeatureItem>
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>
      </Box>

      <Box sx={{ my: 8, py: 6, backgroundColor: 'rgba(63, 81, 181, 0.05)', borderRadius: '10px' }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="overline" component="div" gutterBottom
            sx={{ color: theme.palette.primary.main, fontWeight: 600, letterSpacing: 1.5 }}
          >
            КАК ЭТО РАБОТАЕТ
          </Typography>
          <Typography variant="h4" component="h2" gutterBottom
            sx={{ fontWeight: 700, mb: 2 }}
          >
            Просто. Понятно. Эффективно.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Всего несколько шагов для принятия оптимального решения
          </Typography>
        </Box>

        <motion.div
          ref={stepsRef}
          variants={containerVariants}
          initial="hidden"
          animate={stepsInView ? "visible" : "hidden"}
        >
          <Grid container spacing={4} sx={{ px: { xs: 2, md: 4 } }}>
            <Grid item xs={12} md={4}>
              <motion.div variants={itemVariants}>
                <StepCard elevation={2}>
                  <StepNumber>1</StepNumber>
                  <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                    Создайте таблицу
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Задайте название таблицы и добавьте критерии оценки с указанием их важности
                  </Typography>
                </StepCard>
              </motion.div>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <motion.div variants={itemVariants}>
                <StepCard elevation={2}>
                  <StepNumber>2</StepNumber>
                  <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                    Добавьте объекты
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Внесите объекты для сравнения (товары, услуги) и оцените их по каждому критерию
                  </Typography>
                </StepCard>
              </motion.div>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <motion.div variants={itemVariants}>
                <StepCard elevation={2}>
                  <StepNumber>3</StepNumber>
                  <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                    Получите результат
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Chogrid автоматически рассчитает полезность и выделит оптимальный вариант для покупки
                  </Typography>
                </StepCard>
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>
        
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <GradientButton 
            variant="contained" 
            size="large" 
            component={Link} 
            to="/login"
            startIcon={<AssessmentIcon />}
          >
            Начать использовать Chogrid
          </GradientButton>
        </Box>
      </Box>
      
      <Box sx={{ my: 8, textAlign: 'center', py: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
          Готовы сделать правильный выбор?
        </Typography>
        <Typography variant="body1" paragraph sx={{ maxWidth: 600, mx: 'auto', mb: 4, color: 'text.secondary' }}>
          Присоединяйтесь к сообществу пользователей Chogrid и сделайте свои покупки более осознанными и выгодными.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            size="large" 
            component={Link} 
            to="/register"
            color="primary"
          >
            Зарегистрироваться
          </Button>
          <Button 
            variant="outlined" 
            size="large" 
            component={Link} 
            to="/login"
          >
            Войти в аккаунт
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Home; 