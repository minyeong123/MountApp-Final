import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
// 🛠️ 정확한 경로에서 불러옵니다.
import MountainCourse from '../../src/pages/home/MountainCourse';

export default function Page() {
    const { id } = useLocalSearchParams(); // URL에서 산 id(예: bukhan) 추출
    if (!id) return null;

    return (
        <View style={{ flex: 1 }}>
            {/* 상단 타이틀 바 숨기거나 설정 */}
            <Stack.Screen options={{ headerShown: true, title: "추천 코스" }} />
            {/* id를 핵심 컴포넌트에 prop으로 전달 */}
            <MountainCourse id={id} />
        </View>
    );
}