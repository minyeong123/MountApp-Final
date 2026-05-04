import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ChevronLeft, User, Phone, Mail, Calendar } from "lucide-react-native";
import axios from "axios";

export default function Join_2() {
    const router = useRouter();
    const params = useLocalSearchParams(); // Step 1(userid, password, nickname) 데이터 수신

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        emailId: '',
        emailDomain: 'naver.com',
        birthdate: '',
        gender: ''
    });

    const [loading, setLoading] = useState(false);

    const handleInputChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 모든 필수 항목 입력 여부 확인
    const isFormValid = formData.name && formData.phone && formData.emailId && formData.birthdate && formData.gender;

    const handleSubmit = async () => {
        if (!isFormValid) return;

        // Android 에뮬레이터 접속 주소 (기기 테스트 시 본인 PC IP로 변경 필요)
        const SERVER_URL = "http://10.0.2.2:8082";

        try {
            setLoading(true);
            const genderValue = formData.gender === "남성" ? "MALE" : "FEMALE";
            const fullEmail = `${formData.emailId}@${formData.emailDomain}`;

            // Step 1 데이터와 Step 2 데이터를 통합하여 전송
            const response = await axios.post(`${SERVER_URL}/api/auth/join`, {
                userid: params.userid,
                password: params.password,
                nickname: params.nickname,
                name: formData.name,
                phone: formData.phone,
                email: fullEmail,
                birthdate: formData.birthdate,
                gender: genderValue
            });

            if (response.status === 200) {
                Alert.alert("성공", "회원가입이 완료되었습니다! 🎉", [
                    { text: "로그인하러 가기", onPress: () => router.replace('/') }
                ]);
            }
        } catch (error) {
            console.error("Join Error:", error);
            Alert.alert("오류", error.response?.data || "회원가입 처리 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* 키보드가 입력을 가리지 않도록 설정 */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">

                    {/* 1. 헤더 */}
                    <View className="flex-row items-center px-4 py-6 border-b border-gray-50 relative">
                        <TouchableOpacity onPress={() => router.back()} className="absolute left-6 z-10 p-1">
                            <ChevronLeft size={24} color="#1f2937" strokeWidth={2.5} />
                        </TouchableOpacity>
                        <Text className="w-full text-center text-2xl font-bold text-gray-800">계정 정보</Text>
                    </View>

                    {/* 2. 진행 바 */}
                    <View className="px-8 mt-8">
                        <View className="flex-row justify-between items-center mb-3">
                            <Text className="text-indigo-500 font-bold text-base">Step 2/2</Text>
                            <Text className="text-gray-400 text-sm font-medium">상세 정보 입력</Text>
                        </View>
                        <View className="flex-row gap-x-4">
                            <View className="flex-1 h-[5px] bg-indigo-500 rounded-full" />
                            <View className="flex-1 h-[5px] bg-indigo-500 rounded-full shadow-sm" />
                        </View>
                    </View>

                    {/* 3. 입력 폼 영역 */}
                    <View className="px-8 mt-10 space-y-6">

                        {/* 이름 */}
                        <View className="mb-4">
                            <Text className="text-sm font-bold text-gray-700 mb-2">이름 <Text className="text-red-400">*</Text></Text>
                            <View className="relative justify-center">
                                <View className="absolute left-4 z-10"><User size={22} color="#9ca3af" /></View>
                                <TextInput
                                    value={formData.name}
                                    onChangeText={(val) => handleInputChange("name", val)}
                                    placeholder="실명을 입력해주세요"
                                    className="w-full h-14 pl-12 pr-5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-700"
                                />
                            </View>
                        </View>

                        {/* 휴대전화 */}
                        <View className="mb-4">
                            <Text className="text-sm font-bold text-gray-700 mb-2">휴대전화 <Text className="text-red-400">*</Text></Text>
                            <View className="flex-row gap-x-2">
                                <View className="w-24 h-14 justify-center items-center bg-gray-100 border border-gray-200 rounded-2xl">
                                    <Text className="text-gray-700 font-medium">🇰🇷 +82</Text>
                                </View>
                                <TextInput
                                    keyboardType="phone-pad"
                                    value={formData.phone}
                                    onChangeText={(val) => handleInputChange("phone", val)}
                                    placeholder="'-' 제외 번호 입력"
                                    className="flex-1 h-14 px-5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-700"
                                />
                            </View>
                        </View>

                        {/* 이메일 */}
                        <View className="mb-4">
                            <Text className="text-sm font-bold text-gray-700 mb-2">이메일 <Text className="text-red-400">*</Text></Text>
                            <View className="flex-row items-center gap-x-2">
                                <View className="flex-1 relative justify-center">
                                    <View className="absolute left-4 z-10"><Mail size={18} color="#9ca3af" /></View>
                                    <TextInput
                                        autoCapitalize="none"
                                        value={formData.emailId}
                                        onChangeText={(val) => handleInputChange("emailId", val)}
                                        placeholder="이메일 주소"
                                        className="w-full h-14 pl-12 pr-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-700"
                                    />
                                </View>
                                <Text className="text-gray-400 font-medium">@</Text>
                                <View className="flex-1 h-14 bg-gray-50 border border-gray-100 rounded-2xl justify-center px-4">
                                    {/* 모바일에서는 Select 대신 간단한 텍스트나 Modal을 쓰지만, 여기서는 기본값 고정 예시 */}
                                    <Text className="text-gray-700">naver.com</Text>
                                </View>
                            </View>
                        </View>

                        {/* 생년월일 */}
                        <View className="mb-4">
                            <Text className="text-sm font-bold text-gray-700 mb-2">생년월일 <Text className="text-red-400">*</Text></Text>
                            <View className="relative justify-center">
                                <View className="absolute left-4 z-10"><Calendar size={22} color="#9ca3af" /></View>
                                <TextInput
                                    keyboardType="number-pad"
                                    value={formData.birthdate}
                                    onChangeText={(val) => handleInputChange("birthdate", val)}
                                    placeholder="YYYY-MM-DD (8자리)"
                                    className="w-full h-14 pl-12 pr-5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-700"
                                />
                            </View>
                        </View>

                        {/* 성별 선택 */}
                        <View className="mb-10">
                            <Text className="text-sm font-bold text-gray-700 mb-2">성별 <Text className="text-red-400">*</Text></Text>
                            <View className="flex-row gap-x-3">
                                {['남성', '여성'].map((gender) => (
                                    <TouchableOpacity
                                        key={gender}
                                        activeOpacity={0.7}
                                        onPress={() => handleInputChange("gender", gender)}
                                        className={`flex-1 h-16 rounded-2xl border items-center justify-center ${
                                            formData.gender === gender
                                                ? 'bg-white border-indigo-500 shadow-sm'
                                                : 'bg-gray-50 border-gray-100'
                                        }`}
                                    >
                                        <Text className={`text-base font-bold ${formData.gender === gender ? 'text-indigo-600' : 'text-gray-400'}`}>
                                            {gender}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* 4. 하단 완료 버튼 */}
                    <View className="px-8 py-10 mt-auto">
                        <TouchableOpacity
                            disabled={!isFormValid || loading}
                            onPress={handleSubmit}
                            activeOpacity={0.8}
                            className={`w-full h-16 rounded-2xl items-center justify-center shadow-lg ${
                                isFormValid && !loading ? 'bg-indigo-600 shadow-indigo-100' : 'bg-gray-100'
                            }`}
                        >
                            {loading ? (
                                <ActivityIndicator color="#ffffff" />
                            ) : (
                                <Text className={`text-xl font-bold ${isFormValid ? 'text-white' : 'text-gray-300'}`}>가입 완료</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}