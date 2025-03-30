import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Container, 
  IconButton, 
  Menu, 
  MenuItem,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import TableChartIcon from '@mui/icons-material/TableChart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import BarChartIcon from '@mui/icons-material/BarChart';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  height: 70,
  [theme.breakpoints.down('md')]: {
    height: 64,
  },
}));

const NavButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(0, 0.5),
  padding: theme.spacing(0.8, 2),
  borderRadius: '50px',
  textTransform: 'none',
  fontWeight: 500,
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.15),
  },
}));

const Logo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  '&:hover': {
    '& .logo-icon': {
      transform: 'rotate(10deg)',
    },
  },
}));

const LogoIcon = styled(TableChartIcon)(({ theme }) => ({
  marginRight: theme.spacing(1),
  fontSize: 28,
  transition: 'transform 0.3s ease',
}));

const ProfileButton = styled(Button)(({ theme }) => ({
  borderRadius: '50px',
  textTransform: 'none',
  padding: theme.spacing(0.5, 2),
  fontWeight: 500,
  backgroundColor: alpha(theme.palette.common.white, 0.1),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.2),
  },
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: 250,
    paddingTop: theme.spacing(2),
    background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    color: theme.palette.common.white,
  },
}));

const ActiveNavItem = styled(ListItem)(({ theme, active }) => ({
  position: 'relative',
  color: active ? theme.palette.primary.main : theme.palette.common.white,
  backgroundColor: active ? alpha(theme.palette.common.white, 0.9) : 'transparent',
  borderRadius: active ? theme.spacing(1) : 0,
  margin: theme.spacing(0.5, 1),
  '&:hover': {
    backgroundColor: active 
      ? alpha(theme.palette.common.white, 0.9) 
      : alpha(theme.palette.common.white, 0.1),
  },
}));

const Header = () => {
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Создаем реф для хранения контейнера меню
  const menuContainerRef = useRef(null);

  // Создаем контейнер для меню при монтировании и удаляем при размонтировании
  useEffect(() => {
    // Создаем контейнер для меню
    const menuContainer = document.createElement('div');
    menuContainer.setAttribute('id', 'menu-container');
    document.body.appendChild(menuContainer);
    
    // Сохраняем ссылку на контейнер
    menuContainerRef.current = menuContainer;
    
    // Очистка при размонтировании
    return () => {
      if (menuContainer && menuContainer.parentNode) {
        menuContainer.parentNode.removeChild(menuContainer);
      }
    };
  }, []);
  
  useEffect(() => {
    const handleScroll = () => {
      const show = window.scrollY > 50;
      if (show !== isScrolled) {
        setIsScrolled(show);
      }
    };
    
    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [isScrolled]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
    setAnchorEl(null);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const desktopMenu = (
    <>
      <NavButton 
        color="inherit" 
        component={Link} 
        to="/" 
        sx={{ 
          backgroundColor: isActive('/') ? alpha(theme.palette.common.white, 0.15) : 'transparent' 
        }}
      >
        Главная
      </NavButton>
      <NavButton 
        color="inherit" 
        component={Link} 
        to="/public-tables"
        sx={{ 
          backgroundColor: isActive('/public-tables') ? alpha(theme.palette.common.white, 0.15) : 'transparent' 
        }}
      >
        Публичные таблицы
      </NavButton>
      
      {isAuthenticated ? (
        <>
          <NavButton 
            color="inherit" 
            component={Link} 
            to="/dashboard"
            sx={{ 
              backgroundColor: isActive('/dashboard') ? alpha(theme.palette.common.white, 0.15) : 'transparent' 
            }}
          >
            Мои таблицы
          </NavButton>
          <ProfileButton
            color="inherit"
            onClick={handleProfileMenuOpen}
            startIcon={
              <Avatar 
                sx={{ 
                  width: 30, 
                  height: 30, 
                  bgcolor: theme.palette.secondary.main,
                  fontSize: '0.9rem',
                }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Avatar>
            }
          >
            {user?.name || 'Пользователь'}
          </ProfileButton>
          
          {/* Используем кастомный контейнер и отключаем проблемные настройки */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            container={menuContainerRef.current}
            keepMounted={false}
            disablePortal={false}
            disableScrollLock={true}
            disableAutoFocusItem={true}
            disableEnforceFocus={true}
            disableRestoreFocus={true}
            PaperProps={{
              elevation: 3,
              sx: { mt: 1.5, minWidth: 180 }
            }}
          >
            <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>
              <ListItemIcon>
                <AccountCircleIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText>Мой профиль</ListItemText>
            </MenuItem>
            <MenuItem component={Link} to="/dashboard" onClick={handleMenuClose}>
              <ListItemIcon>
                <BarChartIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText>Личный кабинет</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <ExitToAppIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Выйти</ListItemText>
            </MenuItem>
          </Menu>
        </>
      ) : (
        <>
          <NavButton 
            color="inherit" 
            component={Link} 
            to="/login"
            sx={{ 
              backgroundColor: isActive('/login') ? alpha(theme.palette.common.white, 0.15) : 'transparent' 
            }}
          >
            Вход
          </NavButton>
          <Button
            variant="contained"
            color="secondary"
            component={Link}
            to="/register"
            startIcon={<PersonAddIcon />}
            sx={{ 
              borderRadius: '50px', 
              textTransform: 'none',
              fontWeight: 500,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
              }
            }}
          >
            Регистрация
          </Button>
        </>
      )}
    </>
  );

  return (
    <motion.div
      initial={{ y: -70 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <StyledAppBar 
        position="sticky" 
        elevation={isScrolled ? 4 : 0}
        sx={{
          bgcolor: isScrolled ? 'primary.main' : 'primary.main',
          transition: 'box-shadow 0.3s ease',
        }}
      >
        <Container maxWidth="lg">
          <StyledToolbar disableGutters>
            <Logo component={Link} to="/" sx={{ flexGrow: { xs: 1, md: 0 }, mr: { md: 2 } }}>
              <LogoIcon className="logo-icon" />
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  fontWeight: 700,
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                Chogrid
              </Typography>
            </Logo>
            
            {isMobile ? (
              <>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="end"
                  onClick={toggleMobileMenu}
                >
                  <MenuIcon />
                </IconButton>
                
                <StyledDrawer
                  anchor="right"
                  open={mobileMenuOpen}
                  onClose={toggleMobileMenu}
                >
                  <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                    <LogoIcon sx={{ color: 'white' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
                      Chogrid
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ bgcolor: alpha('#fff', 0.2) }} />
                  
                  <List>
                    <ActiveNavItem 
                      button 
                      component={Link} 
                      to="/" 
                      onClick={toggleMobileMenu}
                      active={isActive('/')}
                    >
                      <ListItemIcon sx={{ color: 'inherit' }}>
                        <HomeIcon />
                      </ListItemIcon>
                      <ListItemText primary="Главная" />
                    </ActiveNavItem>
                    
                    <ActiveNavItem 
                      button 
                      component={Link} 
                      to="/public-tables" 
                      onClick={toggleMobileMenu}
                      active={isActive('/public-tables')}
                    >
                      <ListItemIcon sx={{ color: 'inherit' }}>
                        <TableChartIcon />
                      </ListItemIcon>
                      <ListItemText primary="Публичные таблицы" />
                    </ActiveNavItem>
                    
                    {isAuthenticated ? (
                      <>
                        <ActiveNavItem 
                          button 
                          component={Link} 
                          to="/dashboard" 
                          onClick={toggleMobileMenu}
                          active={isActive('/dashboard')}
                        >
                          <ListItemIcon sx={{ color: 'inherit' }}>
                            <BarChartIcon />
                          </ListItemIcon>
                          <ListItemText primary="Мои таблицы" />
                        </ActiveNavItem>
                        
                        <ActiveNavItem 
                          button 
                          component={Link} 
                          to="/profile" 
                          onClick={toggleMobileMenu}
                          active={isActive('/profile')}
                        >
                          <ListItemIcon sx={{ color: 'inherit' }}>
                            <AccountCircleIcon />
                          </ListItemIcon>
                          <ListItemText primary="Мой профиль" />
                        </ActiveNavItem>
                        
                        <Divider sx={{ my: 1, bgcolor: alpha('#fff', 0.2) }} />
                        
                        <ActiveNavItem 
                          button 
                          onClick={() => {
                            handleLogout();
                            toggleMobileMenu();
                          }}
                        >
                          <ListItemIcon sx={{ color: 'error.main' }}>
                            <ExitToAppIcon />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Выйти" 
                            primaryTypographyProps={{ color: 'error.main' }} 
                          />
                        </ActiveNavItem>
                      </>
                    ) : (
                      <>
                        <ActiveNavItem 
                          button 
                          component={Link} 
                          to="/login" 
                          onClick={toggleMobileMenu}
                          active={isActive('/login')}
                        >
                          <ListItemIcon sx={{ color: 'inherit' }}>
                            <AccountCircleIcon />
                          </ListItemIcon>
                          <ListItemText primary="Вход" />
                        </ActiveNavItem>
                        
                        <ActiveNavItem 
                          button 
                          component={Link} 
                          to="/register" 
                          onClick={toggleMobileMenu}
                          active={isActive('/register')}
                        >
                          <ListItemIcon sx={{ color: 'inherit' }}>
                            <PersonAddIcon />
                          </ListItemIcon>
                          <ListItemText primary="Регистрация" />
                        </ActiveNavItem>
                      </>
                    )}
                  </List>
                </StyledDrawer>
              </>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, justifyContent: 'flex-end' }}>
                {desktopMenu}
              </Box>
            )}
          </StyledToolbar>
        </Container>
      </StyledAppBar>
    </motion.div>
  );
};

export default Header; 