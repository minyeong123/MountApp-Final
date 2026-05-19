import { Stack } from "expo-router";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";

export default function RootLayout() {
    useEffect(() => {
        SplashScreen.hideAsync();
    }, []);

    return (
        <Stack screenOptions={{ headerShown: false }}>
            {/* 1. 로그인/진입 화면 */}
            <Stack.Screen name="index" options={{ headerShown: false }} />

            {/* 2. 메인 탭 화면들 */}
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

            {/* 💡 3. 여기에 mountain/[id] 동적 라우트를 꼭 등록해 줍니다! */}
            <Stack.Screen name="mountain/[id]" options={{ headerShown: false }} />

            {/* 4. 공지사항 모달 */}
            <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: true, title: '공지사항' }} />
        </Stack>
    );
}