import { Stack } from "expo-router";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";

export default function RootLayout() {
    useEffect(() => {
        SplashScreen.hideAsync();
    }, []);

    return (
        <Stack screenOptions={{ headerShown: false }}>
            {/* 1. 최상위 index(로그인)를 첫 화면으로 명시합니다. */}
            <Stack.Screen name="index" options={{ headerShown: false }} />

            {/* 2. 그 다음 탭 화면을 등록합니다. */}
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

            {/* 3. 모달 및 기타 화면 */}
            <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: true, title: '공지사항' }} />
        </Stack>
    );
}