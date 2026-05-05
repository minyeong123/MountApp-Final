import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ScrollView, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, Lock, Eye, EyeOff } from "lucide-react-native"; // 아이콘 추가
import axios from "axios";

const logo = require("../../../assets/images/logo.png");

// 소셜 아이콘 (이미지가 있다면 경로를 수정하세요)
const kakaoIcon = require("../../../assets/images/kakao.png");
const naverIcon = require("../../../assets/images/naver.png");
const googleIcon = require("../../../assets/images/google.png");
const facebookIcon = require("../../../assets/images/facebook.png");
const githubIcon = require("../../../assets/images/github.png");

export default function LoginPage() {
    const router = useRouter();
    const [userid, setUserid] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const clearSession = async () => {
            await AsyncStorage.multiRemove(["jwtToken", "role"]);
            delete axios.defaults.headers.common["Authorization"];
        };
        clearSession();
    }, []);

    const handleLogin = async () => {
        if (!userid || !password) {
            Alert.alert("알림", "아이디와 비밀번호를 모두 입력해주세요.");
            return;
        }

        const SERVER_URL = "http://10.0.2.2:8082";
        try {
            const response = await axios.post(`${SERVER_URL}/api/auth/login`, { userid, password });

            if (response.status === 200) {
                const token = response.data.token;
                await AsyncStorage.setItem("jwtToken", token);
                axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

                Alert.alert("성공", "로그인 되었습니다!", [
                    { text: "확인", onPress: () => router.replace("/(tabs)/home") }
                ]);
            }
        } catch (error) {
            console.error(error);
            Alert.alert("로그인 실패", "아이디 또는 비밀번호가 일치하지 않습니다.");
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
                <View className="px-8 items-center py-10">

                    {/* 서비스 로고 & 헤더 */}
                    <Image source={logo} className="w-28 h-28 rounded-full mb-4" resizeMode="cover" />
                    <Text className="text-[30px] font-bold text-gray-900 mb-2">로그인</Text>
                    <Text className="text-gray-500 text-sm mb-10 text-center">계정에 로그인하여 서비스를 이용해보세요.</Text>

                    <View className="w-full">
                        {/* 아이디 입력창 */}
                        <View className="relative mb-4">
                            <View className="absolute left-4 top-[15px] z-10">
                                <User size={20} color="#9ca3af" />
                            </View>
                            <TextInput
                                placeholder="이메일 또는 아이디"
                                value={userid}
                                onChangeText={setUserid}
                                autoCapitalize="none"
                                className="w-full pl-12 pr-5 py-4 bg-[#F3F4F6] rounded-[18px] text-sm text-gray-800"
                            />
                        </View>

                        {/* 비밀번호 입력창 */}
                        <View className="relative mb-4">
                            <View className="absolute left-4 top-[15px] z-10">
                                <Lock size={20} color="#9ca3af" />
                            </View>
                            <TextInput
                                placeholder="비밀번호"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                className="w-full pl-12 pr-12 py-4 bg-[#F3F4F6] rounded-[18px] text-sm text-gray-800"
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-[15px]"
                            >
                                {showPassword ? <EyeOff size={20} color="#9ca3af" /> : <Eye size={20} color="#9ca3af" />}
                            </TouchableOpacity>
                        </View>

                        {/* 로그인 유지 및 찾기 링크 */}
                        <View className="flex-row justify-between items-center mb-6 px-1">
                            <TouchableOpacity className="flex-row items-center">
                                <View className="w-4 h-4 border border-gray-300 rounded bg-white mr-2" />
                                <Text className="text-sm text-gray-600">로그인 유지</Text>
                            </TouchableOpacity>
                            <View className="flex-row items-center">
                                <Text className="text-gray-600 text-sm">아이디 찾기</Text>
                                <Text className="text-gray-300 mx-2 text-[10px]">|</Text>
                                <Text className="text-gray-600 text-sm">비밀번호 찾기</Text>
                            </View>
                        </View>

                        {/* 로그인 버튼 */}
                        <TouchableOpacity
                            onPress={handleLogin}
                            className="w-full bg-[#6366F1] py-4 rounded-[18px] items-center shadow-lg shadow-indigo-200"
                        >
                            <Text className="text-white font-bold text-lg">로그인</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 소셜 로그인 섹션 */}
                    <View className="w-full mt-10">
                        <View className="flex-row items-center mb-8">
                            <View className="flex-1 h-[1px] bg-gray-200" />
                            <Text className="mx-3 text-[12px] text-gray-400 font-medium">SNS 계정으로 간편 로그인</Text>
                            <View className="flex-1 h-[1px] bg-gray-200" />
                        </View>

                        <View className="flex-row justify-center gap-5">
                            <SocialIcon color="#FEE500" icon={kakaoIcon} className="w-12 h-12" />
                            <SocialIcon color="#03C75A" icon={naverIcon} className="w-12 h-12 " imageScale="w-[40%] h-[40%]" />
                            <SocialIcon color="#FFFFFF" icon={googleIcon} className="w-12 h-12 border border-gray-200 shadow-sm" />
                            <SocialIcon color="#24292E" icon={githubIcon} className="w-12 h-12" />
                            <SocialIcon color="#1877F2" icon={facebookIcon} className="w-12 h-12" />
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={() => router.push("/auth/join_1")}
                        className="mt-10"
                    >
                        <Text className="text-sm text-gray-500">
                            아직 계정이 없으신가요? <Text className="text-[#6366F1] font-bold">회원가입</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// 소셜 버튼 내부 컴포넌트
function SocialIcon({ color, icon, className = "", imageScale = "w-[55%] h-[55%]" }) {
    return (
        <TouchableOpacity
            style={{ backgroundColor: color }}
            className={`rounded-full items-center justify-center shadow-sm ${className}`}
        >
            {/* 다른 애들은 기본값 55%로 나오고, 네이버만 위에서 넘겨준 40%로 작아집니다 */}
            <Image source={icon} className={imageScale} resizeMode="contain" />
        </TouchableOpacity>
    );
}