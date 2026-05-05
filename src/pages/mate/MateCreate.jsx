import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, ScrollView, TouchableOpacity,
    Alert, Platform, Dimensions, Image
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

const { width } = Dimensions.get('window');

export default function MateCreate() {
    const router = useRouter();
    const BACKEND_URL = "http://10.0.2.2:8082";

    // --- 사용자 & API 데이터 States ---
    const [userInfo, setUserInfo] = useState({ name: '익명 유저', profileImg: null });
    const [mountainList, setMountainList] = useState([]);

    // --- 폼 States ---
    const [title, setTitle] = useState('');
    const [mountain, setMountain] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState('08:00');
    const [location, setLocation] = useState('');
    const [capacity, setCapacity] = useState(4);
    const [level, setLevel] = useState('중급');

    const [schedules, setSchedules] = useState([{ id: Date.now(), time: '08:00', plan: '', description: '' }]);
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');

    const [images, setImages] = useState([]);

    // --- 산 검색 & 자동 매핑 States ---
    const [showDropdown, setShowDropdown] = useState(false);
    const [dbMountainImage, setDbMountainImage] = useState(null);
    const [selectedMountainData, setSelectedMountainData] = useState(null);

    // 1. 초기 데이터 로드 (유저 정보, 산 목록)
    useEffect(() => {
        const initData = async () => {
            const token = await AsyncStorage.getItem("jwtToken");

            if (token) {
                try {
                    const res = await axios.get(`${BACKEND_URL}/api/auth/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUserInfo({
                        name: res.data.nickname || res.data.userid || '익명 유저',
                        profileImg: res.data.profileImage || res.data.profileImg || null
                    });
                } catch (e) { console.error('유저 정보 에러:', e); }
            }

            try {
                const mtRes = await axios.get(`${BACKEND_URL}/api/mountains`);
                setMountainList(mtRes.data);
            } catch (e) { console.error('산 정보 로딩 에러:', e); }
        };
        initData();
    }, []);

    // 2. 산 선택 처리 로직
    const handleMountainSelect = (mt) => {
        setMountain(mt.name);
        setSelectedMountainData(mt);

        // 🔥 산 썸네일 경로 매핑 (웹 로직 완벽 이식)
        if (mt.imageUrl && !mt.imageUrl.includes('placeholder') && !mt.imageUrl.includes('default')) {
            const rawPath = mt.imageUrl.split(',')[0];
            if (rawPath.startsWith("http") && !rawPath.includes("8082") && !rawPath.includes("mountapp")) {
                setDbMountainImage(rawPath);
            } else {
                const filename = rawPath.split('\\').pop().split('/').pop();
                setDbMountainImage(`${BACKEND_URL}/images/${filename}`); // RN은 절대경로 필요
            }
        } else {
            setDbMountainImage(null);
        }

        // 🔥 난이도 자동 매핑
        if (mt.trails && mt.trails.length > 0 && mt.trails[0].difficulty) {
            let diff = mt.trails[0].difficulty;
            if (diff === '상') diff = '상급';
            else if (diff === '중') diff = '중급';
            else if (diff === '하') diff = '초급';
            setLevel(diff);
        }

        setShowDropdown(false);
    };

    const filteredMountains = mountainList.filter(mt => mt.name.includes(mountain));

    // 3. 이미지 핸들러
    const pickImage = async () => {
        const currentCount = images.length + (dbMountainImage ? 1 : 0);
        if (currentCount >= 5) {
            Alert.alert('알림', '사진은 최대 5장까지 가능합니다.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.7,
        });

        if (!result.canceled) {
            const newImages = result.assets.map(asset => ({
                uri: asset.uri,
                name: asset.fileName || `image_${Date.now()}.jpg`,
                type: 'image/jpeg'
            }));

            const totalAdded = [...images, ...newImages];
            if (totalAdded.length + (dbMountainImage ? 1 : 0) > 5) {
                Alert.alert('알림', '최대 5장을 초과하여 일부 이미지만 추가됩니다.');
                setImages(totalAdded.slice(0, 5 - (dbMountainImage ? 1 : 0)));
            } else {
                setImages(totalAdded);
            }
        }
    };

    const handleRemoveImage = (index) => setImages(images.filter((_, i) => i !== index));

    // 4. 기타 핸들러
    const addSchedule = () => setSchedules([...schedules, { id: Date.now(), time: '', plan: '', description: '' }]);
    const updateSchedule = (id, field, value) => setSchedules(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    const removeSchedule = (id) => schedules.length > 1 && setSchedules(schedules.filter(s => s.id !== id));

    const addTag = () => {
        const trimmed = tagInput.trim();
        if (trimmed && !tags.includes(trimmed)) {
            setTags([...tags, trimmed]);
            setTagInput('');
        }
    };
    const removeTag = (tagToRemove) => setTags(tags.filter(tag => tag !== tagToRemove));

    // 5. 서버 전송 로직 (웹 로직 완벽 이식)
    const handleSubmit = async () => {
        if (!title || !mountain || !location) {
            Alert.alert("알림", "필수 정보를 모두 입력해주세요!");
            return;
        }

        const token = await AsyncStorage.getItem("jwtToken");
        if (!token) {
            Alert.alert("알림", "로그인이 필요합니다.");
            return;
        }

        let mountainNotices = [];
        if (selectedMountainData && selectedMountainData.notices) {
            mountainNotices = selectedMountainData.notices.split('|').filter(n => n.trim() !== '');
        }

        // 🔥 산 데이터를 통한 코스 상세 정보 추출
        let courseName = `${mountain} 코스`;
        let courseDuration = "미상";
        let courseDistance = "미상";
        let courseDifficulty = level;

        if (selectedMountainData && selectedMountainData.trails && selectedMountainData.trails.length > 0) {
            const firstTrail = selectedMountainData.trails[0];
            courseName = firstTrail.name ? `${mountain} ${firstTrail.name}` : `${mountain} 코스`;
            courseDuration = firstTrail.uptime || "미상";
            courseDistance = firstTrail.distance || "미상";
        }

        const newEntry = {
            title: title,
            mountainName: mountain,
            elevation: selectedMountainData ? selectedMountainData.height : 0,
            status: "모집 중",
            deadline: date,
            tags: [
                { label: courseDifficulty, color: "green" },
                ...tags.map(tag => ({ label: tag, color: "gray" }))
            ],
            description: description,
            meeting: { date: `${date} ${time}`, location: location },
            course: {
                name: courseName,
                duration: courseDuration,
                difficulty: courseDifficulty,
                distance: courseDistance,
                image: dbMountainImage // 선택된 산의 기본 썸네일 전달
            },
            host: {
                name: userInfo.name,
                rating: 0,
                experience: "신규 회원",
                authCount: 0,
                bio: "잘 부탁드립니다!",
                profileImg: userInfo.profileImg
            },
            members: {
                current: 1, max: capacity,
                list: [{ name: userInfo.name, profileImg: userInfo.profileImg }]
            },
            schedule: schedules.map(s => ({ time: s.time, title: s.plan, desc: s.description })),
            notices: mountainNotices.length > 0 ? mountainNotices : ["안전한 산행 되세요!"]
        };

        const formData = new FormData();

        // RN용 FormData Json 첨부 방식
        formData.append("data", {
            string: JSON.stringify(newEntry),
            type: 'application/json',
        });

        images.forEach((img) => {
            formData.append("images", { // 웹 코드에서는 키값이 'images' 입니다
                uri: img.uri,
                name: img.name,
                type: img.type,
            });
        });

        try {
            const response = await axios.post(`${BACKEND_URL}/api/mates`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`
                }
            });
            Alert.alert("성공", "모임이 등록되었습니다!");
            router.back();
        } catch (error) {
            console.error("등록 에러:", error);
            Alert.alert("에러", "모임 등록에 실패했습니다.");
        }
    };

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row items-center px-4 pt-14 pb-4 bg-white border-b border-gray-50 z-50">
                <TouchableOpacity onPress={() => router.back()}>
                    <ChevronLeft size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text className="flex-1 text-center font-bold text-[16px]">모임 만들기</Text>
                <View className="w-6" />
            </View>

            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {/* 1. Photo Section */}
                <View className="mt-6 mb-10">
                    <Text className="font-extrabold text-[17px] mb-4">사진 등록 (최대 5장)</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row py-1">
                        <TouchableOpacity onPress={pickImage} className="w-20 h-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl items-center justify-center mr-2">
                            <Camera size={24} color="#9CA3AF" />
                            <Text className="text-[10px] text-gray-400 mt-1 font-bold">{images.length + (dbMountainImage ? 1 : 0)}/5</Text>
                        </TouchableOpacity>

                        {/* 산 기본 이미지 */}
                        {dbMountainImage && (
                            <View className="relative w-20 h-20 mr-2">
                                <Image source={{ uri: dbMountainImage }} className="w-full h-full rounded-xl" />
                                <TouchableOpacity onPress={() => { setDbMountainImage(null); setSelectedMountainData(null); }} className="absolute top-1 right-1 bg-black/50 rounded-full p-1">
                                    <X size={14} color="white" />
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* 사용자가 업로드한 이미지 */}
                        {images.map((img, i) => (
                            <View key={i} className="relative w-20 h-20 mr-2 border border-gray-200 rounded-xl overflow-hidden">
                                <Image source={{ uri: img.uri }} className="w-full h-full" />
                                <TouchableOpacity onPress={() => handleRemoveImage(i)} className="absolute top-1 right-1 bg-black/50 rounded-full p-1">
                                    <X size={14} color="white" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* 2. Mountain Section (자동완성 드롭다운 포함) */}
                <View className="mb-6 z-40">
                    <Text className="font-extrabold text-[17px] mb-4">어떤 산을 가시나요?</Text>
                    <View className="relative z-50">
                        <View className="absolute left-4 top-4 z-10">
                            <Search size={20} color="#9CA3AF" />
                        </View>
                        <TextInput
                            value={mountain}
                            onChangeText={(text) => { setMountain(text); setShowDropdown(true); }}
                            onFocus={() => setShowDropdown(true)}
                            placeholder="산 이름을 검색해주세요"
                            className="bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-[15px]"
                        />

                        {/* 연관 검색어 드롭다운 */}
                        {showDropdown && filteredMountains.length > 0 && (
                            <View className="absolute top-14 left-0 right-0 bg-white border border-gray-100 rounded-2xl shadow-lg z-50 max-h-48 overflow-hidden">
                                <ScrollView nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
                                    {filteredMountains.map(mt => (
                                        <TouchableOpacity
                                            key={mt.id}
                                            className="px-5 py-3.5 border-b border-gray-50"
                                            onPress={() => handleMountainSelect(mt)}
                                        >
                                            <Text className="text-[14px] text-gray-700 font-medium">{mt.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                    </View>
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