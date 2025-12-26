import { useState, useEffect } from 'react';
import { subscribeLabels, createLabel, updateLabel, deleteLabel } from '../services/labels';
import { useAuth } from './useAuth';

export const useLabels = () => {
    const { user } = useAuth();
    const [labels, setLabels] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user?.id) {
            setLabels([]);
            return;
        }

        setLoading(true);
        const unsubscribe = subscribeLabels(user.id, (data) => {
            setLabels(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user?.id]);

    const addLabel = async (name) => {
        if (!user?.id) return;
        await createLabel(user.id, name);
    };

    const editLabel = async (id, name) => {
        await updateLabel(id, name);
    };

    const removeLabel = async (id) => {
        await deleteLabel(id);
    };

    return {
        labels,
        loading,
        addLabel,
        editLabel,
        removeLabel,
    };
};
