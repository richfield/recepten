import React, { useEffect, useState } from 'react';
import { Form, Field } from 'react-final-form';
import { Select, MenuItem, Button, Grid2, InputLabel, FormControl, Checkbox, ListItemText, OutlinedInput } from '@mui/material';
import { RoleData, UserProfile, GroupData } from "../Types.js";
import { useApplicationContext } from "../Components/ApplicationContext/useApplicationContext.js";
import myArrayMutators from "./mutators.js";
import { translate } from "../utils.js";

const UserProfileComponent: React.FC = () => {
    const { apiFetch, language } = useApplicationContext();
    const [userProfile, setUserProfile] = useState<UserProfile>();
    const [roles, setRoles] = useState<RoleData[]>([]);
    const [groups, setGroups] = useState<GroupData[]>([]);
    const [profileRoles, setProfileRoles] = useState<RoleData[]>([]);
    const onSubmit = async (values: UserProfile) => {
        const response = await apiFetch<UserProfile>('/api/profile/me', 'POST', values);
        setUserProfile(response.data);
    };

    const fetchData = React.useCallback(async () => {
        try {
            const response = await apiFetch<UserProfile>('/api/profile/me', 'GET');
            setUserProfile(response.data);
            setProfileRoles(response.data.roles);
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
    console.log({ ur: userProfile?.roles })
    const toggleRole = (roles: RoleData[], role: RoleData) => {
        const index = roles.findIndex((r) => r._id === role._id);
        console.log({index, role, profileRoles})
        if (index >= 0) {
            // Role is already selected, so remove it
            const returnRoles = roles.filter((r) => r._id !== role._id);
            console.log({returnRoles})
            return returnRoles
        } else {
            // Role is not selected, so add it
            const returnRoles = [...roles, role];
            console.log({ returnRoles })
            return returnRoles
        }
    };
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
                                                <MenuItem key="notSet" value="">Kies</MenuItem>
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
                                                <MenuItem key="notSet" value="">Kies</MenuItem>
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
                                {({ input }) => (
                                    <FormControl fullWidth>
                                        <InputLabel id="roles-select-label">Select Roles</InputLabel>
                                        <Select
                                            {...input}
                                            labelId="roles-select-label"
                                            multiple
                                            value={input.value || []} // Default to an empty array
                                            onChange={(event) => {
                                                const newSelectedRoles = event.target.value as RoleData[];
                                                const currentRoles = input.value || [];

                                                // Find the toggled role by comparing arrays
                                                const toggledRole = roles.find(
                                                    (role) =>
                                                        {
                                                            console.log(role)
                                                            return !currentRoles.some((r: { _id: string; }) => r._id === role._id) ||
                                                                !newSelectedRoles.some((r) => r._id === role._id);
                                                        }
                                                );

                                                // Update roles by toggling the role
                                                const updatedRoles = toggleRole(currentRoles, toggledRole!);
                                                input.onChange(updatedRoles);
                                            }}
                                            renderValue={(selected) =>
                                                (selected as RoleData[]).map((role) => role.name).join(', ')
                                            }
                                        >
                                            {roles.map((role) => (
                                                <MenuItem
                                                    key={role._id}
                                                    value={role._id}
                                                    selected={(input.value || []).some((r: RoleData) => r._id === role._id)}
                                                >
                                                    <Checkbox checked={(input.value || []).some((r: RoleData) => r._id === role._id)} />
                                                    <ListItemText primary={role.name} />

                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}
                            </Field>
                            <Field name="roles">
                                {({ input }) => {
                                    return (
                                        <FormControl fullWidth>
                                            <InputLabel>Roles</InputLabel>
                                            <Select
                                                {...input}
                                                multiple
                                                value={input.value || []}
                                                onChange={(event) => {
                                                    const selectedRoles = event.target.value;
                                                    console.log({ event })
                                                    setProfileRoles(selectedRoles);
                                                    input.onChange(selectedRoles);
                                                }}
                                                input={<OutlinedInput label="Roles" />}
                                                renderValue={(selected) => selected.map((r: RoleData) => r.name).join(', ')}
                                            >
                                                {roles.map((role) => (
                                                    <MenuItem key={role.name} value={role._id}>
                                                        {/* <Checkbox checked={input.value.map((r: RoleData) => r.name).includes(role.name)} /> */}
                                                        <ListItemText primary={role.name} />
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
                                        <Select
                                            {...input}
                                            multiple
                                            value={input.value || []}
                                            onChange={(event) => {
                                                console.log({ v: event.target.value })
                                                return input.onChange(event.target.value);
                                            }}
                                            input={<OutlinedInput label="Groups" />}
                                            renderValue={(selected) => selected.map((m: GroupData) => m.name).join(', ')}
                                        >
                                            {groups.map((group) => (
                                                <MenuItem key={group.name} value={group._id}>
                                                    <Checkbox checked={input.value.map((m: GroupData) => m.name).includes(group.name)} />
                                                    <ListItemText primary={group.name} />
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
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

export default UserProfileComponent;
