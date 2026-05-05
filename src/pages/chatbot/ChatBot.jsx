import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, Modal, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { X, Send, Calendar, MapPin, Gauge, Copy, Edit3, ArrowRight } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import axios from 'axios';

const neogulImg = require("../../../assets/images/neogulGuide.jpeg");

// 🔥 플랫폼(안드로이드/iOS)에 맞게 서버 주소 자동 설정
const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8082' : 'http://localhost:8082';

const ChatBot = ({ visible, onClose }) => {
    const navigation = useNavigation();
    const scrollRef = useRef(null);

    // --- 상태 관리 ---
    const [selectedDate, setSelectedDate] = useState("날짜");
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
    const dates = ["오늘", "내일", "이번 주말"];
    const SYSTEM_PROMPT = " (지정한 날짜와 지역 정보를 토대로 추천 산행 정보를 300자 이내로 설명해 줘.)";

    const getCurrentTime = () => {
        const now = new Date();
        return now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    // 앱 환경에 맞게 이미지 URL을 파싱하는 함수
    const getSafeImageSource = (path) => {
        if (!path || typeof path !== 'string') return { uri: "https://placehold.co/100" };
        if (path.startsWith("http") && !path.includes("8082")) return { uri: path };
        const filename = path.split('\\').pop().split('/').pop();
        return { uri: `${API_BASE_URL}/uploads/${filename}` };
    };

    // 산 목록 가져오기
    useEffect(() => {
        const fetchMountains = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/mountains`);
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
        const datePart = selectedDate !== "날짜" ? `${selectedDate} ` : "";
        const regionPart = (selectedRegion !== "지역" && selectedRegion !== "전국") ? `${selectedRegion} 지역의 ` : "";
        const levelPart = selectedLevel !== "난이도" ? `${selectedLevel} 난이도 ` : "";
        return `${datePart}${regionPart}${levelPart}${pureText}`;
    };

    // ✅ 기능 1: 메시지 전송
    const handleSendMessage = async () => {
        if (!inputText.trim() || isLoading) return;

        const combinedText = getCombinedText(inputText);
        const userMsg = { role: 'user', text: combinedText, time: getCurrentTime(), isEdited: false };

        setMessages(prev => [...prev, userMsg]);
        setInputText("");
        setIsLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/api/gemini/chat`, {
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
            Alert.alert("오류", "AI 응답을 가져오지 못했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const startEdit = (index, fullText) => {
        setEditingId(index);
        setEditInputText(fullText);
    };

    // ✅ 기능 2: 메시지 수정 및 재요청
    const handleUpdateMessage = async (index) => {
        if (!editInputText.trim()) return;

        setMessages(prev => {
            const newMsgs = [...prev];
            newMsgs[index] = { ...newMsgs[index], text: editInputText, isEdited: true };
            if (newMsgs[index + 1] && newMsgs[index + 1].role === 'bot') {
                newMsgs[index + 1].text = "답변을 새로 고치고 있어요... 🔄";
                newMsgs[index + 1].relatedMountain = null;
            }
            return newMsgs;
        });

        setEditingId(null);
        setIsLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/api/gemini/chat`, {
                message: editInputText + SYSTEM_PROMPT
            });
            const data = response.data;
            const matchedMountain = findMatchedMountain(data.result);

            setMessages(prev => {
                const newMsgs = [...prev];
                const botMsgIndex = index + 1;

                if (newMsgs[botMsgIndex] && newMsgs[botMsgIndex].role === 'bot') {
                    newMsgs[botMsgIndex] = {
                        ...newMsgs[botMsgIndex],
                        text: data.result,
                        time: getCurrentTime(),
                        relatedMountain: matchedMountain
                    };
                } else {
                    newMsgs.push({ role: 'bot', text: data.result, time: getCurrentTime(), relatedMountain: matchedMountain });
                }
                return newMsgs;
            });
        } catch (error) {
            setMessages(prev => {
                const newMsgs = [...prev];
                if (newMsgs[index + 1]) newMsgs[index + 1].text = "수정된 답변을 가져오지 못했어요.";
                return newMsgs;
            });
        } finally {
            setIsLoading(false);
        }
    };

    // 클립보드 복사
    const handleCopy = async (text) => {
        await Clipboard.setStringAsync(text);
        Alert.alert("알림", "메시지가 복사되었습니다.");
    };

    // 옵션 순환 로직 (앱에서 드롭다운 대용)
    const cycleOption = (current, options, setter) => {
        const index = options.indexOf(current);
        const nextIndex = (index + 1) % options.length;
        setter(options[nextIndex]);
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
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
                        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
                    >
                        {/* 웰컴 메시지 */}
                        <View className="flex-row space-x-3 mb-6">
                            <Image source={neogulImg} className="w-10 h-10 rounded-xl" />
                            <View className="bg-white p-4 rounded-2xl border border-gray-100 max-w-[85%] shadow-sm">
                                <Text className="text-lg font-bold text-gray-900 leading-6">안녕하세요! 저는 너굴 AI입니다. 🌲</Text>
                                <Text className="text-sm text-gray-500 mt-2 leading-5">최적의 등산 코스와 날씨를 분석해 드릴게요.</Text>
                            </View>
                        </View>

                        {messages.map((msg, index) => (
                            <View key={index} className={`mb-6 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <View className={`flex-row items-end space-x-2 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                    {msg.role === 'bot' && <Image source={neogulImg} className="w-10 h-10 rounded-xl" />}

                                    <View className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                        <View className={`p-4 rounded-2xl max-w-[280px] shadow-sm ${msg.role === 'user' ? 'bg-[#70E092]' : 'bg-white border border-gray-50'}`}>
                                            {/* 🔥 편집 모드 UI */}
                                            {editingId === index ? (
                                                <View>
                                                    <TextInput
                                                        value={editInputText}
                                                        onChangeText={setEditInputText}
                                                        className="bg-black/10 text-white p-2 rounded-lg mb-2"
                                                        multiline
                                                        autoFocus
                                                    />
                                                    <View className="flex-row justify-end space-x-2">
                                                        <TouchableOpacity onPress={() => setEditingId(null)}><Text className="text-white/80 text-xs mt-1">취소</Text></TouchableOpacity>
                                                        <TouchableOpacity onPress={() => handleUpdateMessage(index)} className="bg-white px-2 py-1 rounded-full"><Text className="text-[#70E092] font-bold text-xs">수정완료</Text></TouchableOpacity>
                                                    </View>
                                                </View>
                                            ) : (
                                                <Text className={`text-[15px] font-medium leading-5 ${msg.role === 'user' ? 'text-white' : 'text-gray-700'}`}>
                                                    {msg.text}
                                                </Text>
                                            )}
                                        </View>

                                        {/* 🔥 모바일용 복사/편집 버튼 (항시 노출) */}
                                        {msg.role === 'user' && editingId !== index && (
                                            <View className="flex-row mt-1 space-x-2 mr-1">
                                                <TouchableOpacity onPress={() => handleCopy(msg.text)} className="p-1">
                                                    <Copy size={14} color="#9ca3af" />
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => startEdit(index, msg.text)} className="p-1">
                                                    <Edit3 size={14} color="#9ca3af" />
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>
                                    <View className="flex-col items-end">
                                        {msg.isEdited && <Text className="text-[9px] text-gray-400 mb-0.5">수정됨</Text>}
                                        <Text className="text-[10px] text-gray-400 mb-1">{msg.time}</Text>
                                    </View>
                                </View>

                                {/* 추천 산 카드 */}
                                {msg.role === 'bot' && msg.relatedMountain && (
                                    <TouchableOpacity
                                        onPress={() => { onClose(); navigation.navigate('MountainDetail', { id: msg.relatedMountain.id }); }}
                                        className="ml-12 mt-3 w-60 bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex-row items-center space-x-3"
                                    >
                                        <Image
                                            source={getSafeImageSource(msg.relatedMountain.imageUrl?.split(',')[0])}
                                            className="w-12 h-12 rounded-lg bg-gray-100"
                                            resizeMode="cover"
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

                        {isLoading && (
                            <View className="flex-row items-center space-x-2 ml-12 mb-6">
                                <ActivityIndicator size="small" color="#70E092" />
                                <Text className="text-sm text-gray-400 font-medium">너굴 AI가 분석 중이에요...</Text>
                            </View>
                        )}
                    </ScrollView>

                    {/* 하단 입력바 */}
                    <View className="p-5 bg-white border-t border-gray-100 pb-10">
                        {/* 필터 영역 (터치 시 옵션 순환) */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-4 space-x-2">
                            <TouchableOpacity onPress={() => cycleOption(selectedDate, dates, setSelectedDate)} className="px-4 py-2 border border-gray-200 rounded-full bg-white flex-row items-center space-x-1">
                                <Calendar size={14} color="#70E092" />
                                <Text className="text-xs font-bold text-gray-600">{selectedDate}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => cycleOption(selectedRegion, regions, setSelectedRegion)} className="px-4 py-2 border border-gray-200 rounded-full bg-white flex-row items-center space-x-1">
                                <MapPin size={14} color="#70E092" />
                                <Text className="text-xs font-bold text-gray-600">{selectedRegion}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => cycleOption(selectedLevel, levels, setSelectedLevel)} className="px-4 py-2 border border-gray-200 rounded-full bg-white flex-row items-center space-x-1">
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
                                editable={!isLoading}
                            />
                            <TouchableOpacity
                                onPress={handleSendMessage}
                                disabled={!inputText.trim() || isLoading}
                                className={`p-3 rounded-full ${inputText.trim() && !isLoading ? 'bg-[#70E092]' : 'bg-gray-300'}`}
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