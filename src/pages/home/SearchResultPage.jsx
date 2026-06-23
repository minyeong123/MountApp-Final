    import React, { useState, useEffect } from "react";
    import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, SafeAreaView, ActivityIndicator } from "react-native";
    import { ChevronLeft, X, Heart, MessageCircle, Clock, Footprints, Star, Users, MapPin } from "lucide-react-native";
    import { useLocalSearchParams, useRouter } from "expo-router";
    import axios from "axios";

    // 🏔️ 데이터 및 모달 컴포넌트 임포트
    import { MOUNTAIN_DATA } from '../home/mountainData';
    import MountainCourse from "../home/MountainCourse";

    const BACKEND_URL = "http://10.0.2.2:8082";

    const renderSafeText = (value, fallback = "") => {
        if (value === null || value === undefined) return fallback;
        if (typeof value === "object") {
            if (value.title) return String(value.title);
            if (value.desc) return String(value.desc);
            if (value.name) return String(value.name);
            return fallback;
        }
        return String(value);
    };

    export default function SearchResultPage() {
        const { q } = useLocalSearchParams();
        const router = useRouter();

        const [searchQuery, setSearchQuery] = useState(typeof q === "string" ? q : "");
        const [activeTab, setActiveTab] = useState("전체");
        const [loading, setLoading] = useState(false);
        const [mountains, setMountains] = useState([]);

        // 🌟 코스 클릭 시 MountainCourse 모달을 열기 위한 상태값
        const [activeCourseData, setActiveCourseData] = useState(null);
        const [activeMountainId, setActiveMountainId] = useState(null);

        const [searchData, setSearchData] = useState({
            mountains: [],
            courses: [],
            posts: [],
            reviews: [],
            mates: []
        });

        const tabs = ["전체", "산", "코스", "게시글", "리뷰", "메이트"];

        const SectionDivider = () => (
            activeTab === "전체" ? <View className="h-2 bg-gray-100 -mx-4 my-6" /> : null
        );

        const getDifficultyStyle = (difficulty) => {
            if (!difficulty) return { label: '미정', bg: 'bg-gray-400' };
            if (difficulty.includes('상') || difficulty.includes('어려움')) return { label: '상급', bg: 'bg-red-500' };
            if (difficulty.includes('중') || difficulty.includes('보통')) return { label: '중급', bg: 'bg-yellow-500' };
            if (difficulty.includes('하') || difficulty.includes('초') || difficulty.includes('쉬움')) return { label: '초급', bg: 'bg-[#3CD371]' };
            return { label: difficulty, bg: 'bg-gray-400' };
        };

        const getCourseImageSource = (imageSource) => {
            if (!imageSource) return { uri: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=300&q=80' };
            return typeof imageSource === 'number' ? imageSource : { uri: imageSource };
        };

        const getMainImageUrl = (item) => {
            const isRealImage = (path) => {
                if (!path || typeof path !== 'string') return false;
                const lower = path.toLowerCase();
                return !(lower.includes('placeholder') || lower.includes('default') || lower === 'null');
            };

            let userUploaded = null;
            if (item.imageUrl) userUploaded = typeof item.imageUrl === 'string' ? item.imageUrl.split(',')[0] : item.imageUrl[0];
            else if (item.imageUrls && item.imageUrls.length > 0) userUploaded = item.imageUrls[0];
            else if (item.images && item.images.length > 0) userUploaded = typeof item.images[0] === 'string' ? item.images[0] : item.images[0].url;

            if (isRealImage(userUploaded)) {
                if (userUploaded.startsWith("http") && !userUploaded.includes("8082")) return userUploaded;
                const filename = userUploaded.split('\\').pop().split('/').pop();
                return `${BACKEND_URL}/uploads/${filename}`;
            }

            const mtName = item.mountainName || (item.course?.name ? item.course.name.split(' ')[0] : "");

            if (mtName && mountains.length > 0) {
                const matched = mountains.find(m =>
                    m.name === mtName || m.name.includes(mtName) || mtName.includes(m.name)
                );

                if (matched && isRealImage(matched.imageUrl)) {
                    const rawPath = matched.imageUrl.split(',')[0];
                    if (rawPath.startsWith("http") && !rawPath.includes("8082")) return rawPath;
                    const filename = rawPath.split('\\').pop().split('/').pop();
                    return `${BACKEND_URL}/images/${filename}`;
                }
            }

            return 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop';
        };

        const getProfileImageUrl = (path) => {
            if (!path || typeof path !== 'string') return null;
            if (path.startsWith("http")) return path;
            if (path.startsWith("/images/")) return `${BACKEND_URL}${path}`;
            const filename = path.split('\\').pop().split('/').pop();
            return `${BACKEND_URL}/uploads/${filename}`;
        };

        const fetchSearchResults = async (keyword) => {
            if (!keyword.trim()) return;

            const cleanKeyword = keyword.trim().replace(/\s+/g, "").toLowerCase();

            try {
                setLoading(true);
                const [searchRes, mtRes] = await Promise.all([
                    axios.get(`${BACKEND_URL}/api/search?q=${encodeURIComponent(keyword)}`),
                    axios.get(`${BACKEND_URL}/api/mountains`).catch(() => ({ data: [] }))
                ]);

                const allMountains = mtRes.data || [];
                setMountains(allMountains);

                if (searchRes.status === 200) {
                    const matchedBackendMountains = searchRes.data.mountains || [];
                    let finalLocalCourses = [];

                    if (MOUNTAIN_DATA && typeof MOUNTAIN_DATA === 'object') {
                        let matchedMountainIds = [];

                        allMountains.forEach(m => {
                            const mtName = (m.name || "").trim().replace(/\s+/g, "").toLowerCase();
                            if (mtName.includes(cleanKeyword) || cleanKeyword.includes(mtName)) {
                                const actualId = String(m.id || m.mountainId || "");
                                if (actualId && !matchedMountainIds.includes(actualId)) {
                                    matchedMountainIds.push(actualId);
                                }
                            }
                        });

                        matchedBackendMountains.forEach(bm => {
                            const actualId = String(bm.id || bm.mountainId || "");
                            if (actualId && !matchedMountainIds.includes(actualId)) {
                                matchedMountainIds.push(actualId);
                            }
                        });

                        matchedMountainIds.forEach(targetId => {
                            const trails = MOUNTAIN_DATA[targetId] || [];
                            const foundMountain = allMountains.find(m => String(m.id || m.mountainId) === targetId);
                            const displayMtName = foundMountain ? foundMountain.name : "추천 코스";

                            trails.forEach(trail => {
                                if (!finalLocalCourses.some(c => c.name === trail.name)) {
                                    finalLocalCourses.push({
                                        ...trail,
                                        id: trail.id,
                                        name: trail.name,
                                        description: trail.description,
                                        distance: trail.distance,
                                        duration: trail.uptime,
                                        difficulty: trail.difficulty,
                                        imageSource: trail.imageSource,
                                        mountainName: displayMtName,
                                        belongingMountainId: targetId
                                    });
                                }
                            });
                        });

                        if (finalLocalCourses.length === 0) {
                            Object.keys(MOUNTAIN_DATA).forEach(key => {
                                const trails = MOUNTAIN_DATA[key] || [];
                                const hasTrail = trails.some(t => t.name.replace(/\s+/g, "").toLowerCase().includes(cleanKeyword));

                                if (hasTrail) {
                                    const foundMountain = allMountains.find(m => String(m.id || m.mountainId) === key);
                                    const displayMtName = foundMountain ? foundMountain.name : "추천 코스";

                                    trails.forEach(trail => {
                                        if (trail.name.replace(/\s+/g, "").toLowerCase().includes(cleanKeyword)) {
                                            finalLocalCourses.push({
                                                ...trail,
                                                id: trail.id,
                                                name: trail.name,
                                                description: trail.description,
                                                distance: trail.distance,
                                                duration: trail.uptime,
                                                difficulty: trail.difficulty,
                                                imageSource: trail.imageSource,
                                                mountainName: displayMtName,
                                                belongingMountainId: key
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    }

                    setSearchData({
                        mountains: matchedBackendMountains,
                        courses: finalLocalCourses,
                        posts: searchRes.data.posts || [],
                        reviews: searchRes.data.reviews || [],
                        mates: searchRes.data.mates || []
                    });
                }
            } catch (error) {
                console.error("통합 검색 데이터 요청 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        useEffect(() => {
            if (q) {
                setSearchQuery(q);
                fetchSearchResults(q);
            }
        }, [q]);

        const handleSearchSubmit = () => {
            fetchSearchResults(searchQuery);
        };

        return (
            <SafeAreaView className="flex-1 bg-white">
                {/* 🔍 상단 검색 바 */}
                <View className="px-4 pt-2 pb-4 bg-white border-b border-gray-100 mt-6">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => router.back()} className="mr-3">
                            <ChevronLeft size={28} color="#1f2937" />
                        </TouchableOpacity>
                        <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-4 h-11">
                            <TextInput
                                className="flex-1 text-sm text-gray-800 pr-2"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholder="검색어 입력"
                                returnKeyType="search"
                                onSubmitEditing={handleSearchSubmit}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => { setSearchQuery(""); setSearchData({ mountains: [], courses: [], posts: [], reviews: [], mates: [] }); }}>
                                    <X size={18} color="#9ca3af" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* 탭 바 */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-5">
                        {tabs.map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                onPress={() => setActiveTab(tab)}
                                className={`mr-6 pb-2 ${activeTab === tab ? "border-b-2 border-emerald-600" : ""}`}
                            >
                                <Text className={`text-[15px] font-bold ${activeTab === tab ? "text-emerald-600" : "text-gray-400"}`}>
                                    {tab}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* ⏳ 메인 콘텐츠 바인딩 */}
                {loading ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#F59E6D" />
                    </View>
                ) : (
                    <ScrollView className="flex-1 p-4 bg-white" showsVerticalScrollIndicator={false}>

                        {/* 1. 산 섹션 */}
                        {(activeTab === "전체" || activeTab === "산") && searchData.mountains.length > 0 && (
                            <View>
                                <Text className="font-bold text-lg mb-3 text-gray-900">산 <Text className="text-emerald-600">{searchData.mountains.length}</Text></Text>
                                {searchData.mountains.map((mountain, idx) => {
                                    const targetId = mountain.id || mountain.mountainId;
                                    return (
                                        <TouchableOpacity
                                            key={idx}
                                            onPress={() => targetId && router.push(`/mountain/${targetId}`)}
                                            className="flex-row items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm mb-3"
                                        >
                                            <View className="w-20 h-20 bg-gray-200 rounded-xl overflow-hidden">
                                                <Image source={{ uri: mountain.image || "https://images.unsplash./photo-1624835269324-7edcc7df0f00?w=500&q=80" }} className="w-full h-full" resizeMode="cover" />
                                            </View>
                                            <View className="flex-1 ml-4">
                                                <Text className="font-bold text-[18px] text-gray-900">{renderSafeText(mountain.name)}</Text>
                                                <Text className="text-sm text-gray-500 mt-1">{renderSafeText(mountain.height, "높이 미정")} · {renderSafeText(mountain.location)}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                                <SectionDivider />
                            </View>
                        )}

                        {/* 2. 코스 섹션 (터치 시 똑같이 지도 모달 작동) */}
                        {(activeTab === "전체" || activeTab === "코스") && searchData.courses.length > 0 && (
                            <View>
                                <Text className="font-bold text-lg mb-3 text-gray-900">코스 <Text className="text-emerald-600">{searchData.courses.length}</Text></Text>
                                {searchData.courses.map((course, idx) => {
                                    const diffStyle = getDifficultyStyle(course.difficulty);
                                    return (
                                        <TouchableOpacity
                                            key={idx}
                                            activeOpacity={0.7}
                                            onPress={() => {
                                                setActiveMountainId(course.belongingMountainId);
                                                setActiveCourseData(course);
                                            }}
                                            className="flex-row mb-4 bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden"
                                        >
                                            <View className="w-28 h-28 bg-gray-100 rounded-l-3xl overflow-hidden">
                                                <Image source={getCourseImageSource(course.imageSource)} className="w-full h-full" resizeMode="cover" />
                                            </View>
                                            <View className="flex-1 p-4 justify-between">
                                                <View>
                                                    <View className="flex-row items-center justify-between">
                                                        <Text className="font-bold text-[14px] text-slate-900 flex-1" numberOfLines={1}>
                                                            {renderSafeText(course.name)}
                                                        </Text>
                                                        <Text className={`text-[9px] text-white font-bold px-1.5 py-0.5 rounded ml-1 ${diffStyle.bg}`}>
                                                            {diffStyle.label}
                                                        </Text>
                                                    </View>
                                                    <Text className="text-xs text-gray-400 mt-1 leading-4" numberOfLines={2}>
                                                        {renderSafeText(course.description)}
                                                    </Text>
                                                </View>
                                                <View className="flex-row items-center mt-2 gap-x-4">
                                                    <View className="flex-row items-center">
                                                        <Clock size={14} color="#F59E6D" />
                                                        <Text className="text-xs font-bold text-slate-700 ml-1">
                                                            {renderSafeText(course.duration)}
                                                        </Text>
                                                    </View>
                                                    <View className="flex-row items-center">
                                                        <Footprints size={14} color="#F59E6D" />
                                                        <Text className="text-xs font-bold text-slate-700 ml-1">
                                                            {renderSafeText(course.distance)}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                                <SectionDivider />
                            </View>
                        )}

                        {/* 3. 게시글 섹션 */}
                        {(activeTab === "전체" || activeTab === "게시글") && searchData.posts.length > 0 && (
                            <View>
                                <Text className="font-bold text-lg mb-3 text-gray-900">게시글 <Text className="text-emerald-600">{searchData.posts.length}</Text></Text>
                                {searchData.posts.map((post, idx) => {
                                    const targetId = post.postid;
                                    return (
                                        <TouchableOpacity
                                            key={idx}
                                            onPress={() => targetId && router.push(`/community/${targetId}`)}
                                            className="py-4 border-b border-gray-100"
                                        >
                                            <View className="flex-row justify-between items-start">
                                                <View className="flex-1 pr-2">
                                                    <Text className="text-xs text-gray-400 font-medium mb-1">{renderSafeText(post.category, "자유게시판")}</Text>
                                                    <Text className="font-bold text-[16px] text-slate-900" numberOfLines={1}>{renderSafeText(post.title)}</Text>
                                                    <Text className="text-sm text-gray-500 mt-1.5 leading-5" numberOfLines={2}>
                                                        {renderSafeText(post.postcontents, "내용이 없습니다.")}
                                                    </Text>
                                                </View>
                                                {post.imagePath && (
                                                    <View className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden ml-2 mt-2">
                                                        <Image source={{ uri: `${BACKEND_URL}/uploads/${post.imagePath}` }} className="w-full h-full" resizeMode="cover" />
                                                    </View>
                                                )}
                                            </View>
                                            <View className="flex-row items-center justify-between mt-4">
                                                <View className="flex-row items-center gap-x-3">
                                                    <View className="flex-row items-center">
                                                        <Heart size={15} color="#9ca3af" />
                                                        <Text className="text-xs text-gray-400 ml-1">{renderSafeText(post.likes, "0")}</Text>
                                                    </View>
                                                </View>
                                                <Text className="text-xs text-gray-400">{renderSafeText(post.postdate, "방금 전")}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                                <SectionDivider />
                            </View>
                        )}

                        {/* 4. 리뷰 섹션 */}
                        {(activeTab === "전체" || activeTab === "리뷰") && searchData.reviews.length > 0 && (
                            <View>
                                <Text className="font-bold text-lg mb-3 text-gray-900">리뷰 <Text className="text-emerald-600">{searchData.reviews.length}</Text></Text>
                                {searchData.reviews.map((review, idx) => {
                                    const targetId = review.postid;
                                    return (
                                        <TouchableOpacity
                                            key={idx}
                                            onPress={() => targetId && router.push(`/community/${targetId}`)}
                                            className="py-5 border-b border-gray-100 bg-white"
                                        >
                                            <View className="flex-row items-start mb-4">
                                                <View className="flex-1 mr-4">
                                                    <View className="flex-row items-center mb-1.5">
                                                        <Text className="text-gray-400 text-[11px] mr-2">{renderSafeText(review.category, "리뷰")}</Text>
                                                        <View className="flex-row items-center">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    size={11}
                                                                    color={i < Math.floor(review.rating || 0) ? "#fbbf24" : "#d1d5db"}
                                                                    fill={i < Math.floor(review.rating || 0) ? "#fbbf24" : "transparent"}
                                                                    style={{ marginRight: 1 }}
                                                                />
                                                            ))}
                                                            <Text className="ml-1 text-[11px] font-bold text-amber-500">{Number(review.rating || 0).toFixed(1)}</Text>
                                                        </View>
                                                    </View>
                                                    <Text className="font-bold text-gray-900 mb-1" numberOfLines={1}>{renderSafeText(review.title)}</Text>
                                                    <Text className="text-gray-500 text-[13px] leading-5" numberOfLines={2}>{renderSafeText(review.postcontents, "리뷰 내용이 없습니다.")}</Text>
                                                </View>
                                                {review.imagePath && (
                                                    <View className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 self-center">
                                                        <Image source={{ uri: `${BACKEND_URL}/uploads/${review.imagePath}` }} className="w-full h-full" resizeMode="cover" />
                                                    </View>
                                                )}
                                            </View>
                                            <View className="flex-row items-center justify-between">
                                                <Text className="text-gray-400 text-[11px]">좋아요 {renderSafeText(review.likes, "0")}</Text>
                                                <Text className="text-gray-400 text-[11px]">{renderSafeText(review.postdate, "방금 전")}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                                <SectionDivider />
                            </View>
                        )}

                        {/* 5. 메이트 섹션 */}
                        {(activeTab === "전체" || activeTab === "메이트") && searchData.mates.length > 0 && (
                            <View className="mb-12">
                                <Text className="font-bold text-lg mb-4 text-gray-900">
                                    메이트 모집 <Text className="text-emerald-600">{searchData.mates.length}</Text>
                                </Text>

                                {searchData.mates.map((mate) => {
                                    const targetId = mate.id;
                                    const currentNum = mate.members?.current ?? 1;
                                    const maxNum = mate.members?.max ?? 4;
                                    const diffStyle = getDifficultyStyle(mate.course?.difficulty);
                                    const displayDistance = mate.course?.distance || "거리 미상";
                                    const displayDuration = mate.course?.duration || "시간 미상";
                                    const displayAuthor = mate.host?.name || "익명";

                                    return (
                                        <View key={mate.id} className="bg-white mb-3 pt-5 px-4 pb-6 shadow-sm border-t-8 border-gray-50">
                                            <View className="flex-row justify-between items-center mb-4 relative z-20">
                                                <View className="flex-row items-center">
                                                    <View className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-200 mr-3 flex-shrink-0 items-center justify-center">
                                                        {mate.host?.profileImg ? (
                                                            <Image source={{ uri: getProfileImageUrl(mate.host.profileImg) }} className="w-full h-full" />
                                                        ) : (
                                                            <Text className="text-gray-400 text-xs">👤</Text>
                                                        )}
                                                    </View>
                                                    <View className="justify-center">
                                                        <Text className="text-[14px] font-bold text-gray-800">{displayAuthor}</Text>
                                                        <Text className="text-[11px] text-gray-400 font-medium">방금 전</Text>
                                                    </View>
                                                </View>
                                            </View>

                                            <TouchableOpacity
                                                onPress={() => targetId && router.push(`/mate/${targetId}`)}
                                                className="rounded-2xl overflow-hidden mb-4 bg-gray-100 shadow-sm relative -mx-1"
                                            >
                                                <Image source={{ uri: getMainImageUrl(mate) }} className="w-full h-64" resizeMode="cover" />
                                                <View className="absolute top-4 left-4">
                                                    <View className="bg-white/90 px-3 py-1 rounded-lg shadow-sm">
                                                        <Text className="text-gray-800 text-[11px] font-bold">{mate.deadline || "D-Day"}</Text>
                                                    </View>
                                                </View>
                                                <View className="absolute top-4 right-4">
                                                    <View className={`px-3 py-1 rounded-lg ${diffStyle.bg} shadow-lg`}>
                                                        <Text className="text-white text-[11px] font-bold">{diffStyle.label}</Text>
                                                    </View>
                                                </View>
                                                <View className="absolute bottom-4 right-4 bg-black/60 px-3 py-1.5 rounded-full flex-row items-center">
                                                    <Users size={12} color="white" />
                                                    <Text className="text-white text-[11px] font-bold ml-1.5">
                                                        {currentNum}/{maxNum}명 참여중
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>

                                            <View className="px-1">
                                                <View className="flex-row justify-between items-center mb-4">
                                                    <View className="flex-row items-center space-x-3">
                                                        <View className="flex-row items-center mr-3">
                                                            <Heart size={24} color="#6B7280" />
                                                            {mate.likesCount > 0 && (
                                                                <Text className="text-[14px] font-bold text-red-600 ml-1">{mate.likesCount}</Text>
                                                            )}
                                                        </View>
                                                        <MessageCircle size={24} color="#6B7280" />
                                                    </View>

                                                    <TouchableOpacity
                                                        onPress={() => targetId && router.push(`/mate/${targetId}`)}
                                                        className="bg-[#F59E6D] px-5 py-2 rounded-full shadow-sm"
                                                    >
                                                        <Text className="text-white text-[13px] font-extrabold">자세히 보기</Text>
                                                    </TouchableOpacity>
                                                </View>

                                                <Text className="text-[19px] font-extrabold text-gray-900 leading-tight tracking-tight mb-2">{renderSafeText(mate.title)}</Text>

                                                <View className="flex-row items-center mb-2">
                                                    <View className="flex-row items-center mr-3">
                                                        <MapPin size={14} color="#F59E6D" />
                                                        <Text className="text-[#F59E6D] text-[13px] font-bold ml-1.5">{displayDistance}</Text>
                                                    </View>
                                                    <View className="flex-row items-center">
                                                        <Clock size={14} color="#F59E6D" />
                                                        <Text className="text-[#F59E6D] text-[13px] font-bold ml-1.5">{displayDuration}</Text>
                                                    </View>
                                                </View>

                                                <Text className="text-gray-600 text-[14px] leading-relaxed mb-3" numberOfLines={2}>
                                                    {renderSafeText(mate.description || mate.desc || "상세 내용이 없습니다.")} <Text className="text-gray-400">더보기</Text>
                                                </Text>

                                                {mate.tags && mate.tags.length > 0 && (
                                                    <View className="flex-row flex-wrap mt-1">
                                                        {mate.tags.map((tag, tagIdx) => (
                                                            <View key={tagIdx} className="bg-[#F0F7FF] px-2.5 py-1 rounded-md mr-2 mb-2">
                                                                <Text className="text-[#55ACEE] text-[12px] font-bold">
                                                                    #{typeof tag === 'string' ? tag : (tag.label || tag.title)}
                                                                </Text>
                                                            </View>
                                                        ))}
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        )}

                        {/* ⚠️ 결과 없음 처리 */}
                        {searchData.mountains.length === 0 && searchData.courses.length === 0 && searchData.posts.length === 0 && searchData.reviews.length === 0 && searchData.mates.length === 0 && (
                            <View className="py-20 items-center justify-center">
                                <Text className="text-gray-400 text-sm">'{renderSafeText(searchQuery)}'에 대한 검색 결과가 없습니다.</Text>
                            </View>
                        )}

                    </ScrollView>
                )}

                {/* 🌟 팝업 트리거 컨트롤러 */}
                {activeCourseData && activeMountainId && (
                    <MountainCourse
                        id={activeMountainId}
                        initialTrail={activeCourseData}
                        onClose={() => {
                            setActiveCourseData(null);
                            setActiveMountainId(null);
                        }}
                    />
                )}
            </SafeAreaView>
        );
    }