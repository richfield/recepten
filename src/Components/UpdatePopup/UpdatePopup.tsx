import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from "@mui/material";
import { useApplicationContext } from "../ApplicationContext/useApplicationContext.js";
import { translate } from "../../utils.js";

interface UpdatePopupProps {
  open: boolean;
  onReload: () => void;
  onClose: () => void;
}

export default function UpdatePopup({ open, onReload, onClose }: UpdatePopupProps) {
    const { language } = useApplicationContext();
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{translate("updateAvailable", language)}</DialogTitle>
      <DialogContent>
        <Typography>
          {translate("updateMessage", language)}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{translate("later", language)}</Button>
        <Button
          onClick={onReload}
          variant="contained"
          color="primary"
        >
          {translate("reload", language)}
        </Button>
      </DialogActions>
    </Dialog>
  );
}