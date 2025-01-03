import React, { useEffect, useState } from 'react';
import { Form, Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { TextField, Select, MenuItem, Button, Grid2, InputLabel, FormControl, IconButton } from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { RoleData, UserProfile, GroupData } from "../Types.js";
import { useApplicationContext } from "../Components/ApplicationContext/useApplicationContext.js";
import myArrayMutators from "./mutators.js";
import { translate } from "../utils.js";

const UserProfile: React.FC = () => {
    const { apiFetch, language } = useApplicationContext();
    const [userProfile, setUserProfile] = useState<UserProfile>();
    const [roles, setRoles] = useState<RoleData[]>([]);
    const [groups, setGroups] = useState<GroupData[]>([]);

    const onSubmit = async (values: UserProfile) => {
        const response = await apiFetch<UserProfile>('/api/profile/me', 'POST', values);
        setUserProfile(response.data);
    };

    const fetchData = React.useCallback(async () => {
        try {
            const response = await apiFetch<UserProfile>('/api/profile/me', 'POST', {});
            setUserProfile(response.data);
            const roleResponse = await apiFetch<RoleData[]>('/api/profile/roles', 'GET');
            setRoles(roleResponse.data);
            const groupResponse = await apiFetch<GroupData[]>('/api/profile/groups', 'GET');
            setGroups(groupResponse.data);
        } catch (error) {
            console.error('Error fetching profile data:', error);
        }
    }, [apiFetch]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <Form
            onSubmit={onSubmit}
            initialValues={userProfile}
            mutators={{ ...myArrayMutators }}
            render={({ handleSubmit }) => (
                <form onSubmit={handleSubmit}>
                    <Grid2 container spacing={2}>
                        <Grid2 size={{ xs: 12 }}>
                            <Field name="settings.language">
                                {({ input }) => {
                                    return (
                                        <FormControl fullWidth>
                                            <InputLabel>{translate("language", language)}</InputLabel>
                                            <Select
                                                {...input}
                                                value={input.value || []}
                                                onChange={(event) => input.onChange(event.target.value)}
                                            >
                                                <MenuItem key="nl" value="nl">Nederlands</MenuItem>
                                                <MenuItem key="en" value="en">English</MenuItem>
                                            </Select>
                                        </FormControl>
                                    );
                                }}
                            </Field>
                        </Grid2>
                        <Grid2 size={{ xs: 12 }}>
                            <Field name="settings.theme">
                                {({ input }) => {
                                    return (
                                        <FormControl fullWidth>
                                            <InputLabel>{translate("theme", language)}</InputLabel>
                                            <Select
                                                {...input}
                                                value={input.value || []}
                                                onChange={(event) => input.onChange(event.target.value)}
                                            >
                                                <MenuItem key="followOS" value="followOS">{translate("followOS", language)}</MenuItem>
                                                <MenuItem key="dark" value="dark">{translate("dark", language)}</MenuItem>
                                                <MenuItem key="light" value="light">{translate("light", language)}</MenuItem>
                                            </Select>
                                        </FormControl>
                                    );
                                }}
                            </Field>
                        </Grid2>
                        <Grid2 size={{ xs: 12 }}>

                        </Grid2>
                        <Grid2 size={{ xs: 12 }}>
                            <Field name="roles">
                                {({ input }) => {
                                    return (
                                        <FormControl fullWidth>
                                            <InputLabel>Roles</InputLabel>
                                            <Select
                                                {...input}
                                                multiple
                                                value={input.value || []}
                                                onChange={(event) => input.onChange(event.target.value)}
                                            >
                                                {roles.map((role) => (
                                                    <MenuItem key={role.name} value={role.name}>
                                                        {role.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    );
                                }}
                            </Field>
                        </Grid2>
                        <Grid2 size={{ xs: 12 }}>
                            <Field name="groups">
                                {({ input }) => (
                                    <FormControl fullWidth>
                                        <InputLabel>Groups</InputLabel>
                                        <Select {...input} multiple>
                                            {groups.map((group) => (
                                                <MenuItem key={group.name} value={group.name}>
                                                    {group.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}
                            </Field>
                        </Grid2>
                        <Grid2 size={{ xs: 12 }}>
                            <Field name="createdAt">
                                {({ input }) => (
                                    <TextField {...input} label="Created At" fullWidth />
                                )}
                            </Field>
                        </Grid2>
                        <Grid2 size={{ xs: 12 }}>
                            <Field name="updatedAt">
                                {({ input }) => (
                                    <TextField {...input} label="Updated At" fullWidth />
                                )}
                            </Field>
                        </Grid2>
                        <Grid2 size={{ xs: 12 }}>
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