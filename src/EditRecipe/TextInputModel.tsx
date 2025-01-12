import React, { useState, ChangeEvent } from 'react';
import { Modal, Box, Button, TextField, DialogActions } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Cancel, Publish } from "@mui/icons-material";
import { translate } from "../utils.js";
import { useApplicationContext } from "../Components/ApplicationContext/useApplicationContext.js";

interface TextInputModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (lines: string[], fieldName: string) => void;
    fieldName: string;
}

const TextInputModal: React.FC<TextInputModalProps> = ({ open, onClose, onSubmit, fieldName }) => {
    const { language } = useApplicationContext();
    const [text, setText] = useState<string>('');
    const theme = useTheme();

    const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => setText(e.target.value);

    const handleSubmit = () => {
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);
        onSubmit(lines, fieldName);
        setText('');
        onClose();
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{
                width: '50%',
                padding: 2,
                margin: 'auto',
                backgroundColor: theme.palette.background.default,
                top: '50%',
                left: '50%',
                position: 'absolute',
                transform: 'translate(-50%, -50%)',
                boxShadow: theme.shadows[5], // Use theme shadow
                borderRadius: theme.shape.borderRadius // Use theme border radius
            }}>
                <TextField
                    label={translate("pasteHere", language)}
                    multiline
                    fullWidth
                    rows={4}
                    value={text}
                    onChange={handleTextChange}
                />
                <DialogActions>
                    <Button onClick={onClose}><Cancel /></Button>
                    <Button onClick={handleSubmit}><Publish /></Button>
                </DialogActions>
            </Box>
        </Modal>
    );
};

export default TextInputModal;
