import React, { useState, useCallback, useEffect } from "react";
import moment, { Moment } from "moment";
import "moment/locale/nl"; // Import Dutch locale
import "moment/locale/en-gb"; // Import English locale
import {
  Box,
  Typography,
  IconButton,
  Grid2,
  Modal,
  TextField,
  Button,
} from "@mui/material";
import { ArrowBack, ArrowForward, AddLink } from "@mui/icons-material";
import { useApplicationContext } from "../Components/ApplicationContext/useApplicationContext.js";
import RecipeSearch from "./RecipeSearch.js";
import { translate } from "../utils.js";
import { DatesResponse } from "../Types.js";
import { useBusy } from "../Busy/BusyContext.js";
import CalendarCard from "./CalendarCard.js";

const WeekCalendar: React.FC = () => {
  const { language, theme, apiFetch, confirm, user } = useApplicationContext();
  const { showBusy, hideBusy } = useBusy();
  const [currentDate, setCurrentDate] = useState<Moment>(moment());
  const [selectedDate, setSelectedDate] = useState<Moment | null>(null);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [instantSearch, setInstantSearch] = useState<string>("");
  const [dates, setDates] = useState<DatesResponse[]>([]);

  const fetchData = useCallback(
    async (url: string) => {

      if (!user) {
        return;
      }
      showBusy();
      try {
        const response = await apiFetch<DatesResponse[]>(url, "GET");
        if (response.data) {
          setDates(response.data);
        }
      } catch (error) {
        console.error("Error fetching recipe data:", error);
      } finally {
        hideBusy();
      }
    },
    [apiFetch, hideBusy, showBusy, user]
  );

  const onUnlink = useCallback(
    async (id: string | undefined, day: Date) => {
      if (
        await confirm(translate("unlink", language))
      ) {
        showBusy();
        try {
          const result = await apiFetch(
            `/api/calendar/link`,
            "DELETE",
            { date: day, recipeId: id },
            {
              headers: { "Content-Type": "application/json" },
            }
          );
          if (result) {
            const url = `/api/calendar/dates-with-recipes`;
            fetchData(url);
          }
        } catch (error) {
          console.error("Error fetching recipe data:", error);
        } finally {
          hideBusy();
        }
      }
    },
    [apiFetch, confirm, fetchData, hideBusy, language, showBusy]
  );

  useEffect(() => {
    if (!openModal) {
      fetchData(`/api/calendar/dates-with-recipes`);
    }
  }, [openModal, fetchData]);

  moment.locale(language);

  const startOfWeek = currentDate.clone().startOf("week");
  const endOfWeek = currentDate.clone().endOf("week");

  const generateWeekDays = (): Moment[] => {
    const days: Moment[] = [];
    const day = startOfWeek.clone();
    while (day.isSameOrBefore(endOfWeek)) {
      days.push(day.clone());
      day.add(1, "day");
    }
    return days;
  };

  const handlePrevWeek = () =>
    setCurrentDate(currentDate.clone().subtract(1, "week"));
  const handleNextWeek = () =>
    setCurrentDate(currentDate.clone().add(1, "week"));

  const handleOpenModal = () => {
    if(!openModal) {
      setOpenModal(true);
    }
  };
  const handleCloseModal = () => {
    if(openModal) {
      setOpenModal(false);
    }
  };

  const handleRecipeSearch = () => {
    setSearchQuery(instantSearch);
  };

  const recipeSelected = () => {
    if(openModal) {
      setOpenModal(false);
    }
  };

  const handleSearchForDate = (
    day: moment.Moment
  ): React.MouseEventHandler<HTMLButtonElement> | undefined => {
    handleOpenModal();
    setSelectedDate(day);
    return;
  };

  const onSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        setSearchQuery(instantSearch);
      }
    },
    [instantSearch]
  );

  const weekDays = generateWeekDays();

  return (
    <Box
      sx={{
        margin: "0 auto",
        textAlign: "center",
        padding: 2,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        backgroundColor: theme.palette.background.paper,
      }}
    >
      {/* Week Navigation */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <IconButton onClick={handlePrevWeek} color="primary">
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>
          {startOfWeek.format("DD MMM")} - {endOfWeek.format("DD MMM YYYY")}
        </Typography>
        <IconButton onClick={handleNextWeek} color="primary">
          <ArrowForward />
        </IconButton>
      </Box>

      <Grid2 container direction="column" spacing={2} size={{ xs: 12 }}>
        {weekDays.map((day) => {
          const recipes = dates.find((f) =>
            moment(f._id).isSame(day, "day")
          )?.recipes;
          return (
            <Grid2
              key={day.toString()}
              sx={{
                padding: 2,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                cursor: "pointer",
                position: "relative",
              }}
            >
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 6 }}>
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    sx={{ textAlign: "left" }}
                  >
                    {day.format("dddd")}
                  </Typography>
                  <Typography variant="body2" sx={{ textAlign: "left" }}>
                    {day.format("DD MMM YYYY")}
                  </Typography>
                </Grid2>
                <Grid2 size={{ xs: 6 }} style={{ position: "relative" }}>
                  <IconButton
                    onClick={() => handleSearchForDate(day)}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                    }}
                  >
                    <AddLink />
                  </IconButton>
                </Grid2>
              </Grid2>

              <Grid2 container justifyContent="center">
                <Grid2 size={{ xs: 0.5 }} />
                      <Grid2 size={{ xs: 11 }}>
                  {recipes?.map((recipe, idx) => (
                      <CalendarCard
                        key={idx}
                        recipe={recipe}
                        day={day}
                        handleUnlink={onUnlink}
                      />
                  ))}
                </Grid2>
                <Grid2 size={{ xs: 0.5 }} />
              </Grid2>
            </Grid2>
          );
        })}
      </Grid2>

      {/* Recipe Search Modal */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: theme.palette.background.paper,
            padding: 3,
            borderRadius: 2,
            boxShadow: 24,
            width: { xs: "90%", md: "50%" },
            xs: 12,
            md: 6,
            maxHeight: "80%",
            overflow: "auto",
          }}
        >
          <Typography variant="h6" mb={2}>
            {translate("searchForRecipe", language)}
          </Typography>
          <TextField
            fullWidth
            label="Search"
            variant="outlined"
            value={instantSearch}
            onChange={(e) => setInstantSearch(e.target.value)}
            onKeyDown={onSearchKeyDown}
            sx={{ mb: 2 }}
          />
          <Button
            fullWidth
            variant="contained"
            onClick={handleRecipeSearch}
            sx={{ mb: 2 }}
          >
            {translate("search", language)}
          </Button>
          <RecipeSearch
            searchQuery={searchQuery}
            selectedDate={selectedDate?.toDate() ?? new Date()}
            onRecipeSelected={recipeSelected}
          />
        </Box>
      </Modal>
    </Box>
  );
};

export default WeekCalendar;
