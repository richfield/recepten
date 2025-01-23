import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  CardMedia,
  Grid2,
} from "@mui/material";
import { RecipeData } from "../Types.js";
import { useApplicationContext } from "../Components/ApplicationContext/useApplicationContext.js";
import { LinkOff } from "@mui/icons-material";
import { Moment } from "moment";

interface CalendarCardProps {
  recipe: RecipeData;
  day: Moment;
  handleUnlink: (id: string, day: Date) => void;
}

const CalendarCard: React.FC<CalendarCardProps> = ({
  recipe,
  day,
  handleUnlink,
}) => {
  const { fetchAuthenticatedImage } = useApplicationContext();

  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchImage = async () => {
      const image = await fetchAuthenticatedImage(
        `/api/recipes/${recipe._id}/image`
      );
      setImageUrl(image);
    };
    fetchImage();
  }, [recipe._id, fetchAuthenticatedImage]);

  const handleClick = (day: Moment) => {
    if (recipe._id) {
      handleUnlink(recipe._id, day.toDate());
    }
  };

  return (
    <Card style={{ marginTop: '16px' }}>
      <Grid2 container>
        <Grid2 size={{ xs: 4 }}>
          <CardMedia
            component="img"
            height="140"
            image={imageUrl}
            alt={recipe.name}
            sx={{ width: "100%", objectFit: "cover" }} // Ensure the image covers the area
          />
        </Grid2>
        <Grid2 size={{ xs: 8 }} sx={{ position: "relative" }}>
          <CardContent>
            <Button
              onClick={() => handleClick(day)}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                zIndex: 1
              }}
            >
              <LinkOff />
            </Button>
            <Typography variant="h6" sx={{ marginTop: '25px' }}>
              {recipe.name}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {recipe.description}
            </Typography>
          </CardContent>
        </Grid2>
      </Grid2>
    </Card>
  );
};

export default CalendarCard;
