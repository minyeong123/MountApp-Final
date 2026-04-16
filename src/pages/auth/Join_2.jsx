import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Alert, ActivityIndicator } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ChevronLeft, User, Phone, Mail, Calendar } from "lucide-react-native";
import axios from "axios";

export default function Join_2() {
    const navigation = useNavigation();
    const route = useRoute();

    // Step 1에서 넘어온 데이터 수신 (userid, password, nickname)
    const prevData = route.params || {};

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        emailId: '',
        emailDomain: 'naver.com',
        birthdate: '',
        gender: '' // '남성' 또는 '여성'
    });

    const [loading, setLoading] = useState(false);

    // 입력 핸들러
    const handleInputChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const isFormValid = formData.name && formData.phone && formData.emailId && formData.birthdate && formData.gender;

    // 최종 회원가입 요청 (서버 IP 설정 필요)
    const handleSubmit = async () => {
        if (!isFormValid) return;
        const SERVER_URL = "http://YOUR_SERVER_IP:8082";

        try {
            setLoading(true);
            const genderValue = formData.gender === "남성" ? "MALE" : "FEMALE";
            const fullEmail = `${formData.emailId}@${formData.emailDomain}`;

            const response = await axios.post(`${SERVER_URL}/api/auth/join`, {
                ...prevData,
                name: formData.name,
                phone: formData.phone,
                email: fullEmail,
                birthdate: formData.birthdate,
                gender: genderValue
            });

            if (response.status === 200) {
                Alert.alert("성공", "회원가입 성공! 로그인 페이지로 이동합니다.", [
                    { text: "확인", onPress: () => navigation.navigate('Login') }
                ]);
            }
        } catch (error) {
            Alert.alert("오류", error.response?.data || "회원가입에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>

                {/* 1. 헤더 */}
                <View className="flex-row items-center px-4 py-6 border-b border-gray-50 relative">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="absolute left-6 z-10">
                        <ChevronLeft size={24} color="#1f2937" strokeWidth={2.5} />
                    </TouchableOpacity>
                    <Text className="w-full text-center text-2xl font-bold text-gray-800">계정 정보</Text>
                </View>

                {/* 2. 진행 바 */}
                <View className="px-8 mt-8">
                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-indigo-500 font-bold text-base">Step 2/2</Text>
                        <Text className="text-gray-400 text-sm font-medium">계정 정보</Text>
                    </View>
                    <View className="flex-row gap-x-4">
                        <View className="flex-1 h-[5px] bg-indigo-500 rounded-full" />
                        <View className="flex-1 h-[5px] bg-indigo-500 rounded-full shadow-sm" />
                    </View>
                </View>

                {/* 3. 입력 폼 영역 */}
                <View className="px-8 mt-10 space-y-8">

                    {/* 이름 */}
                    <View className="mb-6">
                        <Text className="text-base font-bold text-gray-800 mb-3">이름 <Text className="text-red-400">*</Text></Text>
                        <View className="relative justify-center">
                            <View className="absolute left-4 z-10"><User size={24} color="#d1d5db" /></View>
                            <TextInput
                                value={formData.name}
                                onChangeText={(val) => handleInputChange("name", val)}
                                placeholder="실명을 입력해주세요"
                                className="w-full h-14 pl-12 pr-5 bg-white border border-gray-200 rounded-xl text-gray-700"
                            />
                        </View>
                    </View>

                    {/* 휴대전화 */}
                    <View className="mb-6">
                        <Text className="text-base font-bold text-gray-800 mb-3">휴대전화 <Text className="text-red-400">*</Text></Text>
                        <View className="flex-row gap-x-2">
                            <View className="w-24 h-14 justify-center items-center bg-gray-50 border border-gray-200 rounded-xl">
                                <Text className="text-gray-700 font-medium">🇰🇷 +82</Text>
                            </View>
                            <TextInput
                                keyboardType="phone-pad"
                                value={formData.phone}
                                onChangeText={(val) => handleInputChange("phone", val)}
                                placeholder="번호 입력 ('-' 제외)"
                                className="flex-1 h-14 px-5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700"
                            />
                        </View>
                    </View>

                    {/* 이메일 */}
                    <View className="mb-6">
                        <Text className="text-base font-bold text-gray-800 mb-3">이메일 <Text className="text-red-400">*</Text></Text>
                        <View className="flex-row items-center gap-x-2">
                            <View className="flex-1 relative justify-center">
                                <View className="absolute left-4 z-10"><Mail size={20} color="#d1d5db" /></View>
                                <TextInput
                                    autoCapitalize="none"
                                    value={formData.emailId}
                                    onChangeText={(val) => handleInputChange("emailId", val)}
                                    placeholder="이메일 앞자리"
                                    className="w-full h-14 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-700"
                                />
                            </View>
                            <Text className="text-gray-400 font-medium">@</Text>
                            <View className="flex-1 h-14 px-4 justify-center bg-gray-50 border border-gray-200 rounded-xl">
                                <Text className="text-gray-700 font-medium">naver.com</Text>
                                {/* 도메인 선택은 필요시 Modal/Picker로 구현 */}
                            </View>
                        </View>
                    </View>

                    {/* 생년월일 */}
                    <View className="mb-6">
                        <Text className="text-base font-bold text-gray-800 mb-3">생년월일 <Text className="text-red-400">*</Text></Text>
                        <View className="relative justify-center">
                            <View className="absolute left-4 z-10"><Calendar size={24} color="#d1d5db" /></View>
                            <TextInput
                                keyboardType="number-pad"
                                value={formData.birthdate}
                                onChangeText={(val) => handleInputChange("birthdate", val)}
                                placeholder="YYYY-MM-DD"
                                className="w-full h-14 pl-12 pr-5 bg-white border border-gray-200 rounded-xl text-gray-700"
                            />
                        </View>
                    </View>

                    {/* 성별 */}
                    <View className="mb-10">
                        <Text className="text-base font-bold text-gray-800 mb-3">성별 <Text className="text-red-400">*</Text></Text>
                        <View className="flex-row gap-x-3">
                            {['남성', '여성'].map((gender) => (
                                <TouchableOpacity
                                    key={gender}
                                    onPress={() => handleInputChange("gender", gender)}
                                    className={`flex-1 h-16 rounded-xl border items-center justify-center ${
                                        formData.gender === gender
                                            ? 'bg-white border-indigo-400 ring-1 ring-indigo-400'
                                            : 'bg-white border-gray-200'
                                    }`}
                                >
                                    <Text className={`text-base font-medium ${formData.gender === gender ? 'text-indigo-500' : 'text-gray-400'}`}>
                                        {gender}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                {/* 4. 하단 완료 버튼 */}
                <View className="px-8 py-10">
                    <TouchableOpacity
                        disabled={!isFormValid || loading}
                        onPress={handleSubmit}
                        className={`w-full h-16 rounded-2xl items-center justify-center shadow-lg ${
                            isFormValid && !loading ? 'bg-indigo-500' : 'bg-indigo-200'
                        }`}
                    >
                        {loading ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <Text className="text-xl font-bold text-white">완료</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}