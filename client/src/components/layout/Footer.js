import React from 'react';
import { Box, Container, Typography, Link, Grid, IconButton, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import TableChartIcon from '@mui/icons-material/TableChart';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailIcon from '@mui/icons-material/Email';
import { motion } from 'framer-motion';

const FooterContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.dark,
  color: theme.palette.common.white,
  paddingTop: theme.spacing(6),
  paddingBottom: theme.spacing(4),
  position: 'relative',
  overflow: 'hidden',
  marginTop: theme.spacing(8),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.primary.light})`,
  }
}));

const FooterLink = styled(Link)(({ theme }) => ({
  color: theme.palette.grey[300],
  textDecoration: 'none',
  marginBottom: theme.spacing(1),
  display: 'block',
  transition: 'color 0.2s ease',
  '&:hover': {
    color: theme.palette.common.white,
    textDecoration: 'none',
  }
}));

const SocialButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.common.white,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  marginRight: theme.spacing(1),
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    transform: 'translateY(-3px)',
  },
}));

const LogoSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();
  
  return (
    <FooterContainer component="footer">
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <LogoSection>
                <TableChartIcon sx={{ mr: 1, fontSize: 30 }} />
                <Typography variant="h5" component="div" sx={{ fontWeight: 700 }}>
                  Chogrid
                </Typography>
              </LogoSection>
              <Typography variant="body2" color="grey.300" sx={{ mb: 3 }}>
                Chogrid помогает принимать взвешенные решения при выборе и сравнении различных товаров и услуг. 
                Создавайте таблицы сравнения, оценивайте характеристики и получайте точные результаты.
              </Typography>
              <Box sx={{ display: 'flex' }}>
                <SocialButton aria-label="facebook">
                  <FacebookIcon fontSize="small" />
                </SocialButton>
                <SocialButton aria-label="twitter">
                  <TwitterIcon fontSize="small" />
                </SocialButton>
                <SocialButton aria-label="instagram">
                  <InstagramIcon fontSize="small" />
                </SocialButton>
                <SocialButton aria-label="github" href="https://github.com/ops-00000000/Chogrid" target="_blank">
                  <GitHubIcon fontSize="small" />
                </SocialButton>
              </Box>
            </motion.div>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 2 }}>
                Навигация
              </Typography>
              
              <FooterLink href="/">Главная</FooterLink>
              <FooterLink href="/public-tables">Публичные таблицы</FooterLink>
              <FooterLink href="/login">Вход</FooterLink>
              <FooterLink href="/register">Регистрация</FooterLink>
            </motion.div>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 2 }}>
                Контакты
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EmailIcon sx={{ fontSize: 20, mr: 1, color: theme.palette.grey[300] }} />
                <FooterLink href="mailto:info@chogrid.com" sx={{ mb: 0 }}>
                  info@chogrid.com
                </FooterLink>
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="grey.400" gutterBottom>
                  Есть вопросы или предложения?
                </Typography>
                <FooterLink href="/contact" sx={{ color: theme.palette.secondary.light }}>
                  Напишите нам
                </FooterLink>
              </Box>
            </motion.div>
          </Grid>
        </Grid>
        
        <Box 
          sx={{ 
            borderTop: '1px solid rgba(255, 255, 255, 0.1)', 
            mt: 4, 
            pt: 3,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', sm: 'flex-start' },
          }}
        >
          <Typography variant="body2" color="grey.400" align="center" sx={{ mb: { xs: 1, sm: 0 } }}>
            © {currentYear} Chogrid. Все права защищены.
          </Typography>
          
          <Box>
            <FooterLink href="/privacy" sx={{ display: 'inline', mr: 2 }}>
              Политика конфиденциальности
            </FooterLink>
            <FooterLink href="/terms" sx={{ display: 'inline' }}>
              Условия использования
            </FooterLink>
          </Box>
        </Box>
      </Container>
    </FooterContainer>
  );
};

export default Footer; 