import { useCallback, useEffect, useState } from "react";
import { Grid2, Pagination, Box } from "@mui/material";
import { useParams } from "react-router-dom";
import { RecipeData } from "../Types.js";
import { RecipeCard } from "./RecipeCard.js";
import { useApplicationContext } from "../Components/ApplicationContext/useApplicationContext.js";
import { useBusy } from "../Busy/BusyContext.js";

const RecipeList: React.FC = () => {
    const { apiFetch, user, showError } = useApplicationContext();
    const { showBusy, hideBusy } = useBusy();
    const [recipes, setRecipes] = useState<RecipeData[]>()
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const { searchQuery } = useParams();
    const fetchData = useCallback(async (url: string) => {
        if (!user) {
            return;
        }
        showBusy();
        try {
            const response = await apiFetch<RecipeData[] | { items: RecipeData[]; totalPages: number }>(url, "GET");
            if (Array.isArray(response.data)) {
                setRecipes(response.data);
                setTotalPages(1);
            } else if (response.data) {
                setRecipes(response.data.items);
                setTotalPages(response.data.totalPages);
            }
        } catch (error) {
            showError(error)
            console.error('Error fetching recipe data:', error);
        } finally {
            hideBusy();
        }
    }, [apiFetch, hideBusy, showBusy, showError, user]);

    useEffect(() => {
        setPage(1);
    }, [searchQuery]);

    useEffect(() => {
        const url = searchQuery
            ? `/api/recipes/search?query=${encodeURIComponent(searchQuery)}&page=${page}&pageSize=20`
            : `/api/recipes?page=${page}&pageSize=20`;
        fetchData(url)
    }, [searchQuery, page, fetchData])

    const onDeleted = () => {
        const url = searchQuery
            ? `/api/recipes/search?query=${encodeURIComponent(searchQuery)}&page=${page}&pageSize=20`
            : `/api/recipes?page=${page}&pageSize=20`;
        fetchData(url)
    };

    return <>
        <Grid2 container spacing={2}>
            {recipes && recipes.map((recipe, index) => (
                <RecipeCard key={recipe._id} recipe={recipe} index={index} onDeleted={onDeleted} />
            ))}
        </Grid2>
        {totalPages > 1 && (
            <Box display="flex" justifyContent="center" sx={{ my: 3 }}>
                <Pagination count={totalPages} page={page} onChange={(_, nextPage) => setPage(nextPage)} color="primary" />
            </Box>
        )}
    </>
};

export default RecipeList