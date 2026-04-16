import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView, SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ChevronLeft, User, Phone, Mail, KeyRound, Clock } from "lucide-react-native";
import axios from "axios";

export default function FindId() {
    const navigation = useNavigation();
    const [method, setMethod] = useState("phone"); // 'phone' 또는 'email'
    const [name, setName] = useState("");
    const [contact, setContact] = useState("");

    const [isSent, setIsSent] = useState(false);
    const [authCode, setAuthCode] = useState("");
    const [timeLeft, setTimeLeft] = useState(180);

    // 1. 타이머 로직 (기존 유지)
    useEffect(() => {
        let timer;
        if (isSent && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        } else if (timeLeft === 0) {
            clearInterval(timer);
        }
        return () => clearInterval(timer);
    }, [isSent, timeLeft]);

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    // 2. 인증번호 발송 핸들러 (서버 IP 설정 필요)
    const handleSendAuthCode = async () => {
        const SERVER_URL = "http://YOUR_SERVER_IP:8082"; // 실제 서버 IP로 변경
        try {
            if (method === "email") {
                await axios.post(`${SERVER_URL}/api/auth/find-id/send-code`, { name, email: contact });
            } else {
                await axios.post(`${SERVER_URL}/api/sms/send`, { phone: contact });
            }
            setIsSent(true);
            setTimeLeft(180);
            Alert.alert("발송 완료", `${method === "email" ? "이메일" : "휴대폰"}로 인증번호가 발송되었습니다!`);
        } catch (error) {
            Alert.alert("오류", error.response?.data || "일치하는 회원 정보를 찾을 수 없습니다.");
        }
    };

    // 3. 인증번호 확인 핸들러
    const handleVerifyCode = async () => {
        const SERVER_URL = "http://YOUR_SERVER_IP:8082";
        try {
            let response;
            if (method === "email") {
                response = await axios.post(`${SERVER_URL}/api/auth/find-id/verify-code`, { name, email: contact, code: authCode });
            } else {
                response = await axios.post(`${SERVER_URL}/api/sms/find-id`, { name, phone: contact, code: authCode });
            }
            Alert.alert("아이디 찾기 성공", `회원님의 아이디는 [ ${response.data.userid} ] 입니다.`, [
                { text: "로그인하러 가기", onPress: () => navigation.navigate("Login") }
            ]);
        } catch (error) {
            Alert.alert("인증 실패", error.response?.data || "인증번호가 일치하지 않습니다.");
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                {/* 헤더 */}
                <View className="flex-row items-center px-4 py-6 border-b border-gray-100 relative">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="absolute left-4 z-10">
                        <ChevronLeft size={24} color="#111827" />
                    </TouchableOpacity>
                    <Text className="w-full text-center font-bold text-xl text-gray-900">아이디 찾기</Text>
                </View>

                <View className="p-8 flex-1">
                    {/* 타이틀 */}
                    <View className="mb-10">
                        <Text className="text-[24px] font-bold text-gray-900 mb-2">아이디를 잊으셨나요?</Text>
                        <Text className="text-gray-500 text-[15px] leading-6">
                            회원가입 시 등록한 정보로{"\n"}간편하게 아이디를 찾을 수 있습니다.
                        </Text>
                    </View>

                    {/* 인증 방식 선택 탭 */}
                    <View className="flex-row p-1 bg-gray-100 rounded-2xl mb-10">
                        <TouchableOpacity
                            onPress={() => { setMethod("phone"); setContact(""); setIsSent(false); }}
                            className={`flex-1 flex-row items-center justify-center py-3.5 rounded-xl ${method === "phone" ? "bg-white shadow-sm" : ""}`}
                        >
                            <Phone size={16} color={method === "phone" ? "#4f46e5" : "#9ca3af"} />
                            <Text className={`ml-2 text-sm font-semibold ${method === "phone" ? "text-indigo-600" : "text-gray-400"}`}>휴대폰 인증</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => { setMethod("email"); setContact(""); setIsSent(false); }}
                            className={`flex-1 flex-row items-center justify-center py-3.5 rounded-xl ${method === "email" ? "bg-white shadow-sm" : ""}`}
                        >
                            <Mail size={16} color={method === "email" ? "#4f46e5" : "#9ca3af"} />
                            <Text className={`ml-2 text-sm font-semibold ${method === "email" ? "text-indigo-600" : "text-gray-400"}`}>이메일 인증</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 입력 필드 */}
                    <View className="space-y-6">
                        <View className="mb-6">
                            <Text className="text-[15px] font-bold text-gray-900 mb-3">이름</Text>
                            <View className="relative">
                                <View className="absolute left-4 top-[18px] z-10"><User size={20} color="#9ca3af" /></View>
                                <TextInput
                                    placeholder="실명을 입력해주세요"
                                    value={name}
                                    onChangeText={setName}
                                    editable={!isSent}
                                    className={`w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl bg-white text-[15px] ${isSent ? "bg-gray-50 text-gray-400" : ""}`}
                                />
                            </View>
                        </View>

                        <View className="mb-6">
                            <Text className="text-[15px] font-bold text-gray-900 mb-3">
                                {method === "phone" ? "휴대폰 번호" : "이메일 주소"}
                            </Text>
                            <View className="flex-row">
                                <View className="relative flex-1">
                                    <View className="absolute left-4 top-[18px] z-10">
                                        {method === "phone" ? <Phone size={20} color="#9ca3af" /> : <Mail size={20} color="#9ca3af" />}
                                    </View>
                                    <TextInput
                                        keyboardType={method === "phone" ? "phone-pad" : "email-address"}
                                        placeholder={method === "phone" ? "'-' 없이 번호만 입력" : "example@mail.com"}
                                        value={contact}
                                        onChangeText={setContact}
                                        editable={!isSent}
                                        className={`w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl bg-white text-[15px] ${isSent ? "bg-gray-50 text-gray-400" : ""}`}
                                    />
                                </View>
                                <TouchableOpacity
                                    onPress={handleSendAuthCode}
                                    disabled={!name || !contact}
                                    className={`ml-2 px-5 justify-center rounded-2xl border ${name && contact ? "bg-indigo-50 border-indigo-100" : "bg-gray-100 border-transparent"}`}
                                >
                                    <Text className={`font-bold text-sm ${name && contact ? "text-indigo-600" : "text-gray-400"}`}>
                                        {isSent ? "재전송" : "인증요청"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* 인증번호 입력 (조건부 렌더링) */}
                        {isSent && (
                            <View className="mt-6">
                                <Text className="text-[15px] font-bold text-gray-900 mb-3">인증번호</Text>
                                <View className="relative">
                                    <View className="absolute left-4 top-[18px] z-10"><KeyRound size={20} color="#9ca3af" /></View>
                                    <TextInput
                                        keyboardType="number-pad"
                                        maxLength={6}
                                        placeholder="인증번호 6자리 입력"
                                        value={authCode}
                                        onChangeText={setAuthCode}
                                        className="w-full pl-12 pr-20 py-4 border border-gray-200 rounded-2xl bg-white text-[15px]"
                                    />
                                    <View className="absolute right-4 top-[18px] flex-row items-center">
                                        <Clock size={16} color={timeLeft <= 60 ? "#ef4444" : "#4f46e5"} />
                                        <Text className={`ml-1 font-bold ${timeLeft <= 60 ? "text-red-500" : "text-indigo-500"}`}>{formatTime(timeLeft)}</Text>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    onPress={handleVerifyCode}
                                    disabled={authCode.length < 6 || timeLeft === 0}
                                    className={`w-full py-4 rounded-2xl mt-6 shadow-md items-center ${authCode.length >= 6 && timeLeft > 0 ? "bg-indigo-600" : "bg-[#C1C4F8]"}`}
                                >
                                    <Text className="text-white font-bold text-lg">확인</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}