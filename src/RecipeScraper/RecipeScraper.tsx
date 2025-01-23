import React, { useState, useCallback } from 'react';
import { Button, TextField, Grid2 } from "@mui/material";
import { translate } from "../utils.js";
import { useBusy } from "../Busy/BusyContext.js";
import { useNavigate } from "react-router-dom";
import { useApplicationContext } from "../Components/ApplicationContext/useApplicationContext.js";
import { RecipeData } from "../Types.js";
import { Add, Download } from "@mui/icons-material";


const RecipeScraper: React.FC = () => {
    const params = new URLSearchParams(window.location.search);
    const shared = params.get('url');
    const urlRegex = /(https?:\/\/[^\s]+)/g; // Match URLs starting with http or https
    const sharedUrls = shared?.match(urlRegex);
    const sharedUrl = sharedUrls && sharedUrls.length > 0 ? sharedUrls[0] : ""
    const { language, apiFetch } = useApplicationContext();
    const [url, setUrl ] = useState<string>(sharedUrl);
    const [name, setName] = useState<string>();
    const { showBusy, hideBusy } = useBusy();
    const navigate = useNavigate();
    const fetchData = async (url: string) => {
        showBusy();
        try {
            const response = await apiFetch<RecipeData>(`/api/scrape?url=${url}`, 'GET'); // API call through proxy
            if(response.data._id) {
                navigate(`/recipe/${response.data._id}`)
            }
        } catch (error) {
            console.error('Error fetching recipe data:', error);
        }
        hideBusy();
    };

    const saveNew = useCallback(async () => {
        if(name) {
            const recipe: RecipeData = {
                name
            };
            const response = await apiFetch<RecipeData>("/api/recipes/save", "POST", recipe)
            if (response.data._id) {
                navigate(`/recipe/${response.data._id}`)
            }
        }
    },[apiFetch, name, navigate])

    const onUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUrl(event.target.value);
    };

    const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log(event)
        setName(event.target.value);
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
                    variant="standard"
                />
            </Grid2>
            <Grid2 size={{lg:1, xs:12}}>
                <Button variant="contained" color="primary" onClick={() => fetchData(url)}>
                    <Download />
                </Button>
            </Grid2>
            <Grid2 size={{ lg: 11, xs: 12 }}>
                <TextField
                    fullWidth
                    type="text"
                    id="name"
                    value={name}
                    onChange={onNameChange}
                    placeholder={translate("recipeName", language)}
                    variant="standard"
                />
            </Grid2>
            <Grid2 size={{ lg: 1, xs: 12 }}>
                <Button variant="contained" color="primary" onClick={saveNew}>
                    <Add />
                </Button>
            </Grid2>
        </Grid2>
    </div>
};
export default RecipeScraper;
