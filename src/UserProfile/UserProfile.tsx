import React, { useEffect, useState } from 'react';
import { RoleData, UserProfile, GroupData } from "../Types.js";
import { useApplicationContext } from "../Components/ApplicationContext/useApplicationContext.js";
import UserProfileForm from "./UserProfileForm.js";

const UserProfileComponent: React.FC = () => {
    const { apiFetch, setProfile } = useApplicationContext();
    const [userProfile, setUserProfile] = useState<UserProfile>();
    const [roles, setRoles] = useState<RoleData[]>([]);
    const [groups, setGroups] = useState<GroupData[]>([]);
    const onSubmit = async (values: UserProfile) => {
        const response = await apiFetch<UserProfile>('/api/profile/me', 'POST', values);
        setUserProfile(response.data);
        setProfile(response.data);
    };

    const fetchData = React.useCallback(async () => {
        try {
            const response = await apiFetch<UserProfile>('/api/profile/me', 'GET');
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
        <UserProfileForm onSubmit={onSubmit} userProfile={userProfile} roles={roles} groups={groups} />

    );
};

export default UserProfileComponent;