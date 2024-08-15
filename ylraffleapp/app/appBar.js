import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { blueGrey, purple } from '@mui/material/colors';
import { signOut } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';
import useMediaQuery from '@mui/material/useMediaQuery';

const theme = createTheme({
  palette: {
    primary: blueGrey,
    secondary: purple,
  },
});

export default function ButtonAppBar() {
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleNavigation = (path) => {
    router.push(path);
    handleMenuClose(); // Close the menu after navigation
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <ThemeProvider theme={theme}>
        <AppBar position="fixed">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'left' }}>
              BVYL Raffle
            </Typography>
            {isMobile ? (
              <>
                <IconButton
                  size="large"
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  sx={{ mr: 2 }}
                  onClick={handleMenuOpen}
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={() => handleNavigation('/raffle')}>Raffle</MenuItem>
                  <MenuItem onClick={() => handleNavigation('/directory')}>Kids</MenuItem>
                  <MenuItem onClick={() => handleNavigation('/leaders')}>Leaders</MenuItem>
                  <MenuItem onClick={() => handleNavigation('/clubstats')}>Stats</MenuItem>
                  <MenuItem onClick={() => signOut()}>Log Out</MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button color="inherit" onClick={() => handleNavigation('/raffle')}>Raffle</Button>
                <Button color="inherit" onClick={() => handleNavigation('/directory')}>Kids</Button>
                <Button color="inherit" onClick={() => handleNavigation('/leaders')}>Leaders</Button>
                <Button color="inherit" onClick={() => handleNavigation('/clubstats')}>Stats</Button>
                <Button color="inherit" onClick={() => signOut()}>Log Out</Button>
              </Box>
            )}
          </Toolbar>
        </AppBar>
      </ThemeProvider>
    </Box>
  );
}
