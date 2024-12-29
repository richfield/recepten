import React from 'react';
import { Form, Field } from 'react-final-form';
import { TextField, Checkbox, Button, FormControlLabel, Grid2, Typography } from '@mui/material';
import { UserProfileData } from "../Types.js";



const UserProfile: React.FC = () => {
    const onSubmit = (values: UserProfileData) => {
        console.log('Form values:', values);
        // Handle form submission
    };

    return (
        <Form
            onSubmit={onSubmit}
            initialValues={{ language: '', theme: '', isAdmin: false, groups: [] }}
            render={({ handleSubmit }) => (
                <form onSubmit={handleSubmit}>
                    <Grid2 container spacing={2}>
                        <Grid2 size={{xs:12}}>
                            <Typography variant="h6">User Profile</Typography>
                        </Grid2>
                        <Grid2 size={{xs:12}}>
                            <Field name="language">
                                {({ input }) => (
                                    <TextField
                                        {...input}
                                        label="Language"
                                        fullWidth
                                        variant="outlined"
                                    />
                                )}
                            </Field>
                        </Grid2>
                        <Grid2 size={{xs:12}}>
                            <Field name="theme">
                                {({ input }) => (
                                    <TextField
                                        {...input}
                                        label="Theme"
                                        fullWidth
                                        variant="outlined"
                                    />
                                )}
                            </Field>
                        </Grid2>
                        <Grid2 size={{xs:12}}>
                            <Field name="isAdmin" type="checkbox">
                                {({ input }) => (
                                    <FormControlLabel
                                        control={<Checkbox {...input} />}
                                        label="Is Admin"
                                    />
                                )}
                            </Field>
                        </Grid2>
                        <Grid2 size={{xs:12}}>
                            <Field name="groups">
                                {({ input }) => (
                                    <TextField
                                        {...input}
                                        label="Groups"
                                        fullWidth
                                        variant="outlined"
                                    />
                                )}
                            </Field>
                        </Grid2>
                        <Grid2 size={{xs:12}}>
                            <Button type="submit" variant="contained" color="primary">
                                Save
                            </Button>
                        </Grid2>
                    </Grid2>
                </form>
            )}
        />
    );
};

export default UserProfile;