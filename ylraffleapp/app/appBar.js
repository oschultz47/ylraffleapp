import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { blueGrey, purple } from '@mui/material/colors';
import { signOut } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';

const theme = createTheme({
  palette: {
    primary: blueGrey,
    secondary: purple,
  },
});

export default function ButtonAppBar() {
  const router = useRouter();

  const handleNavigation = (path) => {
    router.push(path);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <ThemeProvider theme={theme}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flex: '0 1 10%', textAlign: 'left' }}>
              BVYL Raffle
            </Typography>
            <Box sx={{ flex: '1 1 90%', display: 'flex', justifyContent: 'space-evenly' }}>
              <Button color="inherit" onClick={() => handleNavigation('/raffle')}>Raffle</Button>
              <Button color="inherit" onClick={() => handleNavigation('/directory')}>Directory</Button>
              <Button color="inherit" onClick={() => handleNavigation('/leaders')}>Leaders</Button>
              <Button color="inherit" onClick={() => signOut()}>Log Out</Button>
            </Box>
          </Toolbar>
        </AppBar>
      </ThemeProvider>
    </Box>
  );
}