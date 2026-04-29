import React from 'react';
import { useLocalSearchParams } from 'expo-router';
// 경로를 확실하게 src/pages/home/MountainDetail로 잡아야 합니다.
import MountainDetail from '../../src/pages/home/MountainDetail';

export default function Page() {
    const { id } = useLocalSearchParams();

    if (!id) return null;

    // MountainDetail 컴포넌트에 id를 넘겨줍니다.
    return <MountainDetail id={id} />;
}