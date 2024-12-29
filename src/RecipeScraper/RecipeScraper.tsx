import React, { useState } from 'react';
import axios from 'axios';
import { Button, TextField, Grid } from '@mui/material';
import { translate } from "../utils.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { useBusy } from "../Busy/BusyContext.js";
import { useNavigate } from "react-router-dom";
import { useApplicationContext } from "../Components/ApplicationContext/useApplicationContext.js";


const RecipeScraper: React.FC = () => {
    const { language } = useApplicationContext();
    const [url, setUrl ] = useState<string>("");
    const { showBusy, hideBusy } = useBusy();
    const navigate = useNavigate();
    const params = new URLSearchParams(window.location.search);
    const sharedUrl = params.get('url');
    console.log({sharedUrl})
    const fetchData = async (url: string) => {
        showBusy();
        try {
            const response = await axios.get(`/api/scrape?url=${url}`); // API call through proxy
            console.log({response})
            if(response.data._id) {
                navigate(`/recipe/${response.data._id}`)
            }
        } catch (error) {
            console.error('Error fetching recipe data:', error);
        }
        hideBusy();
    };

    const onUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUrl(event.target.value);
    };

    return <div className="content">
        {sharedUrl || 'not defined'}
        <Grid container spacing={2} alignItems="center">
            <Grid item lg={11}>
                <TextField
                    fullWidth
                    type="text"
                    id="inputUrl"
                    value={url}
                    onChange={onUrlChange}
                    placeholder={translate("enterRecipeLink", language)}
                    variant="outlined"
                />
            </Grid>
            <Grid item xs>
                <Button variant="contained" color="primary" onClick={() => fetchData(url)}>
                    <FontAwesomeIcon icon={faDownload} />
                </Button>
            </Grid>
        </Grid>
    </div>
};
export default RecipeScraper;
