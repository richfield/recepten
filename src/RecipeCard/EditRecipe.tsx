// EditRecipe Component
import React, { useState } from 'react';
import { Form, Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { Card, Button, Container, Grid, TextField, IconButton, Typography, Box, CardProps } from '@mui/material';
import { RecipeData, Language } from '../Types.js';
import { translate } from '../utils.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus, faSave, faTimes, faEye, faStar } from '@fortawesome/free-solid-svg-icons';
import myArrayMutators from './mutators.js';
import { DurationPickerField } from '../Components/DurationPicker.js';
import axios from 'axios';

type EditRecipeProps = {
    recipe: RecipeData;
    onSave: (recipe: RecipeData) => void;
    language: Language;
    toggleEdit: () => void;
};

const EditRecipe: React.FC<EditRecipeProps> = ({ recipe, onSave, language, toggleEdit }) => {
    const [forceRender, setForceRender] = useState<number>(0);

    const handleSubmit = (values: RecipeData) => {
        console.log({ values });
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
                    <Grid container justifyContent="space-between" alignItems="center">
                        <Grid item />
                        <Grid item>
                            <Box display="flex" gap={1}>
                                <IconButton onClick={handleSubmit}>
                                    <FontAwesomeIcon icon={faSave} />
                                </IconButton>
                                <IconButton onClick={toggleEdit}>
                                    <FontAwesomeIcon icon={faTimes} />
                                </IconButton>
                            </Box>
                        </Grid>
                    </Grid>
                    <Card>
                        <Box p={2}>
                            <Field name="name">
                                {({ input }) => (
                                    <TextField {...input} fullWidth label={translate('name', language)} />
                                )}
                            </Field>
                        </Box>
                        <Box p={2}>
                            <Container>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Field name="description">
                                            {({ input }) => (
                                                <TextField {...input} fullWidth multiline rows={4} label={translate('description', language)} />
                                            )}
                                        </Field>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="h6">{translate('Images', language)}:</Typography>
                                        <Grid container spacing={2}>
                                            <Grid item md={4}>
                                                {recipe._id && <img key={forceRender} src={`/api/recipes/${recipe._id}/image`} alt="Recipe" width="100%" />}
                                            </Grid>
                                            <Grid item md={8}>
                                                <Box>
                                                    <input type="file" onChange={handleFileUpload} />
                                                </Box>
                                                <FieldArray name="images">
                                                    {({ fields }) => (
                                                        <>
                                                            <IconButton onClick={() => fields.push('')}>
                                                                <FontAwesomeIcon icon={faPlus} />
                                                            </IconButton>
                                                            {fields.map((name, index) => (
                                                                <Grid container spacing={2} key={index} alignItems="center">
                                                                    <Grid item md={9}>
                                                                        <Field name={name}>
                                                                            {({ input }) => (
                                                                                <TextField {...input} fullWidth label={translate('imageUrl', language)} />
                                                                            )}
                                                                        </Field>
                                                                    </Grid>
                                                                    <Grid item>
                                                                        <Box display="flex" gap={1}>
                                                                            <IconButton>
                                                                                <FontAwesomeIcon icon={faEye} />
                                                                            </IconButton>
                                                                            <IconButton onClick={() => handleSetDefaultImage(fields.value[index])}>
                                                                                <FontAwesomeIcon icon={faStar} />
                                                                            </IconButton>
                                                                            <IconButton onClick={() => fields.remove(index)}>
                                                                                <FontAwesomeIcon icon={faMinus} />
                                                                            </IconButton>
                                                                        </Box>
                                                                    </Grid>
                                                                </Grid>
                                                            ))}
                                                        </>
                                                    )}
                                                </FieldArray>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FieldArray name="recipeIngredient">
                                            {({ fields }) => (
                                                <>
                                                    <Typography variant="h6">{translate('ingredients', language)}</Typography>
                                                    <IconButton onClick={() => fields.push('')}>
                                                        <FontAwesomeIcon icon={faPlus} />
                                                    </IconButton>
                                                    {fields.map((name, index) => (
                                                        <Grid container spacing={2} key={index} alignItems="center">
                                                            <Grid item xs={10}>
                                                                <Field name={name}>
                                                                    {({ input }) => (
                                                                        <TextField {...input} fullWidth label={translate('ingredient', language)} />
                                                                    )}
                                                                </Field>
                                                            </Grid>
                                                            <Grid item>
                                                                <IconButton onClick={() => fields.remove(index)}>
                                                                    <FontAwesomeIcon icon={faMinus} />
                                                                </IconButton>
                                                            </Grid>
                                                        </Grid>
                                                    ))}
                                                </>
                                            )}
                                        </FieldArray>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FieldArray name="recipeInstructions">
                                            {({ fields }) => (
                                                <>
                                                    <Typography variant="h6">{translate('instructions', language)}:</Typography>
                                                    <IconButton onClick={() => fields.push('')}>
                                                        <FontAwesomeIcon icon={faPlus} />
                                                    </IconButton>
                                                    {fields.map((name, index) => (
                                                        <Grid container spacing={2} key={index} alignItems="center">
                                                            <Grid item xs={10}>
                                                                <Field name={`${name}.text`}>
                                                                    {({ input }) => (
                                                                        <TextField {...input} fullWidth multiline rows={2} label={translate('instruction', language)} />
                                                                    )}
                                                                </Field>
                                                            </Grid>
                                                            <Grid item>
                                                                <IconButton onClick={() => fields.remove(index)}>
                                                                    <FontAwesomeIcon icon={faMinus} />
                                                                </IconButton>
                                                            </Grid>
                                                        </Grid>
                                                    ))}
                                                </>
                                            )}
                                        </FieldArray>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="h6">{translate('times', language)}</Typography>
                                        <DurationPickerField name="cookTime" label={translate('cookTime', language)} />
                                        <DurationPickerField name="prepTime" label={translate('prepTime', language)} />
                                        <DurationPickerField name="totalTime" label={translate('totalTime', language)} />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <ArrayCard language={language} field="keywords" />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <ArrayCard language={language} field="recipeCategory" />
                                        <ArrayCard language={language} field="recipeCuisine" />
                                    </Grid>
                                </Grid>
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

export default EditRecipe;

const ArrayCard: React.FC<{ language: Language; field: string } & CardProps> = ({ language, field, ...cardProps }) => {
    return (
        <Card {...cardProps}>
            <Box p={2}>
                <Typography variant="h6">{translate(field, language)}</Typography>
            </Box>
            <Box p={2}>
                <FieldArray name={field}>
                    {({ fields }) => (
                        <>
                            <IconButton onClick={() => fields.push('')}>
                                <FontAwesomeIcon icon={faPlus} />
                            </IconButton>
                            {fields.map((name, index) => (
                                <Grid container spacing={2} key={index} alignItems="center">
                                    <Grid item xs={10}>
                                        <Field name={name}>
                                            {({ input }) => (
                                                <TextField {...input} fullWidth label={translate('keyword', language)} />
                                            )}
                                        </Field>
                                    </Grid>
                                    <Grid item>
                                        <IconButton onClick={() => fields.remove(index)}>
                                            <FontAwesomeIcon icon={faMinus} />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            ))}
                        </>
                    )}
                </FieldArray>
            </Box>
        </Card>
    );
};
