import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Modal } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ChevronLeft, User, Phone, Mail, Calendar, X, ChevronRight } from "lucide-react-native";
import axios from "axios";

export default function Join_2() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        emailId: '',
        emailDomain: 'naver.com',
        birthdate: '',
        gender: ''
    });

    const [loading, setLoading] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [pickerMode, setPickerMode] = useState('calendar'); // 'calendar' | 'year' | 'month'
    const [currentNavDate, setCurrentNavDate] = useState(() => new Date());

    const handleInputChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const isFormValid = formData.name && formData.phone && formData.emailId && formData.birthdate && formData.gender;

    const navYear = currentNavDate.getFullYear();
    const navMonth = currentNavDate.getMonth();

    const moveMonth = (step) => {
        const nextDate = new Date(navYear, navMonth + step, 1);
        setCurrentNavDate(nextDate);
    };

    const generateCalendarDays = () => {
        const startOfMonth = new Date(navYear, navMonth, 1);
        const endOfMonth = new Date(navYear, navMonth + 1, 0);

        const startDayOfWeek = startOfMonth.getDay();
        const totalDays = endOfMonth.getDate();

        const daysArray = [];

        for (let i = 0; i < startDayOfWeek; i++) {
            daysArray.push(null);
        }
        for (let i = 1; i <= totalDays; i++) {
            daysArray.push(i);
        }
        return daysArray;
    };

    const calendarDays = generateCalendarDays();

    const handleSelectDay = (day) => {
        if (!day) return;
        const formattedMonth = String(navMonth + 1).padStart(2, '0');
        const formattedDay = String(day).padStart(2, '0');
        const selectedString = `${navYear}-${formattedMonth}-${formattedDay}`;

        handleInputChange("birthdate", selectedString);
        setShowCalendar(false);
        setPickerMode('calendar');
    };

    const thisYear = new Date().getFullYear();
    const quickYears = Array.from({ length: 100 }, (_, i) => thisYear - i);
    const quickMonths = Array.from({ length: 12 }, (_, i) => i);

    const handleSubmit = async () => {
        if (!isFormValid) return;

        const SERVER_URL = "http://10.0.2.2:8082";

        try {
            setLoading(true);
            const genderValue = formData.gender === "남성" ? "MALE" : "FEMALE";
            const fullEmail = `${formData.emailId}@${formData.emailDomain}`;

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
                Alert.alert("성공", "회원가입이 완료되었습니다!", [
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
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
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
                    <View className="px-8 mt-10 gap-y-4">
                        {/* 이름 */}
                        <View>
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
                        <View>
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
                                    maxLength={11}
                                    className="flex-1 h-14 px-5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-700"
                                />
                            </View>
                        </View>

                        {/* 이메일 */}
                        <View>
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
                                    <Text className="text-gray-700">naver.com</Text>
                                </View>
                            </View>
                        </View>

                        {/* 생년월일 [수정: 아이콘 터치 씹힘 해결을 위해 구조 변경] */}
                        <View>
                            <Text className="text-sm font-bold text-gray-700 mb-2">생년월일 <Text className="text-red-400">*</Text></Text>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => {
                                    setCurrentNavDate(new Date());
                                    setPickerMode('calendar');
                                    setShowCalendar(true);
                                }}
                                className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl flex-row items-center px-4"
                            >
                                <Calendar size={22} color="#9ca3af" />
                                <Text className={`ml-3 text-base ${formData.birthdate ? "text-gray-700" : "text-gray-400"}`}>
                                    {formData.birthdate || "달력에서 선택하기"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* 성별 선택 */}
                        <View className="flex-row gap-x-4 mt-2">
                            {['남성', '여성'].map((gender) => (
                                <TouchableOpacity
                                    key={gender}
                                    onPress={() => handleInputChange("gender", gender)}
                                    className={`flex-1 h-16 rounded-2xl border items-center justify-center ${
                                        formData.gender === gender ? gender === '남성' ? 'bg-blue-50 border-blue-500' : 'bg-pink-50 border-pink-300' : 'bg-gray-50 border-gray-100'
                                    }`}
                                >
                                    <Text className={`text-base font-bold ${formData.gender === gender ? gender === '남성' ? 'text-blue-600' : 'text-pink-600' : 'text-gray-400'}`}>
                                        {gender}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* 4. 하단 완료 버튼 */}
                    <View className="px-8 py-10 mt-auto">
                        <TouchableOpacity
                            disabled={!isFormValid || loading}
                            onPress={handleSubmit}
                            activeOpacity={0.8}
                            className={`w-full h-16 rounded-2xl items-center justify-center shadow-lg ${isFormValid && !loading ? 'bg-indigo-600 shadow-indigo-100' : 'bg-gray-100'}`}
                        >
                            {loading ? <ActivityIndicator color="#ffffff" /> : <Text className={`text-xl font-bold ${isFormValid ? 'text-white' : 'text-gray-300'}`}>가입 완료</Text>}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* ─── 스마트 네비게이션 달력 모달 ─── */}
            <Modal
                visible={showCalendar}
                transparent={true}
                animationType="fade"
                onRequestClose={() => {
                    setShowCalendar(false);
                    setPickerMode('calendar');
                }}
            >
                <View className="flex-1 justify-center items-center bg-black/50 px-4">
                    <View className="w-full bg-white rounded-3xl p-5 shadow-xl">

                        {/* 1. 달력 기본 그리드 모드 */}
                        {pickerMode === 'calendar' && (
                            <View>
                                {/* 달력 상단 헤더 */}
                                <View className="flex-row justify-between items-center mb-5 px-1">
                                    <TouchableOpacity onPress={() => moveMonth(-1)} className="p-2 bg-gray-50 rounded-full">
                                        <ChevronLeft size={20} color="#4b5563" />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => setPickerMode('year')}
                                        className="bg-indigo-50/70 px-4 py-2 rounded-full flex-row items-center gap-x-1"
                                    >
                                        <Text className="text-base font-extrabold text-indigo-900">{navYear}년 {navMonth + 1}월</Text>
                                        <Text className="text-indigo-400 text-xs">▼</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={() => moveMonth(1)} className="p-2 bg-gray-50 rounded-full">
                                        <ChevronRight size={20} color="#4b5563" />
                                    </TouchableOpacity>
                                </View>

                                {/* 요일 헤더 */}
                                <View className="flex-row w-full mb-3">
                                    {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
                                        <Text key={idx} style={{ width: '14.28%' }} className={`text-center text-xs font-bold ${idx === 0 ? 'text-red-400' : idx === 6 ? 'text-blue-400' : 'text-gray-400'}`}>
                                            {day}
                                        </Text>
                                    ))}
                                </View>

                                {/* 날짜 그리드 */}
                                <View className="flex-row flex-wrap w-full">
                                    {calendarDays.map((day, index) => {
                                        const isSelected = formData.birthdate === `${navYear}-${String(navMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                        return (
                                            <View key={index} style={{ width: '14.28%' }} className="aspect-square items-center justify-center p-0.5">
                                                {day ? (
                                                    <TouchableOpacity
                                                        onPress={() => handleSelectDay(day)}
                                                        className={`w-full h-full items-center justify-center rounded-full ${isSelected ? 'bg-indigo-600' : 'active:bg-gray-100'}`}
                                                    >
                                                        <Text className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                                                            {day}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ) : (
                                                    <View className="w-full h-full" />
                                                )}
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        )}

                        {/* 2. 빠른 연도 선택 모드 */}
                        {pickerMode === 'year' && (
                            <View>
                                <Text className="text-center text-sm font-bold text-gray-400 mb-4">출생 연도 선택</Text>
                                <ScrollView className="h-64" showsVerticalScrollIndicator={false}>
                                    <View className="flex-row flex-wrap justify-start">
                                        {quickYears.map((yr) => (
                                            <TouchableOpacity
                                                key={yr}
                                                onPress={() => {
                                                    const nextDate = new Date(currentNavDate);
                                                    nextDate.setFullYear(yr);
                                                    setCurrentNavDate(nextDate);
                                                    setPickerMode('month');
                                                }}
                                                style={{ width: '31%', margin: '1.1%' }}
                                                className={`py-3 rounded-xl items-center ${yr === navYear ? 'bg-indigo-600' : 'bg-gray-50'}`}
                                            >
                                                <Text className={`font-bold text-sm ${yr === navYear ? 'text-white' : 'text-gray-700'}`}>{yr}년</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </ScrollView>
                            </View>
                        )}

                        {/* 3. 빠른 월 선택 모드 */}
                        {pickerMode === 'month' && (
                            <View>
                                <Text className="text-center text-sm font-bold text-gray-400 mb-4">{navYear}년 태어난 달 선택</Text>
                                <View className="flex-row flex-wrap justify-start">
                                    {quickMonths.map((m) => (
                                        <TouchableOpacity
                                            key={m}
                                            onPress={() => {
                                                const nextDate = new Date(currentNavDate);
                                                nextDate.setMonth(m);
                                                setCurrentNavDate(nextDate);
                                                setPickerMode('calendar');
                                            }}
                                            style={{ width: '31%', margin: '1.1%', paddingVertical: 14 }}
                                            className={`rounded-xl items-center ${m === navMonth ? 'bg-indigo-600' : 'bg-gray-50'}`}
                                        >
                                            <Text className={`font-bold text-sm ${m === navMonth ? 'text-white' : 'text-gray-700'}`}>{m + 1}월</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* 하단 취소 / 뒤로가기 버튼 */}
                        <TouchableOpacity
                            onPress={() => {
                                if (pickerMode !== 'calendar') {
                                    setPickerMode('calendar');
                                } else {
                                    setShowCalendar(false);
                                }
                            }}
                            className="mt-4 pt-3 border-t border-gray-100 items-center justify-center"
                        >
                            <Text className="text-indigo-600 font-bold text-sm">
                                {pickerMode !== 'calendar' ? "달력으로 돌아가기" : "닫기"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}