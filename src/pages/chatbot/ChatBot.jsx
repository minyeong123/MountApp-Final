import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, Modal, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { X, Send, Calendar, Plus, ChevronDown, MapPin, Gauge, Copy, Edit3, Loader2, ArrowRight } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard'; // expo install expo-clipboard
import axios from 'axios';

// 이미지 경로는 프로젝트 구조에 맞춰 수정
const neogulImg = require("../../../assets/images/neogulGuide.jpeg");

const ChatBot = ({ visible, onClose }) => {
    const navigation = useNavigation();
    const scrollRef = useRef(null);

    // --- 상태 관리 ---
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedRegion, setSelectedRegion] = useState("지역");
    const [selectedLevel, setSelectedLevel] = useState("난이도");
    const [inputText, setInputText] = useState("");
    const [messages, setMessages] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editInputText, setEditInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [mountainList, setMountainList] = useState([]);

    const regions = ["전국", "서울", "경기", "강원", "충청", "경상", "전라", "제주"];
    const levels = ["초보자", "중급자", "상급자"];
    const SYSTEM_PROMPT = " (지정한 날짜와 지역 정보를 토대로 추천 산행 정보를 300자 이내로 설명해 줘.)";
    const SERVER_URL = "http://10.0.2.2:8082";

    // 시간 포맷
    const getCurrentTime = () => {
        const now = new Date();
        return now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    // 산 목록 가져오기
    useEffect(() => {
        const fetchMountains = async () => {
            try {
                const response = await axios.get(`${SERVER_URL}/api/mountains`);
                setMountainList(response.data);
            } catch (error) {
                console.error("산 목록 로드 실패:", error);
            }
        };
        fetchMountains();
    }, []);

    const findMatchedMountain = (text) => {
        if (!text || mountainList.length === 0) return null;
        return mountainList.find(mt => text.includes(mt.name));
    };

    const getCombinedText = (pureText) => {
        const datePart = selectedDate ? `${selectedDate} ` : "";
        const regionPart = (selectedRegion !== "지역" && selectedRegion !== "전국") ? `${selectedRegion} 지역의 ` : "";
        const levelPart = selectedLevel !== "난이도" ? `${selectedLevel} 난이도 ` : "";
        return `${datePart}${regionPart}${levelPart}${pureText}`;
    };

    // 메시지 전송
    const handleSendMessage = async () => {
        if (!inputText.trim() || isLoading) return;

        const combinedText = getCombinedText(inputText);
        const userMsg = { role: 'user', text: combinedText, time: getCurrentTime(), isEdited: false };

        setMessages(prev => [...prev, userMsg]);
        setInputText("");
        setIsLoading(true);

        try {
            const response = await axios.post(`${SERVER_URL}/api/gemini/chat`, {
                message: combinedText + SYSTEM_PROMPT
            });
            const data = response.data;
            const matchedMountain = findMatchedMountain(data.result);

            const aiMsg = {
                role: 'bot',
                text: data.result,
                time: getCurrentTime(),
                relatedMountain: matchedMountain
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            Alert.alert("오류", "메시지 전송에 실패했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = async (text) => {
        await Clipboard.setStringAsync(text);
        Alert.alert("알림", "메시지가 복사되었습니다.");
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View className="flex-1 bg-black/40 justify-end">
                <View className="h-[90%] bg-[#F8F9F8] rounded-t-[30px] overflow-hidden">

                    {/* 헤더 */}
                    <View className="bg-[#D1F386] p-6 flex-row justify-between items-center">
                        <View className="flex-row items-center space-x-3">
                            <Image source={neogulImg} className="w-12 h-12 rounded-2xl border-2 border-white" />
                            <View>
                                <Text className="text-xl font-bold text-gray-800">너굴 AI</Text>
                                <View className="flex-row items-center bg-white/30 px-2 py-0.5 rounded-full mt-1">
                                    <Calendar size={12} color="#4b5563" />
                                    <Text className="text-[10px] text-gray-600 ml-1 font-medium">실시간 산행 가이드</Text>
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity onPress={onClose} className="p-2">
                            <X size={28} color="#4b5563" />
                        </TouchableOpacity>
                    </View>

                    {/* 채팅 목록 */}
                    <ScrollView
                        ref={scrollRef}
                        className="flex-1 px-5 pt-5"
                        onContentSizeChange={() => scrollRef.current.scrollToEnd({ animated: true })}
                    >
                        {/* 웰컴 메시지 */}
                        <View className="flex-row space-x-3 mb-6">
                            <Image source={neogulImg} className="w-10 h-10 rounded-xl" />
                            <View className="bg-white p-4 rounded-2xl border border-gray-100 max-w-[85%] shadow-sm">
                                <Text className="text-lg font-bold text-gray-900">안녕하세요! 저는 너굴 AI입니다. 🌲</Text>
                                <Text className="text-sm text-gray-500 mt-2 leading-5">최적의 등산 코스와 날씨를 분석해 드릴게요.</Text>
                            </View>
                        </View>

                        {messages.map((msg, index) => (
                            <View key={index} className={`mb-6 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <View className={`flex-row items-end space-x-2 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                    {msg.role === 'bot' && <Image source={neogulImg} className="w-10 h-10 rounded-xl" />}

                                    <View className={`p-4 rounded-2xl max-w-[70%] shadow-sm ${msg.role === 'user' ? 'bg-[#70E092]' : 'bg-white border border-gray-50'}`}>
                                        <Text className={`text-[15px] font-medium ${msg.role === 'user' ? 'text-white' : 'text-gray-700'}`}>
                                            {msg.text}
                                        </Text>
                                    </View>
                                    <Text className="text-[10px] text-gray-400 mb-1">{msg.time}</Text>
                                </View>

                                {/* 추천 산 카드 */}
                                {msg.role === 'bot' && msg.relatedMountain && (
                                    <TouchableOpacity
                                        onPress={() => { onClose(); navigation.navigate('MountainDetail', { id: msg.relatedMountain.id }); }}
                                        className="ml-12 mt-3 w-60 bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex-row items-center space-x-3"
                                    >
                                        <Image
                                            source={{ uri: msg.relatedMountain.imageUrl?.split(',')[0] || "https://placehold.co/100" }}
                                            className="w-12 h-12 rounded-lg"
                                        />
                                        <View className="flex-1">
                                            <Text className="text-[10px] text-[#70E092] font-bold">추천 산행지</Text>
                                            <Text className="text-sm font-bold text-gray-800" numberOfLines={1}>{msg.relatedMountain.name}</Text>
                                        </View>
                                        <ArrowRight size={16} color="#70E092" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}
                    </ScrollView>

                    {/* 하단 입력바 */}
                    <View className="p-5 bg-white border-t border-gray-100 pb-10">
                        {/* 필터 영역 (간소화) */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-4 space-x-2">
                            <TouchableOpacity className="px-4 py-2 border border-gray-200 rounded-full bg-white flex-row items-center space-x-1">
                                <Calendar size={14} color="#70E092" />
                                <Text className="text-xs font-bold text-gray-600">{selectedDate || "날짜"}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="px-4 py-2 border border-gray-200 rounded-full bg-white flex-row items-center space-x-1">
                                <MapPin size={14} color="#70E092" />
                                <Text className="text-xs font-bold text-gray-600">{selectedRegion}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="px-4 py-2 border border-gray-200 rounded-full bg-white flex-row items-center space-x-1">
                                <Gauge size={14} color="#70E092" />
                                <Text className="text-xs font-bold text-gray-600">{selectedLevel}</Text>
                            </TouchableOpacity>
                        </ScrollView>

                        <View className="flex-row items-end bg-gray-50 rounded-[28px] p-2 border border-gray-100">
                            <TextInput
                                className="flex-1 px-4 py-3 text-[15px]"
                                placeholder="너굴 AI에게 질문하기..."
                                value={inputText}
                                onChangeText={setInputText}
                                multiline
                            />
                            <TouchableOpacity
                                onPress={handleSendMessage}
                                disabled={!inputText.trim() || isLoading}
                                className={`p-3 rounded-full ${inputText.trim() ? 'bg-[#70E092]' : 'bg-gray-300'}`}
                            >
                                {isLoading ? <ActivityIndicator size="small" color="#fff" /> : <Send size={20} color="#fff" />}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default ChatBot;