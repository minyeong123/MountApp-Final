import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ScrollView, SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // 설치 필요: expo install @react-native-async-storage/async-storage
import { User, Lock, Eye, EyeOff } from "lucide-react-native";
import axios from "axios";

// 로고 이미지 경로 (프로젝트 구조에 맞게 수정)
const logo = require("../assets/logo.png");

export default function LoginPage() {
    const navigation = useNavigation();
    const [userid, setUserid] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // 🔥 기존 데이터 삭제 (AsyncStorage 사용)
    useEffect(() => {
        const clearSession = async () => {
            await AsyncStorage.multiRemove(["jwtToken", "role"]);
            delete axios.defaults.headers.common["Authorization"];
        };
        clearSession();
    }, []);

    // JWT 해독 로직 (네이티브용)
    const parseJwt = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            // 네이티브 환경에서는 base-64 라이브러리 사용을 권장하지만, 간단한 처리를 위해 작성
            const jsonPayload = decodeURIComponent(escape(atob(base64)));
            return JSON.parse(jsonPayload);
        } catch (e) { return {}; }
    };

    const handleLogin = async () => {
        if (!userid || !password) {
            Alert.alert("알림", "아이디와 비밀번호를 모두 입력해주세요.");
            return;
        }

        const SERVER_URL = "http://YOUR_SERVER_IP:8082";
        try {
            const response = await axios.post(`${SERVER_URL}/api/auth/login`, { userid, password });
            if (response.status === 200) {
                const token = response.data.token;
                // const decodedToken = parseJwt(token); // 필요 시 해독
                const role = response.data.role || "user";

                // AsyncStorage에 저장
                await AsyncStorage.setItem("jwtToken", token);
                await AsyncStorage.setItem("role", role);

                axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

                Alert.alert("성공", "로그인 되었습니다!");
                navigation.replace("Home"); // 뒤로가기 방지를 위해 replace 사용
            }
        } catch (error) {
            Alert.alert("로그인 실패", "아이디 또는 비밀번호가 일치하지 않습니다.");
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
                <View className="px-10 items-center">

                    {/* 서비스 로고 */}
                    <Image source={logo} className="w-28 h-28 rounded-full mb-4" resizeMode="contain" />
                    <Text className="text-[30px] font-bold text-gray-900 mb-2">로그인</Text>
                    <Text className="text-gray-500 text-sm mb-10 text-center">계정에 로그인하여 서비스를 이용해보세요.</Text>

                    <View className="w-full space-y-4">
                        {/* 아이디 입력창 */}
                        <View className="relative mb-4">
                            <View className="absolute left-4 top-[18px] z-10"><User size={20} color="#9ca3af" /></View>
                            <TextInput
                                placeholder="이메일 또는 아이디"
                                value={userid}
                                onChangeText={setUserid}
                                autoCapitalize="none"
                                className="w-full pl-12 pr-4 py-4 bg-gray-100 rounded-2xl text-sm"
                            />
                        </View>

                        {/* 비밀번호 입력창 */}
                        <View className="relative mb-4">
                            <View className="absolute left-4 top-[18px] z-10"><Lock size={20} color="#9ca3af" /></View>
                            <TextInput
                                placeholder="비밀번호"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                className="w-full pl-12 pr-12 py-4 bg-gray-100 rounded-2xl text-sm"
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-[18px]"
                            >
                                {showPassword ? <EyeOff size={20} color="#9ca3af" /> : <Eye size={20} color="#9ca3af" />}
                            </TouchableOpacity>
                        </View>

                        {/* 아이디/비밀번호 찾기 */}
                        <View className="flex-row justify-end px-1 mb-6">
                            <View className="flex-row items-center">
                                <TouchableOpacity onPress={() => navigation.navigate("FindId")}>
                                    <Text className="text-gray-600 text-sm font-medium">아이디 찾기</Text>
                                </TouchableOpacity>
                                <Text className="text-gray-300 mx-2 text-[10px]">|</Text>
                                <TouchableOpacity onPress={() => navigation.navigate("FindPw")}>
                                    <Text className="text-gray-600 text-sm font-medium">비밀번호 찾기</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* 로그인 버튼 */}
                        <TouchableOpacity
                            onPress={handleLogin}
                            className="w-full bg-indigo-500 py-4 rounded-2xl shadow-lg items-center"
                        >
                            <Text className="text-white font-bold text-lg">로그인</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 소셜 로그인 섹션 */}
                    <View className="w-full mt-12">
                        <View className="flex-row items-center mb-8">
                            <View className="flex-1 h-[1px] bg-gray-200" />
                            <Text className="mx-3 text-[12px] text-gray-400 font-medium">SNS 간편 로그인</Text>
                            <View className="flex-1 h-[1px] bg-gray-200" />
                        </View>

                        <View className="flex-row justify-center gap-x-4">
                            <SocialBtn color="#FEE500" label="K" />
                            <SocialBtn color="#03C75A" label="N" />
                            <SocialBtn color="#FFFFFF" label="G" isBorder />
                            <SocialBtn color="#181717" label="H" />
                        </View>
                    </View>

                    <TouchableOpacity onPress={() => navigation.navigate("Join_1")} className="mt-10 mb-5">
                        <Text className="text-sm text-gray-500">
                            아직 계정이 없으신가요? <Text className="text-indigo-600 font-bold">회원가입</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// 소셜 버튼 컴포넌트 (네이티브용 커스텀)
function SocialBtn({ color, label, isBorder }) {
    return (
        <TouchableOpacity
            style={{ backgroundColor: color }}
            className={`w-12 h-12 rounded-full items-center justify-center shadow-sm ${isBorder ? 'border border-gray-100' : ''}`}
        >
            <Text style={{ color: color === '#FFFFFF' ? '#000' : '#FFF' }} className="font-bold">{label}</Text>
        </TouchableOpacity>
    );
}