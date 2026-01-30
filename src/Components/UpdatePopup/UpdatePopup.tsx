import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from "@mui/material";

interface UpdatePopupProps {
  open: boolean;
  onReload: () => void;
  onClose: () => void;
}

export default function UpdatePopup({ open, onReload, onClose }: UpdatePopupProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Update Available</DialogTitle>
      <DialogContent>
        <Typography>
          A new version of this app is available. Reload to update?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Later</Button>
        <Button
          onClick={onReload}
          variant="contained"
          color="primary"
        >
          Reload
        </Button>
      </DialogActions>
    </Dialog>
  );
}