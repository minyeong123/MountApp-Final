import React from "react";
import { Tabs } from "expo-router";
import { Text, StyleSheet, Platform } from "react-native";
// 캡처 화면의 아이콘들과 가장 유사한 Lucide 아이콘들입니다.
import { House, Map, UserSearch, MessageSquareText, CircleUserRound } from "lucide-react-native";
import "../../global.css";
export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: "#2563eb", // 활성화 시 좀 더 진한 파란색
                tabBarInactiveTintColor: "#6b7280", // 비활성화 회색
            }}
        >
            <Tabs.Screen
                name="index"
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
            {/* 아래 탭들은 파일이 없어도 레이아웃 구성을 위해 추가합니다.
          실제 파일(mate.jsx 등)을 만들면 바로 연결됩니다. */}
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
                name="profile"
                options={{
                    title: "마이페이지",
                    tabBarIcon: ({ color }) => <CircleUserRound size={24} color={color} />,
                    tabBarLabel: ({ color }) => <Text style={[styles.tabLabel, { color }]}>마이페이지</Text>,
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        height: 85, // 캡처 화면처럼 넉넉한 높이
        backgroundColor: "white",
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
        paddingBottom: Platform.OS === "ios" ? 30 : 15, // 기종별 하단 여백 처리
        paddingTop: 10,
    },
    tabLabel: {
        fontSize: 12,
        fontWeight: "700",
        marginTop: 4,
    },
});
