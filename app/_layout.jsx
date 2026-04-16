import { Stack } from "expo-router";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";

export default function RootLayout() {
    useEffect(() => {
        SplashScreen.hideAsync();
    }, []);

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: true, title: '공지사항' }} />
        </Stack>
    );
}