import React from 'react';
import { Typography, Button, Container, Box, AppBar, Toolbar, IconButton, Menu, MenuItem, Avatar, ListItemIcon } from '@mui/material';
import { Article, Settings, Logout } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';

const Header: React.FC = () => {
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const auth = useAuth();

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleSettings = () => {
    setAnchorElUser(null);
  };

  const handleSignOut = () => {
    setAnchorElUser(null);
    auth.signOut();
  };

  return (
    <AppBar position="fixed">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            <Article />
            サンプルアプリ
          </Typography>

          <Box sx={{ flexGrow: 1 }}>
            <Link to="/articles">
              <Button
                sx={{ my: 2, color: 'white', border: '1px solid white' }}
              >
                記事一覧
              </Button>
            </Link>
          </Box>

          {auth.isAuthenticated ?
            <Box sx={{ flexGrow: 0 }}>
              {auth.username}&nbsp;
              <IconButton onClick={handleOpenUserMenu}>
                <Avatar alt="User" />
              </IconButton>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem onClick={handleSettings}>
                  <ListItemIcon><Settings /></ListItemIcon>
                  ユーザー設定
                </MenuItem>
                <MenuItem onClick={handleSignOut}>
                  <ListItemIcon><Logout /></ListItemIcon>
                  ログアウト
                </MenuItem>
              </Menu>
            </Box>
          :
            <Link to="/signin">ログイン</Link>
          }
          
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
