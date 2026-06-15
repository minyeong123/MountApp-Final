import React, { useState } from "react";
// 1. useSegments 임포트 추가 (현재 경로 확인용)
import { Tabs, useSegments } from "expo-router";
import { Text, StyleSheet, Platform, View } from "react-native";
import { House, Map, UserSearch, MessageSquareText, CircleUserRound,HeartPulse } from "lucide-react-native";
import "../../global.css";

// 컴포넌트 임포트
import NeogulGuide from "../../src/components/NeogulGuide";
import ChatBot from "../../src/pages/chatbot/ChatBot";

export default function TabLayout() {
    // 챗봇 열림/닫힘 상태 관리
    const [isChatOpen, setIsChatOpen] = useState(false);

    // 2. 현재 경로의 세그먼트(배열 형태) 가져오기
    const segments = useSegments();

    // 3. 현재 화면이 홈인지 확인
    // Expo Router 구조상 (tabs)/home 경로에 있으면 segments 배열에 "home"이 포함됩니다.
    const isHomeScreen = segments[segments.length - 1] === "home" || segments.length === 1;

    return (
        <View style={{ flex: 1 }}>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: styles.tabBar,
                    tabBarActiveTintColor: "#2563eb",
                    tabBarInactiveTintColor: "#6b7280",
                }}
            >
                <Tabs.Screen
                    name="home"
                    options={{
                        title: "홈",
                        tabBarIcon: ({ color }) => <House size={24} color={color} />,
                        tabBarLabel: ({ color }) => <Text style={[styles.tabLabel, { color }]}>홈</Text>,
                    }}
                />
                <Tabs.Screen
                    name="map"
                    options={{
                        title: "지도",
                        tabBarIcon: ({ color }) => <Map size={24} color={color} />,
                        tabBarLabel: ({ color }) => <Text style={[styles.tabLabel, { color }]}>지도</Text>,
                    }}
                />
                <Tabs.Screen
                    name="mate"
                    options={{
                        title: "메이트",
                        tabBarIcon: ({ color }) => <UserSearch size={24} color={color} />,
                        tabBarLabel: ({ color }) => <Text style={[styles.tabLabel, { color }]}>메이트</Text>,
                    }}
                />
                <Tabs.Screen
                    name="community"
                    options={{
                        title: "커뮤니티",
                        tabBarIcon: ({ color }) => <MessageSquareText size={24} color={color} />,
                        tabBarLabel: ({ color }) => <Text style={[styles.tabLabel, { color }]}>커뮤니티</Text>,
                    }}
                />
                <Tabs.Screen
                    name="health"
                    options={{
                        title: "건강",
                        tabBarIcon: ({ color }) => <HeartPulse size={24} color={color} />,
                        tabBarLabel: ({ color }) => <Text style={[styles.tabLabel, { color }]}>건강</Text>,
                    }}
                />
                <Tabs.Screen
                    name="mypage"
                    options={{
                        title: "마이페이지",
                        tabBarIcon: ({ color }) => <CircleUserRound size={24} color={color} />,
                        tabBarLabel: ({ color }) => <Text style={[styles.tabLabel, { color }]}>마이페이지</Text>,
                    }}
                />
            </Tabs>

            {/* --- 4. 홈 화면일 때만 너굴 AI 버튼과 챗봇 모달 표시 --- */}
            {isHomeScreen && (
                <>
                    <NeogulGuide onOpen={() => setIsChatOpen(true)} />
                    <ChatBot
                        visible={isChatOpen}
                        onClose={() => setIsChatOpen(false)}
                    />
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        height: 85,
        backgroundColor: "white",
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
        paddingBottom: Platform.OS === "ios" ? 30 : 15,
        paddingTop: 10,
    },
    tabLabel: {
        fontSize: 12,
        fontWeight: "700",
        marginTop: 4,
    },
});