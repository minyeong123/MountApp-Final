import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, Modal, Platform, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { X, Send, Calendar, MapPin, Gauge, Copy, Edit3, ArrowRight, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import axios from 'axios';

const neogulImg = require("../../../assets/images/neogulGuide.jpeg");

const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8082' : 'http://localhost:8082';

// ─── 달력 드롭다운 ───────────────────────────────────────────────
const CalendarDropdown = ({ selectedDate, onSelect, onClose }) => {
    const today = new Date();
    const [viewYear, setViewYear] = useState(selectedDate ? selectedDate.getFullYear() : today.getFullYear());
    const [viewMonth, setViewMonth] = useState(selectedDate ? selectedDate.getMonth() : today.getMonth());

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    const isToday = (day) => {
        return today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;
    };
    const isSelected = (day) => {
        if (!selectedDate) return false;
        return selectedDate.getFullYear() === viewYear && selectedDate.getMonth() === viewMonth && selectedDate.getDate() === day;
    };
    const isPast = (day) => {
        const d = new Date(viewYear, viewMonth, day);
        d.setHours(0,0,0,0);
        const t = new Date(); t.setHours(0,0,0,0);
        return d < t;
    };

    const cells = [];
    for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return (
        <View className="absolute bottom-full mb-2 left-0 bg-white rounded-2xl shadow-lg border border-gray-100 w-72 z-50 p-4">
            <View className="flex-row items-center justify-between mb-3">
                <TouchableOpacity onPress={prevMonth} className="p-1">
                    <ChevronLeft size={18} color="#6b7280" />
                </TouchableOpacity>
                <Text className="text-sm font-bold text-gray-800">{viewYear}년 {viewMonth + 1}월</Text>
                <TouchableOpacity onPress={nextMonth} className="p-1">
                    <ChevronRight size={18} color="#6b7280" />
                </TouchableOpacity>
            </View>

            <View className="flex-row mb-1">
                {weekDays.map((d, i) => (
                    <View key={i} className="flex-1 items-center">
                        <Text className={`text-[11px] font-semibold ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>{d}</Text>
                    </View>
                ))}
            </View>

            <View className="flex-row flex-wrap">
                {cells.map((day, i) => {
                    const col = i % 7;
                    const past = day ? isPast(day) : false;
                    const sel = day ? isSelected(day) : false;
                    const tod = day ? isToday(day) : false;

                    return (
                        <View key={i} className="w-[14.28%] items-center py-0.5">
                            {day ? (
                                <TouchableOpacity
                                    onPress={() => {
                                        if (!past) {
                                            onSelect(new Date(viewYear, viewMonth, day));
                                            onClose();
                                        }
                                    }}
                                    disabled={past}
                                    className={`w-8 h-8 items-center justify-center rounded-full
                                        ${sel ? 'bg-[#70E092]' : tod ? 'border border-[#70E092]' : ''}`}
                                >
                                    <Text className={`text-[13px] font-medium
                                        ${past ? 'text-gray-300' : sel ? 'text-white font-bold' : col === 0 ? 'text-red-400' : col === 6 ? 'text-blue-400' : 'text-gray-700'}`}>
                                        {day}
                                    </Text>
                                </TouchableOpacity>
                            ) : <View className="w-8 h-8" />}
                        </View>
                    );
                })}
            </View>

            <TouchableOpacity
                onPress={() => { onSelect(today); onClose(); }}
                className="mt-3 py-2 bg-[#F0FBF4] rounded-xl items-center"
            >
                <Text className="text-xs font-bold text-[#3cb96a]">오늘 선택</Text>
            </TouchableOpacity>
        </View>
    );
};

// ─── 일반 옵션 드롭다운 ───────────────────────────────────────────
const OptionDropdown = ({ options, selected, onSelect, onClose }) => (
    <View className="absolute bottom-full mb-2 left-0 bg-white rounded-2xl shadow-lg border border-gray-100 z-50 overflow-hidden min-w-[100px]">
        {options.map((opt, i) => (
            <TouchableOpacity
                key={i}
                onPress={() => { onSelect(opt); onClose(); }}
                className={`px-5 py-3 ${selected === opt ? 'bg-[#F0FBF4]' : ''} ${i !== options.length - 1 ? 'border-b border-gray-50' : ''}`}
            >
                <Text className={`text-sm font-medium ${selected === opt ? 'text-[#3cb96a] font-bold' : 'text-gray-700'}`}>{opt}</Text>
            </TouchableOpacity>
        ))}
    </View>
);

// ─── 메인 ChatBot ─────────────────────────────────────────────────
const ChatBot = ({ visible, onClose }) => {
    const router = useRouter();
    const scrollRef = useRef(null);

    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedRegion, setSelectedRegion] = useState("지역");
    const [selectedLevel, setSelectedLevel] = useState("난이도");
    const [inputText, setInputText] = useState("");
    const [messages, setMessages] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editInputText, setEditInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [mountainList, setMountainList] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(null);

    const SYSTEM_PROMPT = ` (지정한 날짜와 지역, 난이도 정보를 토대로 산행을 추천해 줘. 답변은 반드시 아래와 같은 JSON 배열 규격으로만 작성하고 다른 설명은 일체 생략해 줘.
    [
      { "mountain": "산 이름", "course": "추천 코스명", "reason": "코스별 특징과 추천하는 이유 요약" }
    ])`;

    const formatDate = (date) => {
        if (!date) return "날짜";
        const m = date.getMonth() + 1;
        const d = date.getDate();
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        return `${m}/${d}(${days[date.getDay()]})`;
    };

    const getCurrentTime = () => new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true });

    const getSafeImageSource = (path) => {
        if (!path || typeof path !== 'string') return { uri: "https://placehold.co/100" };
        if (path.startsWith("http") && !path.includes("8082")) return { uri: path };
        const filename = path.split('\\').pop().split('/').pop();
        return { uri: `${API_BASE_URL}/uploads/${filename}` };
    };

    const toggleDropdown = (name) => setOpenDropdown(prev => prev === name ? null : name);
    const closeAll = () => setOpenDropdown(null);

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
        const datePart = selectedDate ? `${formatDate(selectedDate)} ` : "";
        const regionPart = (selectedRegion !== "지역" && selectedRegion !== "전국") ? `${selectedRegion} 지역의 ` : "";
        const levelPart = selectedLevel !== "난이도" ? `${selectedLevel} 난이도 ` : "";
        return `${datePart}${regionPart}${levelPart}${pureText}`;
    };

    const handleSendMessage = async () => {
        if (!inputText.trim() || isLoading) return;
        closeAll();
        const combinedText = getCombinedText(inputText);
        const userMsg = { role: 'user', text: combinedText, time: getCurrentTime(), isEdited: false };
        setMessages(prev => [...prev, userMsg]);
        setInputText("");
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/gemini/chat`, { message: combinedText + SYSTEM_PROMPT });
            const data = response.data;
            const matchedMountain = findMatchedMountain(data.result);
            setMessages(prev => [...prev, { role: 'bot', text: data.result, time: getCurrentTime(), relatedMountain: matchedMountain }]);
        } catch {
            Alert.alert("오류", "AI 응답을 가져오지 못했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const startEdit = (index, fullText) => { setEditingId(index); setEditInputText(fullText); };

    const handleUpdateMessage = async (index) => {
        if (!editInputText.trim()) return;
        setMessages(prev => {
            const n = [...prev];
            n[index] = { ...n[index], text: editInputText, isEdited: true };
            if (n[index + 1]?.role === 'bot') { n[index + 1].text = "답변을 새로 고치고 있어요... 🔄"; n[index + 1].relatedMountain = null; }
            return n;
        });
        setEditingId(null);
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/gemini/chat`, { message: editInputText + SYSTEM_PROMPT });
            const data = response.data;
            const matchedMountain = findMatchedMountain(data.result);
            setMessages(prev => {
                const n = [...prev];
                const bi = index + 1;
                if (n[bi]?.role === 'bot') n[bi] = { ...n[bi], text: data.result, time: getCurrentTime(), relatedMountain: matchedMountain };
                else n.push({ role: 'bot', text: data.result, time: getCurrentTime(), relatedMountain: matchedMountain });
                return n;
            });
        } catch {
            setMessages(prev => { const n = [...prev]; if (n[index + 1]) n[index + 1].text = "수정된 답변을 가져오지 못했어요."; return n; });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = async (text) => { await Clipboard.setStringAsync(text); Alert.alert("알림", "메시지가 복사되었습니다."); };

    // 🔥 1. 해당 텍스트가 '표(Table)' 데이터인지 판별하는 헬퍼 함수
    const isTableMessage = (text) => {
        if (!text) return false;
        return text.includes('[') && text.includes(']') && text.includes('"mountain"');
    };

    // 🔥 2. 폰트와 행간을 시원하게 키운 표 렌더링 함수
    const renderBotContent = (rawText) => {
        try {
            const firstIdx = rawText.indexOf('[');
            const lastIdx = rawText.lastIndexOf(']');

            if (firstIdx !== -1 && lastIdx !== -1 && lastIdx > firstIdx) {
                const cleanJson = rawText.substring(firstIdx, lastIdx + 1);
                const tableList = JSON.parse(cleanJson.trim());

                if (Array.isArray(tableList) && tableList.length > 0 && tableList[0].mountain) {
                    return (
                        <View className="w-full bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm my-1">
                            {/* 표 헤더 (폰트 13px로 확대) */}
                            <View className="flex-row bg-[#E8FBF0] p-3 border-b border-gray-200 items-center justify-between">
                                <Text style={{ flex: 1 }} className="font-black text-[#2b8a4e] text-[13px] text-center px-0.5">추천 산</Text>
                                <Text style={{ flex: 1.3 }} className="font-black text-[#2b8a4e] text-[13px] text-center px-0.5">추천 코스</Text>
                                <Text style={{ flex: 2 }} className="font-black text-[#2b8a4e] text-[13px] text-center px-0.5">특징 및 추천 이유</Text>
                            </View>

                            {/* 표 본문 (폰트 12~13px 및 행간 확대) */}
                            {tableList.map((row, idx) => (
                                <View key={idx} className={`flex-row p-3 items-center justify-between ${idx !== tableList.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                    <Text style={{ flex: 1 }} className="font-black text-gray-900 text-[13px] text-center px-0.5">{row.mountain}</Text>
                                    <Text style={{ flex: 1.3 }} className="font-bold text-gray-800 text-xs text-center px-0.5">{row.course}</Text>
                                    {/* ⚠️ 설명글 폰트를 text-xs(12px)로 올리고 행간(leading-5)을 주어 가독성을 대폭 끌어올렸습니다. */}
                                    <Text style={{ flex: 2 }} className="text-gray-700 text-xs leading-5 px-0.5">{row.reason}</Text>
                                </View>
                            ))}
                        </View>
                    );
                }
            }
        } catch {}

        return <Text className="text-[15px] font-medium leading-5 text-gray-700">{rawText}</Text>;
    };

    const dateActive = !!selectedDate;
    const regionActive = selectedRegion !== "지역";
    const levelActive = selectedLevel !== "난이도";

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <TouchableOpacity activeOpacity={1} onPress={closeAll} className="flex-1 bg-black/40 justify-end">
                <TouchableOpacity activeOpacity={1} className="h-[90%] bg-[#F8F9F8] rounded-t-[30px] overflow-hidden">

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

                    <ScrollView
                        ref={scrollRef}
                        className="flex-1 px-5 pt-5"
                        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
                    >
                        <View className="flex-row space-x-3 mb-6">
                            <Image source={neogulImg} className="w-10 h-10 rounded-xl" />
                            <View className="bg-white p-4 rounded-2xl border border-gray-100 max-w-[85%] shadow-sm">
                                <Text className="text-lg font-bold text-gray-900 leading-6">안녕하세요! 저는 너굴 AI입니다. 🌲</Text>
                                <Text className="text-sm text-gray-500 mt-2 leading-5">최적의 등산 코스와 날씨를 표로 분석해 드릴게요.</Text>
                            </View>
                        </View>

                        {messages.map((msg, index) => {
                            const isTable = msg.role === 'bot' && isTableMessage(msg.text);

                            return (
                                <View key={index} className={`mb-6 ${msg.role === 'user' ? 'items-end' : 'items-start w-full'}`}>
                                    <View className={`flex-row items-end space-x-2 w-full ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse justify-start' : 'justify-start'}`}>

                                        {/* 🔥 3. 일반 대화일 때만 너구리 프로필 출력 (표일 때는 숨김 처리) */}
                                        {msg.role === 'bot' && !isTable && (
                                            <Image source={neogulImg} className="w-10 h-10 rounded-xl" />
                                        )}

                                        {/* 🔥 4. 표일 때는 flex-1을 주어 남은 가로 영역 100%를 꽉 채우도록 확장 */}
                                        <View className={`flex flex-col ${msg.role === 'user' ? 'items-end' : (isTable ? 'flex-1 items-stretch' : 'items-start')}`}>

                                            {/* 🔥 5. 표일 때는 말풍선 껍데기(padding, background)를 투명하게 벗겨내어 이중 테두리 완벽 제거 */}
                                            <View className={`rounded-2xl ${
                                                msg.role === 'user'
                                                    ? 'p-3.5 max-w-[280px] bg-[#70E092] shadow-sm'
                                                    : (isTable ? 'p-0 w-full bg-transparent border-0' : 'p-3.5 bg-white border border-gray-100 shadow-sm max-w-[280px]')
                                            }`}>
                                                {editingId === index ? (
                                                    <View>
                                                        <TextInput value={editInputText} onChangeText={setEditInputText} className="bg-black/10 text-white p-2 rounded-lg mb-2" multiline autoFocus />
                                                        <View className="flex-row justify-end space-x-2">
                                                            <TouchableOpacity onPress={() => setEditingId(null)}><Text className="text-white/80 text-xs mt-1">취소</Text></TouchableOpacity>
                                                            <TouchableOpacity onPress={() => handleUpdateMessage(index)} className="bg-white px-2 py-1 rounded-full"><Text className="text-[#70E092] font-bold text-xs">수정완료</Text></TouchableOpacity>
                                                        </View>
                                                    </View>
                                                ) : (
                                                    msg.role === 'bot' ? renderBotContent(msg.text) : <Text className="text-[15px] font-medium leading-5 text-white">{msg.text}</Text>
                                                )}
                                            </View>

                                            {msg.role === 'user' && editingId !== index && (
                                                <View className="flex-row mt-1 space-x-2 mr-1">
                                                    <TouchableOpacity onPress={() => handleCopy(msg.text)} className="p-1"><Copy size={14} color="#9ca3af" /></TouchableOpacity>
                                                    <TouchableOpacity onPress={() => startEdit(index, msg.text)} className="p-1"><Edit3 size={14} color="#9ca3af" /></TouchableOpacity>
                                                </View>
                                            )}
                                        </View>
                                    </View>

                                    {/* 🔥 6. 표 넓이에 맞춰 하단의 [추천 산행지 바로가기] 링크도 가운데 정렬되도록 스마트 배치 */}
                                    {msg.role === 'bot' && msg.relatedMountain && (
                                        <TouchableOpacity
                                            onPress={() => { onClose(); router.push(`/mountain/${msg.relatedMountain.id}`); }}
                                            className={`mt-3 bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex-row items-center space-x-3 ${
                                                isTable ? 'self-center w-[90%]' : 'ml-12 w-60'
                                            }`}
                                        >
                                            <Image source={getSafeImageSource(msg.relatedMountain.imageUrl?.split(',')[0])} className="w-12 h-12 rounded-lg bg-gray-100" resizeMode="cover" />
                                            <View className="flex-1">
                                                <Text className="text-[10px] text-[#70E092] font-bold">추천 산행지</Text>
                                                <Text className="text-sm font-bold text-gray-800" numberOfLines={1}>{msg.relatedMountain.name}</Text>
                                            </View>
                                            <ArrowRight size={16} color="#70E092" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            );
                        })}

                        {isLoading && (
                            <View className="flex-row items-center space-x-2 ml-12 mb-6">
                                <ActivityIndicator size="small" color="#70E092" />
                                <Text className="text-sm text-gray-400 font-medium">너굴 AI가 추천 표를 만들고 있어요...</Text>
                            </View>
                        )}
                    </ScrollView>

                    {/* 하단 필터 및 입력바 */}
                    <View className="p-5 bg-white border-t border-gray-100 pb-10">
                        <View className="flex-row mb-4 gap-2">
                            <View className="relative">
                                <TouchableOpacity
                                    onPress={() => toggleDropdown('date')}
                                    className={`px-4 py-2 border rounded-full flex-row items-center gap-1
                                        ${dateActive ? 'bg-[#70E092] border-[#70E092]' : 'bg-white border-gray-200'}`}
                                >
                                    <Calendar size={13} color={dateActive ? '#fff' : '#70E092'} />
                                    <Text className={`text-xs font-bold ${dateActive ? 'text-white' : 'text-gray-600'}`}>
                                        {formatDate(selectedDate)}
                                    </Text>
                                    <ChevronDown size={12} color={dateActive ? '#fff' : '#9ca3af'}
                                                 style={{ transform: [{ rotate: openDropdown === 'date' ? '180deg' : '0deg' }] }} />
                                </TouchableOpacity>
                                {openDropdown === 'date' && (
                                    <CalendarDropdown selectedDate={selectedDate} onSelect={setSelectedDate} onClose={closeAll} />
                                )}
                            </View>

                            <View className="relative">
                                <TouchableOpacity
                                    onPress={() => toggleDropdown('region')}
                                    className={`px-3 py-2 border rounded-full flex-row items-center gap-1
                                        ${regionActive ? 'bg-[#70E092] border-[#70E092]' : 'bg-white border-gray-200'}`}
                                >
                                    <MapPin size={13} color={regionActive ? '#fff' : '#70E092'} />
                                    <Text className={`text-xs font-bold ${regionActive ? 'text-white' : 'text-gray-600'}`}>{selectedRegion}</Text>
                                    <ChevronDown size={12} color={regionActive ? '#fff' : '#9ca3af'}
                                                 style={{ transform: [{ rotate: openDropdown === 'region' ? '180deg' : '0deg' }] }} />
                                </TouchableOpacity>
                                {openDropdown === 'region' && (
                                    <OptionDropdown
                                        options={["지역", "전국", "서울", "경기", "강원", "충청", "경상", "전라", "제주"]}
                                        selected={selectedRegion}
                                        onSelect={setSelectedRegion}
                                        onClose={closeAll}
                                    />
                                )}
                            </View>

                            <View className="relative">
                                <TouchableOpacity
                                    onPress={() => toggleDropdown('level')}
                                    className={`px-3 py-2 border rounded-full flex-row items-center gap-1
                                        ${levelActive ? 'bg-[#70E092] border-[#70E092]' : 'bg-white border-gray-200'}`}
                                >
                                    <Gauge size={13} color={levelActive ? '#fff' : '#70E092'} />
                                    <Text className={`text-xs font-bold ${levelActive ? 'text-white' : 'text-gray-600'}`}>{selectedLevel}</Text>
                                    <ChevronDown size={12} color={levelActive ? '#fff' : '#9ca3af'}
                                                 style={{ transform: [{ rotate: openDropdown === 'level' ? '180deg' : '0deg' }] }} />
                                </TouchableOpacity>
                                {openDropdown === 'level' && (
                                    <OptionDropdown
                                        options={["난이도", "초보자", "중급자", "상급자"]}
                                        selected={selectedLevel}
                                        onSelect={setSelectedLevel}
                                        onClose={closeAll}
                                    />
                                )}
                            </View>
                        </View>

                        <View className="flex-row items-end bg-gray-50 rounded-[28px] p-2 border border-gray-100">
                            <TextInput
                                className="flex-1 px-4 py-3 text-[15px]"
                                placeholder="너굴 AI에게 질문하기..."
                                value={inputText}
                                onChangeText={setInputText}
                                multiline
                                editable={!isLoading}
                                onFocus={closeAll}
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

                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

export default ChatBot;