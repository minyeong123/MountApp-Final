import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Header() {
    const navigation = useNavigation();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // 1. 로그인 상태 확인 (AsyncStorage 사용)
    useEffect(() => {
        const checkLoginStatus = async () => {
            const token = await AsyncStorage.getItem("jwtToken");
            setIsLoggedIn(!!token);
        };
        checkLoginStatus();
    }, []);

    // 2. 로그아웃 핸들러
    const handleLogout = async () => {
        await AsyncStorage.removeItem("jwtToken");
        await AsyncStorage.removeItem("role");
        setIsLoggedIn(false);

        Alert.alert("알림", "로그아웃 되었습니다.");

        // 앱에서는 페이지 리로드 대신 스택 초기화나 로그인 화면으로 이동
        navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
        });
    };

    return (
        // header -> View / sticky top-0 -> Native에서는 보통 상단 고정 컴포넌트로 배치
        <View className="flex-row justify-between items-center p-4 bg-white shadow-md z-50 border-b border-gray-100">

            {/* 로고 영역 */}
            <TouchableOpacity
                onPress={() => navigation.navigate("Home")}
                className="flex-row items-center"
            >
                <Text className="text-2xl font-bold text-blue-600">🏔️ MountApp</Text>
            </TouchableOpacity>

            {/* 네비게이션 영역 */}
            <View className="flex-row items-center gap-x-4">
                <TouchableOpacity
                    onPress={() => navigation.navigate("Community")}
                >
                    <Text className="font-medium text-gray-600 active:text-blue-500">
                        커뮤니티
                    </Text>
                </TouchableOpacity>

                {isLoggedIn ? (
                    <View className="flex-row gap-x-3 items-center">
                        <TouchableOpacity onPress={() => navigation.navigate("MyPage")}>
                            <Text className="font-medium text-gray-600">마이페이지</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleLogout}
                            className="bg-gray-200 px-4 py-2 rounded-lg active:bg-gray-300"
                        >
                            <Text className="text-gray-700 font-semibold text-sm">로그아웃</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="flex-row gap-x-3">
                        <TouchableOpacity
                            onPress={() => navigation.navigate("Login")}
                        >
                            <Text className="font-medium text-gray-600">로그인</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => navigation.navigate("Join")}
                            className="bg-blue-500 px-4 py-2 rounded-lg active:bg-blue-600"
                        >
                            <Text className="text-white font-semibold text-sm">회원가입</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
}