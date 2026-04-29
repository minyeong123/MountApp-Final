// app/mate/[id].jsx
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import MateDetail from '../../src/pages/mate/MateDetail'; // mate 폴더 확인!

export default function Page() {
    const { id } = useLocalSearchParams();
    if (!id) return null;
    return <MateDetail id={id} />;
}