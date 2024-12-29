import React, { useState } from 'react';
import axios from 'axios';
import { Button, TextField, Grid2 } from "@mui/material";
import { translate } from "../utils.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { useBusy } from "../Busy/BusyContext.js";
import { useNavigate } from "react-router-dom";
import { useApplicationContext } from "../Components/ApplicationContext/useApplicationContext.js";


const RecipeScraper: React.FC = () => {
    const params = new URLSearchParams(window.location.search);
    const shared = params.get('url');
    const urlRegex = /(https?:\/\/[^\s]+)/g; // Match URLs starting with http or https
    const sharedUrls = shared?.match(urlRegex);
    const sharedUrl = sharedUrls && sharedUrls.length > 0 ? sharedUrls[0] : ""
    const { language } = useApplicationContext();
    const [url, setUrl ] = useState<string>(sharedUrl);
    const { showBusy, hideBusy } = useBusy();
    const navigate = useNavigate();
    const fetchData = async (url: string) => {
        showBusy();
        try {
            const response = await axios.get(`/api/scrape?url=${url}`); // API call through proxy
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
        <Grid2 container spacing={2} alignItems="center">
            <Grid2 size={{lg:11, xs:12}}>
                <TextField
                    fullWidth
                    type="text"
                    id="inputUrl"
                    value={url}
                    onChange={onUrlChange}
                    placeholder={translate("enterRecipeLink", language)}
                    variant="outlined"
                />
            </Grid2>
            <Grid2 size={{lg:1, xs:12}}>
                <Button variant="contained" color="primary" onClick={() => fetchData(url)}>
                    <FontAwesomeIcon icon={faDownload} />
                </Button>
            </Grid2>
        </Grid2>
    </div>
};
export default RecipeScraper;
