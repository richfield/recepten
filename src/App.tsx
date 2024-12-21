import { AppBar, Toolbar, Button, Container, IconButton, Typography, Avatar, Menu, MenuItem } from '@mui/material';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import RecipeScraper from './recipescraper/recipescraper.js';
import { translate } from './utils.js';
import moment from 'moment/min/moment-with-locales';
import RecipeList from './RecipeList/RecipeList.js';
import RecipeView from './RecipeView/RecipeView.js';
import { useApplicationContext } from './Components/ApplicationContext/useApplicationContext.js';
import { Brightness4, Brightness7,  Person } from '@mui/icons-material';
import { useState } from "react";
import { signInWithGoogle } from "./main.js";

function App() {
  const navigate = useNavigate();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const originalHumanize = (moment.duration as any).fn.humanize;

  // Override the humanize function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (moment.duration as any).fn.humanize = function (withSuffix: boolean) {
    const durationMinutes = this.asMinutes();
    if (durationMinutes < 60) {
      return `${Math.round(durationMinutes)} min`;
    } else {
      return originalHumanize.call(this, withSuffix);
    }
  };
  const { language, theme, toggleTheme, user, setLanguage, signOut } = useApplicationContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              Recipe App
            </Link>
          </Typography>
          <Button color="inherit" onClick={() => navigate('/recipes')}>
            {translate('recipes', language)}
          </Button>
          <Button color="inherit" onClick={() => navigate('/scraper')}>
            {translate('scraper', language)}
          </Button>
          <IconButton color="inherit" onClick={toggleTheme}>
            {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
          <Button color="inherit" onClick={handleMenuClick}>
            {language === 'en' ? 'English' : 'Nederlands'}
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => { setLanguage('en'); handleMenuClose(); }}>English</MenuItem>
            <MenuItem onClick={() => { setLanguage('nl'); handleMenuClose(); }}>Nederlands</MenuItem>
          </Menu>
          <div style={{ marginLeft: 'auto' }}>
            {user && user.photoURL ? (
              <>
                <IconButton color="inherit" >
                  <Avatar onClick={signOut} src={user.photoURL} alt="User Avatar" style={{ width: '40px', height: '40px', marginRight: '10px' }} />
                </IconButton>
              </>
            ) : (
              <IconButton color="inherit" onClick={signInWithGoogle}>
                <Person />
              </IconButton>
            )}
          </div>
        </Toolbar>
      </AppBar><Container>
        <Routes>
          <Route path="/" element={<RecipeList />} />
          <Route path="/recipes" element={<RecipeList />} />
          <Route path="/scraper" element={<RecipeScraper />} />
          <Route path="/recipe/:id" element={<RecipeView />} />
        </Routes>
      </Container>
    </>
  );
}

export default App;
