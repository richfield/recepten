/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Card, Box, Typography, IconButton, CardProps, TextField, useTheme, Grid2 } from "@mui/material";
import { Delete, Add, ContentPaste } from '@mui/icons-material';
import { Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { Language } from "../Types.js";
import { translate } from "../utils.js";
import TextInputModal from "./TextInputModel.js";

interface ArrayCardProps {
    language: Language;
    field: string;
    valueSelector?: (value: any) => string;
    valueUpdater?: (value: string) => any;
    multiline?: boolean;
    // Other CardProps can be passed to the Card component
}

const ArrayCard: React.FC<ArrayCardProps & CardProps> = ({ language, field, valueSelector, valueUpdater, multiline = false, ...cardProps }) => {
    const [modalOpen, setModalOpen] = useState(false); // Modal open state
    const theme = useTheme(); // Access MUI theme

    // Open and close modal handlers
    const handleOpenModal = () => setModalOpen(true);
    const handleCloseModal = () => setModalOpen(false);

    return (
        <Card {...cardProps}>
            <Box p={2}>
                <Typography variant="h6">{translate(field, language)}</Typography>
            </Box>
            <Box p={2}>
                <FieldArray name={field}>
                    {({ fields }) => (
                        <Grid2 container spacing={2}>
                            {fields.map((name, index) => (
                                <Grid2 size={{xs:12}} key={index}>
                                    <Grid2 container alignItems="center">
                                        <Grid2 size={{ xs: 11 }}>
                                            <Field name={name}>
                                                {({ input }) => (
                                                    <TextField
                                                        {...input}
                                                        multiline={multiline}
                                                        fullWidth
                                                        size="small"
                                                        variant="standard"
                                                        value={valueSelector ? valueSelector(input.value) : input.value}
                                                        onChange={(e) => input.onChange(valueUpdater ? valueUpdater(e.target.value) : e.target.value)}
                                                    />
                                                )}
                                            </Field>
                                        </Grid2>
                                        <Grid2 size={{ xs: 1 }}>
                                            <IconButton onClick={() => fields.remove(index)} size="small">
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Grid2>
                                    </Grid2>
                                </Grid2>
                            ))}
                            <Grid2 size={{xs:12}} container justifyContent="flex-end">
                                <IconButton onClick={() => fields.push('')} size="small">
                                    <Add fontSize="small" />
                                </IconButton>
                                {/* Open the modal to add multiple items */}
                                <IconButton onClick={handleOpenModal} size="small" style={{ marginLeft: theme.spacing(1) }}>
                                    <ContentPaste fontSize="small" />
                                </IconButton>
                            </Grid2>
                            <TextInputModal
                                open={modalOpen} // Modal open state
                                onClose={handleCloseModal} // Close handler
                                onSubmit={(lines) => {
                                    if(valueUpdater) {
                                        lines.forEach(line => fields.push(valueUpdater(line)));
                                    } else {
                                        lines.forEach(line => fields.push(line));
                                    }
                                }} // Add items to the field array
                                fieldName={field} // Pass the field name to the modal
                            />
                        </Grid2>
                    )}
                </FieldArray>
            </Box>

        </Card>
    );
};

export default ArrayCard;
