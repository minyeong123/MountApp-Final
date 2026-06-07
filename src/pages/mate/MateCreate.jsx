import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, ScrollView, TouchableOpacity,
    Alert, Dimensions, Image
} from 'react-native';
import {
    ChevronLeft, Search, Calendar, Clock, Camera,
    MapPin, X, Plus
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
// 로컬 데이터 import (경로는 실제 파일 위치에 맞게 조정하세요)
import { MOUNTAIN_DATA } from '../home/mountainData';

const { width } = Dimensions.get('window');

export default function MateCreate() {
    const router = useRouter();
    const BACKEND_URL = "http://10.0.2.2:8082";

    // --- State ---
    const [userInfo, setUserInfo] = useState({ name: '익명 유저', profileImg: null });
    const [mountainList, setMountainList] = useState([]);

    // 폼 States
    const [title, setTitle] = useState('');
    const [mountain, setMountain] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState('08:00');
    const [location, setLocation] = useState('');
    const [capacity, setCapacity] = useState(4);
    const [level, setLevel] = useState('중급');

    // 코스 및 일정 States
    const [mountainTrails, setMountainTrails] = useState([]); // 산의 전체 코스 목록
    const [selectedTrail, setSelectedTrail] = useState(null); // 선택된 특정 코스
    const [schedules, setSchedules] = useState([{ id: Date.now(), time: '08:00', plan: '', description: '' }]);
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [images, setImages] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [dbMountainImage, setDbMountainImage] = useState(null);
    const [selectedMountainData, setSelectedMountainData] = useState(null);

    // 일정 추가
    const addSchedule = () => {
        setSchedules([...schedules, { id: Date.now(), time: '08:00', plan: '', description: '' }]);
    };

// 일정 수정
    const updateSchedule = (id, field, value) => {
        setSchedules(schedules.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

// 일정 삭제
    const removeSchedule = (id) => {
        setSchedules(schedules.filter(s => s.id !== id));
    };

// 태그 추가
    const addTag = () => {
        if (tagInput && !tags.includes(tagInput)) {
            setTags([...tags, tagInput]);
            setTagInput('');
        }
    };

// 태그 삭제
    const removeTag = (tagToRemove) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    // 1. 초기 데이터 로드
    useEffect(() => {
        const initData = async () => {
            const token = await AsyncStorage.getItem("jwtToken");
            if (token) {
                try {
                    const res = await axios.get(`${BACKEND_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
                    setUserInfo({ name: res.data.nickname || '익명 유저', profileImg: res.data.profileImage });
                } catch (e) { console.error(e); }
            }
            try {
                const mtRes = await axios.get(`${BACKEND_URL}/api/mountains`);
                setMountainList(mtRes.data);
            } catch (e) { console.error(e); }
        };
        initData();
    }, []);

    // 2. 산 선택 및 전체 코스 매핑
    const handleMountainSelect = (mt) => {
        setMountain(mt.name);
        setSelectedMountainData(mt);

        // MOUNTAIN_DATA에서 코스 불러오기
        const trails = MOUNTAIN_DATA[mt.id] || [];
        setMountainTrails(trails);
        setSelectedTrail(null); // 초기화

        // 썸네일 매핑
        if (mt.imageUrl && !mt.imageUrl.includes('placeholder')) {
            const rawPath = mt.imageUrl.split(',')[0];
            setDbMountainImage(rawPath.startsWith("http") ? rawPath : `${BACKEND_URL}/images/${rawPath.split('\\').pop()}`);
        }
        setShowDropdown(false);
    };

    // 3. 코스 선택 로직
    const handleTrailSelect = (trail) => {
        setSelectedTrail(trail);
        let diff = trail.difficulty;
        if (diff === '어려움') setLevel('상급');
        else if (diff === '보통') setLevel('중급');
        else setLevel('초급');
    };

    // 4. 전송 로직
    const handleSubmit = async () => {
        if (!title || !mountain || !location) {
            Alert.alert("알림", "필수 정보를 모두 입력해주세요!");
            return;
        }

        const token = await AsyncStorage.getItem("jwtToken");
        const newEntry = {
            title,
            mountainName: mountain,
            elevation: selectedMountainData?.height || 0,
            status: "모집 중",
            deadline: date,
            tags: [{ label: level, color: "green" }, ...tags.map(t => ({ label: t, color: "gray" }))],
            description,
            meeting: { date: `${date} ${time}`, location },
            course: {
                name: selectedTrail ? `${mountain} ${selectedTrail.name}` : `${mountain} 코스`,
                duration: selectedTrail?.uptime || "미상",
                difficulty: level,
                distance: selectedTrail?.distance || "미상",
                image: selectedTrail?.imageName || null,
                mountainId: selectedMountainData?.id || null,
                trailId: selectedTrail?.id || null,
            },
            host: { name: userInfo.name, profileImg: userInfo.profileImg },
            members: { current: 1, max: capacity, list: [{ name: userInfo.name, profileImg: userInfo.profileImg }] },
            schedule: schedules.map(s => ({ time: s.time, title: s.plan, desc: s.description })),
            notices: ["안전한 산행 되세요!"]
        };

        const formData = new FormData();
        formData.append("data", { string: JSON.stringify(newEntry), type: 'application/json' });
        images.forEach((img) => formData.append("images", { uri: img.uri, name: img.name, type: 'image/jpeg' }));

        try {
            await axios.post(`${BACKEND_URL}/api/mates`, formData, { headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` } });
            Alert.alert("성공", "모임이 등록되었습니다!");
            router.back();
        } catch (error) { Alert.alert("에러", "등록에 실패했습니다."); }
    };

    return (
        <View className="flex-1 bg-white">
            <View className="flex-row items-center px-4 pt-5 pb-4 bg-white border-b border-gray-50">
                <TouchableOpacity onPress={() => router.back()}><ChevronLeft size={24} /></TouchableOpacity>
                <Text className="flex-1 text-center font-bold text-xl">모임 만들기</Text>
            </View>

            <ScrollView className="flex-1 px-6" keyboardShouldPersistTaps="handled">
                <View className="mt-6 mb-10">
                    <Text className="font-extrabold text-[17px] mb-4">사진 등록 (최대 5장)</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                        {/* 추가 버튼 */}
                        {images.length < 5 && (
                            <TouchableOpacity
                                onPress={async () => {
                                    let result = await ImagePicker.launchImageLibraryAsync({
                                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                        allowsMultipleSelection: true,
                                        quality: 0.7,
                                    });
                                    if (!result.canceled) {
                                        setImages([...images, ...result.assets].slice(0, 5));
                                    }
                                }}
                                className="w-20 h-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl items-center justify-center mr-2"
                            >
                                <Camera size={24} color="#9CA3AF" />
                                <Text className="text-[10px] text-gray-400 mt-1 font-bold">{images.length}/5</Text>
                            </TouchableOpacity>
                        )}

                        {/* 선택된 이미지들 */}
                        {images.map((img, index) => (
                            <View key={index} className="relative w-20 h-20 mr-2 rounded-xl overflow-hidden border border-gray-100">
                                <Image source={{ uri: img.uri }} className="w-full h-full" />
                                <TouchableOpacity
                                    onPress={() => setImages(images.filter((_, i) => i !== index))}
                                    className="absolute top-1 right-1 bg-black/50 rounded-full p-1"
                                >
                                    <X size={12} color="white" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* 산 및 코스 선택 */}
                <View className="mt-6 mb-6">
                    <Text className="font-extrabold text-[17px] mb-4">어떤 산을 가시나요?</Text>
                    <TextInput
                        value={mountain}
                        onChangeText={(t) => { setMountain(t); setShowDropdown(true); }}
                        placeholder="산 이름을 검색해주세요"
                        className="bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5"
                    />
                    {showDropdown && (
                        <View className="bg-white border border-gray-200 mt-2 rounded-2xl max-h-60 shadow-sm overflow-hidden">
                            {mountainList.filter(mt => mt.name.toLowerCase().includes(mountain.toLowerCase())).length > 0 ? (
                                <ScrollView keyboardShouldPersistTaps="handled">
                                    {mountainList
                                        .filter(mt => mt.name.toLowerCase().includes(mountain.toLowerCase()))
                                        .map(mt => (
                                            <TouchableOpacity
                                                key={mt.id}
                                                onPress={() => handleMountainSelect(mt)}
                                                className="p-4 border-b border-gray-50 flex-row items-center justify-between"
                                            >
                                                <Text className="text-[15px] font-medium text-gray-700">{mt.name}</Text>
                                            </TouchableOpacity>
                                        ))}
                                </ScrollView>
                            ) : (
                                <View className="p-4 items-center">
                                    <Text className="text-gray-400 text-[14px]">검색 결과가 없습니다.</Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* 전체 코스 선택 UI */}
                    {mountainTrails.length > 0 && (
                        <View className="mt-4 mb-6">
                            <Text className="font-bold text-[14px] text-gray-700 mb-2">코스를 선택해주세요</Text>
                            <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                                {mountainTrails.map((trail, index) => (
                                    <TouchableOpacity
                                        key={trail.id || index}
                                        onPress={() => handleTrailSelect(trail)}
                                        className={`flex-row items-center p-3 border-b border-gray-50 ${selectedTrail?.id === trail.id ? 'bg-green-50' : ''}`}
                                    >
                                        {/* 로컬 이미지 적용 */}
                                        <Image
                                            source={trail.imageSource}
                                            className="w-16 h-16 rounded-lg bg-gray-200"
                                            resizeMode="cover"
                                        />

                                        <View className="flex-1 ml-4">
                                            <Text className={`font-bold text-[15px] ${selectedTrail?.id === trail.id ? 'text-green-800' : 'text-gray-800'}`}>
                                                {trail.name}
                                            </Text>
                                            <View className="flex-row items-center mt-1">
                                                <Text className="text-[12px] text-gray-500">{trail.distance} | {trail.uptime}</Text>
                                            </View>
                                            <View className="flex-row mt-1">
                                                <View className={`px-2 py-0.5 rounded ${selectedTrail?.id === trail.id ? 'bg-green-200' : 'bg-gray-100'}`}>
                                                    <Text className="text-[10px] text-gray-600">{trail.difficulty}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}
                </View>

                {/* 3. Title & Description */}
                <View className="space-y-6 mb-10 z-[-1]">
                    <View>
                        <Text className="font-extrabold text-[17px] mb-4">제목</Text>
                        <TextInput
                            value={title}
                            onChangeText={setTitle}
                            placeholder="제목을 입력해주세요"
                            className="bg-gray-50 border border-gray-200 rounded-2xl py-4 px-5 text-[15px]"
                        />
                    </View>

                    <View>
                        <TextInput
                            value={description}
                            onChangeText={setDescription}
                            placeholder="상세 설명을 입력해주세요"
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                            className="h-40 bg-gray-50 border border-gray-200 rounded-2xl p-5 text-[15px]"
                        />
                    </View>
                </View>

                {/* 4. Date & Location */}
                <View className="mb-10">
                    <View className="flex-row space-x-3 mb-4">
                        <View className="flex-1 relative flex-row items-center bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 mr-2">
                            <Calendar size={16} color="#3CD371" />
                            <TextInput value={date} onChangeText={setDate} className="flex-1 ml-2 text-[13px]" />
                        </View>
                        <View className="flex-1 relative flex-row items-center bg-gray-50 border border-gray-100 rounded-xl px-3 py-3">
                            <Clock size={16} color="#3CD371" />
                            <TextInput value={time} onChangeText={setTime} className="flex-1 ml-2 text-[13px]" />
                        </View>
                    </View>
                    <View className="relative flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4">
                        <MapPin size={20} color="#3CD371" />
                        <TextInput
                            value={location}
                            onChangeText={setLocation}
                            placeholder="상세 모임 장소"
                            className="flex-1 ml-3 text-[15px]"
                        />
                    </View>
                </View>

                {/* 5. Capacity & Level */}
                <View className="mb-10">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="font-extrabold text-[17px]">모집 인원</Text>
                        <View className="bg-green-50 px-4 py-1.5 rounded-full">
                            <Text className="text-[#3CD371] font-bold">{capacity}명</Text>
                        </View>
                    </View>
                    <Slider
                        style={{width: '100%', height: 40}}
                        minimumValue={2}
                        maximumValue={10}
                        step={1}
                        value={capacity}
                        onValueChange={setCapacity}
                        minimumTrackTintColor="#3CD371"
                        maximumTrackTintColor="#F3F4F6"
                        thumbTintColor="#3CD371"
                    />

                    <View className="flex-row space-x-3 mt-6">
                        {['초급', '중급', '상급'].map((id) => (
                            <TouchableOpacity
                                key={id}
                                onPress={() => setLevel(id)}
                                className={`flex-1 items-center py-4 rounded-2xl border-2 mr-2 ${level === id ? 'border-[#3CD371] bg-green-50' : 'border-gray-50 bg-white'}`}
                            >
                                <Text className={`font-bold ${level === id ? 'text-[#3CD371]' : 'text-gray-400'}`}>{id}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* 6. 상세 일정 Section */}
                <View className="mb-10">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="font-extrabold text-[17px]">상세 일정</Text>
                        <TouchableOpacity onPress={addSchedule} className="flex-row items-center">
                            <Plus size={16} color="#3CD371" />
                            <Text className="text-[#3CD371] text-[14px] font-bold ml-1">추가</Text>
                        </TouchableOpacity>
                    </View>
                    <View className="space-y-4">
                        {schedules.map((schedule) => (
                            <View key={schedule.id} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl mb-4">
                                <View className="flex-row mb-3">
                                    <TextInput
                                        value={schedule.time}
                                        onChangeText={(v) => updateSchedule(schedule.id, 'time', v)}
                                        placeholder="08:00"
                                        className="w-20 bg-white border border-gray-200 rounded-lg py-1 px-2 text-[12px] mr-2"
                                    />
                                    <TextInput
                                        value={schedule.plan}
                                        onChangeText={(v) => updateSchedule(schedule.id, 'plan', v)}
                                        placeholder="장소/활동"
                                        className="flex-1 bg-white border border-gray-200 rounded-lg py-1 px-3 text-[12px] font-semibold"
                                    />
                                    {schedules.length > 1 && (
                                        <TouchableOpacity onPress={() => removeSchedule(schedule.id)} className="ml-2 justify-center">
                                            <X size={18} color="#D1D5DB" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <TextInput
                                    value={schedule.description}
                                    onChangeText={(v) => updateSchedule(schedule.id, 'description', v)}
                                    placeholder="상세 설명"
                                    className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-[11px] h-10"
                                />
                            </View>
                        ))}
                    </View>
                </View>

                {/* 7. Tag Section */}
                <View className="mb-10">
                    <Text className="font-extrabold text-[17px] mb-4">태그 (#)</Text>
                    <View className="flex-row flex-wrap gap-2 p-3 border border-gray-100 rounded-2xl bg-white min-h-[56px] items-center">
                        {tags.map((tag) => (
                            <View key={tag} className="bg-green-50 flex-row items-center px-3 py-1.5 rounded-full mr-2 mb-2">
                                <Text className="text-[#3CD371] text-[13px] font-bold">#{tag}</Text>
                                <TouchableOpacity onPress={() => removeTag(tag)} className="ml-1">
                                    <X size={12} color="#3CD371" />
                                </TouchableOpacity>
                            </View>
                        ))}
                        <TextInput
                            value={tagInput}
                            onChangeText={setTagInput}
                            onSubmitEditing={addTag}
                            placeholder={tags.length === 0 ? "태그 입력 후 엔터" : ""}
                            className="flex-1 text-[14px] min-w-[100px]"
                        />
                    </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    onPress={handleSubmit}
                    className="bg-[#3CD371] py-5 rounded-2xl shadow-lg mb-20 active:opacity-90"
                >
                    <Text className="text-white text-center font-black text-[18px]">모임 등록하기</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}