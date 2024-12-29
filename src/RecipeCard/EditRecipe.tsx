// EditRecipe Component
import React, { useState } from 'react';
import { Form, Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { Card, Button, Container, TextField, IconButton, Typography, Box, CardProps, Grid2, Portal } from '@mui/material';
import { RecipeData, Language } from '../Types.js';
import { translate } from '../utils.js';
import myArrayMutators from './mutators.js';
import { DurationPickerField } from '../Components/DurationPicker.js';
import axios from 'axios';
import { Add, AddAPhoto, Cancel, Delete, Image, Save } from "@mui/icons-material";

type EditRecipeProps = {
    recipe: RecipeData;
    onSave: (recipe: RecipeData) => void;
    language: Language;
    toggleEdit: () => void;
};

const EditRecipe: React.FC<EditRecipeProps> = ({ recipe, onSave, language, toggleEdit }) => {
    const [forceRender, setForceRender] = useState<number>(0);

    const handleSubmit = (values: RecipeData) => {
        onSave(values);
    };

    const uploadImage = async (recipeId: string, file: File): Promise<void> => {
        const formData = new FormData();
        formData.append('image', file);

        await axios.post(`/api/recipes/${recipeId}/image/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    };

    async function handleSetDefaultImage(url: string): Promise<void> {
        try {
            const recipeId = recipe._id;
            await axios.post(`/api/recipes/${recipeId}/image/url`, { url }, {
                headers: { 'Content-Type': 'application/json' },
            });
            setForceRender(forceRender + 1);
            console.log('Default image set successfully');
        } catch (error) {
            console.error('Failed to set default image', error);
        }
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            const recipeId = recipe._id; // Assuming `recipe` contains the ID
            if (recipeId) {
                uploadImage(recipeId, file)
                    .then(() => {
                        console.log('Image uploaded successfully');
                    })
                    .catch((err) => {
                        console.error('Failed to upload image', err);
                    });
            } else {
                console.error('Recipe ID is not defined');
            }
        }
    };

    return (
        <Form
            initialValues={recipe}
            onSubmit={handleSubmit}
            mutators={{ ...myArrayMutators }}
            render={({ handleSubmit }) => (
                <form onSubmit={handleSubmit}>
                    <Grid2 container justifyContent="space-between" alignItems="center">
                        <Grid2 />
                        <Grid2>
                            <Box display="flex" gap={1}>
                                <IconButton onClick={handleSubmit}>
                                    <Save />
                                </IconButton>
                                <IconButton onClick={toggleEdit}>
                                    <Cancel />
                                </IconButton>
                            </Box>
                        </Grid2>
                    </Grid2>
                    <Card>
                        <Box p={2}>
                            <Field name="name">
                                {({ input }) => (
                                    <TextField {...input} fullWidth label={translate('name', language)} variant="standard" size="small" />
                                )}
                            </Field>
                        </Box>
                        <Box p={2}>
                            <Container>
                                <Grid2 container spacing={2}>
                                    <Grid2 size={{ xs: 12 }}>
                                        <Field name="description">
                                            {({ input }) => (
                                                <TextField {...input} fullWidth multiline label={translate('description', language)} variant="standard" size="small" />
                                            )}
                                        </Field>
                                    </Grid2>
                                    <Grid2 size={{ xs: 12 }}>
                                        <Field name="recipeYield">
                                            {({ input }) => (
                                                <TextField {...input} fullWidth multiline label={translate('recipeYield', language)} variant="standard" size="small" />
                                            )}
                                        </Field>
                                    </Grid2>
                                    <Grid2 size={{ xs: 12 }}>
                                        <Box p={2}>
                                            <Typography variant="h6">{translate("images", language)}</Typography>
                                        </Box>
                                        <Grid2 container spacing={2}>
                                            <Grid2 size={{ md: 4, xs: 12 }}>
                                                {recipe._id && <img key={forceRender} src={`/api/recipes/${recipe._id}/image`} alt="Recipe" width="100%" />}
                                            </Grid2>
                                            <Grid2 size={{ md: 8, xs: 12 }}>
                                                <Box>
                                                    <input type="file" onChange={handleFileUpload} />
                                                </Box>
                                                <ImageCard language={language} field="images" handleSetDefaultImage={handleSetDefaultImage} />
                                            </Grid2>
                                        </Grid2>
                                    </Grid2>
                                    <Grid2 size={{ md: 12 }}>
                                        <ArrayCard language={language} field={"recipeIngredient"} />
                                    </Grid2>
                                    <Grid2 size={{ md: 12 }}>
                                        <ArrayCard language={language} field={"recipeInstructions"} multiline={true} valueSelector={({ text }) => text} valueUpdater={(value) => ({ "@type": "HowToStep", text: value, name: value })} />
                                    </Grid2>
                                    <Grid2 size={{ md: 12 }}>
                                        <Typography variant="h6">{translate('times', language)}</Typography>
                                        <Grid2 container spacing={0.5}>
                                            <DurationPickerField name="cookTime" label={translate('cookTime', language)} />
                                            <DurationPickerField name="prepTime" label={translate('prepTime', language)} />
                                            <DurationPickerField name="totalTime" label={translate('totalTime', language)} />
                                        </Grid2>
                                    </Grid2>
                                    <Grid2 size={{ xs: 12, md: 6 }}>
                                        <ArrayCard language={language} field="keywords" />
                                    </Grid2>
                                    <Grid2 size={{ xs: 12, md: 6 }}>
                                        <ArrayCard language={language} field="recipeCategory" />
                                        <ArrayCard language={language} field="recipeCuisine" />
                                    </Grid2>
                                </Grid2>
                            </Container>
                        </Box>
                        <Box p={2}>
                            <Button type="submit" variant="contained" color="primary">
                                {translate('save', language)}
                            </Button>
                        </Box>
                    </Card>
                </form>
            )}
        />
    );
};


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ArrayCard: React.FC<{ language: Language; field: string; valueSelector?: (value: any) => string, valueUpdater?: (value: string) => any, multiline?: boolean } & CardProps> = ({ language, field, valueSelector, valueUpdater, multiline = false, ...cardProps }) => {
    return (
        <Card {...cardProps}>
            <Box p={2}>
                <Typography variant="h6">{translate(field, language)}</Typography>
            </Box>
            <Box p={2}>
                <FieldArray name={field}>
                    {({ fields }) => (
                        <Grid2>
                            {fields.map((name, index) => (
                                <Grid2 container key={index} alignItems="center">
                                    <Grid2 size={{ xs: 11 }} >
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
                            ))}
                            <Grid2 container justifyContent="flex-end">
                                <IconButton onClick={() => fields.push('')} size="small">
                                    <Add fontSize="small" />
                                </IconButton>
                            </Grid2>
                        </Grid2>
                    )}
                </FieldArray>
            </Box>
        </Card>
    );
};

const ImageCard: React.FC<{ language: Language; field: string; handleSetDefaultImage: (url: string) => void } & CardProps> = ({ language, field, handleSetDefaultImage, ...cardProps }) => {
    const [popoverOpen, setPopoverOpen] = useState<number | null>(null);
    const [popoverAnchor, setPopoverAnchor] = useState<DOMRect | null>(null);

    const handleMouseEnter = (index: number, event: React.MouseEvent<HTMLButtonElement>) => {
        setPopoverOpen(index);
        setPopoverAnchor(event.currentTarget.getBoundingClientRect());
    };

    const handleMouseLeave = () => {
        setPopoverOpen(null);
        setPopoverAnchor(null);
    };

    return (
        <Card {...cardProps}>
            <Box p={2}>
                <FieldArray name={field}>
                    {({ fields }) => (
                        <Grid2 container spacing={2}>
                            {fields.map((name, index) => (
                                <Grid2 container key={index} alignItems="center" size={{ xs: 12, md: 12 }}>
                                    <Grid2 size={{ xs: 7, md: 9 }}>
                                        <Field name={name}>
                                            {({ input }) => (
                                                <TextField {...input} fullWidth size="small" variant="standard" />
                                            )}
                                        </Field>
                                    </Grid2>
                                    <Grid2 size={{ xs: 5, md: 3 }}>
                                        <IconButton onClick={() => fields.remove(index)} size="small">
                                            <Delete fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onMouseEnter={(e) => handleMouseEnter(index, e)}
                                            onMouseLeave={handleMouseLeave}
                                        >
                                            <Image fontSize="small" />
                                            {popoverOpen === index && popoverAnchor && (
                                                <Portal>
                                                    <Box
                                                        position="fixed"
                                                        zIndex={2000}
                                                        bgcolor="white"
                                                        p={1}
                                                        boxShadow={3}
                                                        style={{
                                                            top: popoverAnchor.top - 10,
                                                            left: popoverAnchor.left + popoverAnchor.width / 2,
                                                            transform: 'translate(-50%, -100%)',
                                                        }}
                                                    >
                                                        <img src={fields.value[index]} alt="Preview" width="300" />
                                                    </Box>
                                                </Portal>
                                            )}
                                        </IconButton>
                                        <IconButton onClick={() => handleSetDefaultImage(fields.value[index])} title={translate("setAsRecipeImage", language)}>
                                            <AddAPhoto fontSize="small" />
                                        </IconButton>
                                    </Grid2>
                                </Grid2>
                            ))}
                            <Grid2 size={{ xs: 12, md: 12 }} container justifyContent="flex-end">
                                <IconButton onClick={() => fields.push('')} size="small">
                                    <Add fontSize="small" />
                                </IconButton>
                            </Grid2>
                        </Grid2>
                    )}
                </FieldArray>
            </Box>
        </Card>
    );
};


export default EditRecipe;