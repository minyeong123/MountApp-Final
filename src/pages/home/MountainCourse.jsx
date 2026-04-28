import React, { useEffect, useState, useRef } from "react";
import {
    View, Text, Image, ScrollView, TouchableOpacity,
    StyleSheet, Modal, Dimensions
} from "react-native";
import { useLocalSearchParams } from "expo-router"; // 앱용 파라미터 훅
import { Footprints, Timer, X, LocateFixed, Play, Pause } from "lucide-react-native";

const { width } = Dimensions.get("window");

// 🔥 백엔드 이미지 주소 연동 (로컬 이미지의 경우)
const getDebuggingUrl = () => {
    return "http://10.0.2.2:8082"; // [1] 에뮬레이터용
    // return "http://mountapp.mooo.com:8082"; // [3] DDNS 외부망 테스트용
};

const API_BASE_URL = getDebuggingUrl();
const getSafeImageSource = (path) => {
    if (!path) return { uri: "https://placehold.co/400x300?text=No+Image" };
    if (path.startsWith("http")) return { uri: path };
    return { uri: `${API_BASE_URL}${path}` };
};

// 🗺️ 하드코딩된 산 코스 데이터 (기존과 100% 동일)
const MOUNTAIN_DATA = {
    "1": [
        {
            id: 11, name: "북한산 백운대 코스", difficulty: "어려움", uptime: "2시간 30분", distance: "4.2km",
            description: "북한산의 최고봉 백운대를 오르는 코스로, 인수봉과 만경대의 절경을 감상할 수 있습니다.",
            imageUrl: "/images/bukhan_c1.jpg",
        },
        {
            id: 12, name: "원효봉 코스", difficulty: "쉬움", uptime: "1시간 30분", distance: "2.7km",
            description: "북한산 입문 코스로 추천하며, 원효봉 정상에서 바라보는 백운대와 만경대의 파노라마 뷰가 일품입니다.",
            imageUrl: "/images/bukhan_c2.jpg",
        }
    ],
    "2": [
        {
            id: 13, name: "울산바위 코스", difficulty: "보통", uptime: "2시간", distance: "3.8km",
            description: "설악산의 상징과도 같은 기암괴석 울산바위에 오르는 대표적인 코스입니다.",
            imageUrl: "https://placehold.co/400x300?text=Seorak+Ulsan",
        },
        {
            id: 14, name: "비룡폭포(토왕성폭포) 코스", difficulty: "쉬움", uptime: "1시간 30분", distance: "2.4km",
            description: "시원한 물줄기와 함께 굽이치는 계곡을 따라 걷는 힐링 코스입니다.",
            imageUrl: "https://placehold.co/400x300?text=Seorak+Falls",
        }
    ],
    "3": [
        {
            id: 15, name: "성판악 코스", difficulty: "어려움", uptime: "4시간 30분", distance: "9.6km",
            description: "백록담 정상을 정복할 수 있는 가장 대중적인 코스로, 완만한 경사가 길게 이어집니다.",
            imageUrl: "https://placehold.co/400x300?text=Halla+Seongpanak",
        },
        {
            id: 16, name: "영실 코스", difficulty: "보통", uptime: "2시간 30분", distance: "5.8km",
            description: "영실기암의 절경을 감상하며 윗세오름까지 오르는 가장 아름다운 코스입니다.",
            imageUrl: "https://placehold.co/400x300?text=Halla+Yeongsil",
        }
    ],
    "4": [
        {
            id: 17, name: "천왕봉 최단 코스 (중산리)", difficulty: "어려움", uptime: "5시간", distance: "10.4km",
            description: "지리산 최고봉 천왕봉을 가장 빠르게 만날 수 있지만, 가파른 경사가 특징입니다.",
            imageUrl: "https://placehold.co/400x300?text=Jiri+Cheonwang",
        },
        {
            id: 18, name: "노고단 코스", difficulty: "쉬움", uptime: "1시간 30분", distance: "3.2km",
            description: "성삼재에서 시작하여 누구나 쉽게 구름 위의 노고단 정원을 만날 수 있습니다.",
            imageUrl: "https://placehold.co/400x300?text=Jiri+Nogodan",
        }
    ],
    "5": [
        {
            id: 19, name: "내장사 힐링 코스", difficulty: "쉬움", uptime: "1시간", distance: "3.0km",
            description: "단풍 터널을 지나 내장사까지 평탄하게 걷는 가족형 힐링 코스입니다.",
            imageUrl: "https://placehold.co/400x300?text=Naejang+Temple",
        },
        {
            id: 20, name: "신선봉 대표 코스", difficulty: "보통", uptime: "3시간 30분", distance: "6.5km",
            description: "내장산의 최고봉인 신선봉에 올라 8개 봉우리를 조망할 수 있는 코스입니다.",
            imageUrl: "https://placehold.co/400x300?text=Naejang+Peak",
        }
    ]
};

export default function MountainCourse({ trails: propsTrails }) {
    const { id } = useLocalSearchParams();
    const [selectedTrail, setSelectedTrail] = useState(null);
    const [isNavigating, setIsNavigating] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [workoutData, setWorkoutData] = useState({ time: "00:00:00", distance: "0.0" });

    // 전달받은 trails가 없으면 하드코딩 데이터 사용
    const trails = propsTrails && propsTrails.length > 0 ? propsTrails : (MOUNTAIN_DATA[id] || []);

    const formatTime = (totalSeconds) => {
        const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    // 실시간 위치 추적 관련
    const moveToCurrentLocation = () => {
        console.log("현재 위치로 이동 (앱 WebView 연동 필요)");
    };

    const startNavigation = () => {
        setIsNavigating(true);
        setIsPaused(false);
    };

    const togglePause = () => setIsPaused(!isPaused);

    const stopNavigation = () => {
        setIsNavigating(false);
        setIsPaused(false);
        setSeconds(0);
    };

    // 타이머
    useEffect(() => {
        let timer = null;
        if (isNavigating && !isPaused) {
            timer = setInterval(() => setSeconds((prev) => prev + 1), 1000);
        } else {
            clearInterval(timer);
        }
        return () => clearInterval(timer);
    }, [isNavigating, isPaused]);

    useEffect(() => {
        setWorkoutData((prev) => ({ time: formatTime(seconds), distance: prev.distance }));
    }, [seconds]);


    return (
        <View style={styles.container}>
            {/* 상단 타이틀 및 코스 리스트 */}
            <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>추천 탐방 코스</Text>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{trails.length}개</Text>
                </View>
            </View>

            <View style={styles.listContainer}>
                {trails.map((trail, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.card}
                        onPress={() => setSelectedTrail(trail)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.cardImageContainer}>
                            <Image source={getSafeImageSource(trail.imageUrl)} style={styles.cardImage} resizeMode="cover" />
                        </View>
                        <View style={styles.cardContent}>
                            <View>
                                <Text style={styles.cardTitle} numberOfLines={1}>{trail.name}</Text>
                                <Text style={styles.cardDesc} numberOfLines={2}>{trail.description}</Text>
                            </View>
                            <View style={styles.cardMeta}>
                                <View style={styles.metaItem}>
                                    <Timer size={13} color="#16a34a" />
                                    <Text style={styles.metaText}>{trail.uptime}</Text>
                                </View>
                                <View style={styles.metaItem}>
                                    <Footprints size={13} color="#059669" />
                                    <Text style={styles.metaText}>{trail.distance}</Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            {/* 🔥 길 찾기 모달 (기존 애니메이션 모달 완벽 재현) */}
            <Modal
                visible={!!selectedTrail}
                transparent={true}
                animationType="slide"
                onRequestClose={() => { setSelectedTrail(null); stopNavigation(); }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {/* 헤더 */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{selectedTrail?.name}</Text>
                            <TouchableOpacity onPress={() => { setSelectedTrail(null); stopNavigation(); }} style={styles.closeButton}>
                                <X size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        {/* 지도 영역 (앱에서는 WebView로 대체해야 함) */}
                        <View style={styles.mapArea}>
                            <View style={styles.mapPlaceholder}>
                                <Text style={styles.mapPlaceholderText}>
                                    🗺️ 카카오맵 지도 영역{'\n'}
                                    (앱 연동을 위해 react-native-webview 설치가 필요합니다)
                                </Text>
                            </View>
                            {isNavigating && (
                                <TouchableOpacity style={styles.locateButton} onPress={moveToCurrentLocation}>
                                    <LocateFixed size={20} color="#059669" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* 하단 정보 및 컨트롤 */}
                        <View style={styles.controlArea}>
                            {!isNavigating ? (
                                <>
                                    <View style={styles.infoBoxes}>
                                        <View style={[styles.infoBox, { backgroundColor: '#f0fdf4' }]}>
                                            <View style={[styles.iconWrapper, { backgroundColor: '#15803d' }]}>
                                                <Timer size={16} color="white" />
                                            </View>
                                            <View>
                                                <Text style={[styles.infoBoxLabel, { color: '#15803d' }]}>예상 시간</Text>
                                                <Text style={styles.infoBoxValue}>{selectedTrail?.uptime}</Text>
                                            </View>
                                        </View>
                                        <View style={[styles.infoBox, { backgroundColor: '#ecfdf5' }]}>
                                            <View style={[styles.iconWrapper, { backgroundColor: '#047857' }]}>
                                                <Footprints size={16} color="white" />
                                            </View>
                                            <View>
                                                <Text style={[styles.infoBoxLabel, { color: '#047857' }]}>총 거리</Text>
                                                <Text style={styles.infoBoxValue}>{selectedTrail?.distance}</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <TouchableOpacity style={styles.startButton} onPress={startNavigation} activeOpacity={0.8}>
                                        <Text style={styles.startButtonText}>길 찾기 시작</Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <View style={styles.navigatingContainer}>
                                    <View style={styles.activeInfoBoxes}>
                                        <View style={styles.timeBox}>
                                            <Text style={styles.timeBoxLabel}>현재 운동 시간</Text>
                                            <Text style={styles.timeBoxValue}>{workoutData.time}</Text>
                                        </View>
                                        <View style={styles.distBox}>
                                            <Text style={styles.distBoxLabel}>이동 거리</Text>
                                            <Text style={styles.distBoxValue}>{workoutData.distance} <Text style={{fontSize: 14}}>km</Text></Text>
                                        </View>
                                    </View>
                                    <View style={styles.actionButtons}>
                                        <TouchableOpacity
                                            style={[styles.pauseButton, isPaused ? styles.resumeButton : null]}
                                            onPress={togglePause}
                                            activeOpacity={0.8}
                                        >
                                            {isPaused ? (
                                                <><Play size={18} color="white" /><Text style={styles.resumeButtonText}>재시작</Text></>
                                            ) : (
                                                <><Pause size={18} color="#6b7280" /><Text style={styles.pauseButtonText}>일시정지</Text></>
                                            )}
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.stopButton} onPress={stopNavigation} activeOpacity={0.8}>
                                            <Text style={styles.stopButtonText}>운동 종료</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

// 🔥 기존 Tailwind CSS 디자인을 완벽히 구현한 StyleSheet
const styles = StyleSheet.create({
    container: { padding: 16, backgroundColor: 'white', minHeight: 400 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
    badge: { backgroundColor: 'white', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
    badgeText: { fontSize: 12, color: '#6b7280', fontWeight: 'bold' },
    listContainer: { gap: 12 },
    card: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 12, height: 110, overflow: 'hidden', borderWidth: 1, borderColor: '#f3f4f6' },
    cardImageContainer: { width: 110, height: '100%', backgroundColor: '#e5e7eb' },
    cardImage: { width: '100%', height: '100%' },
    cardContent: { flex: 1, padding: 12, justifyContent: 'space-between' },
    cardTitle: { fontSize: 14, fontWeight: 'bold', color: '#1f2937' },
    cardDesc: { fontSize: 12, color: '#6b7280', marginTop: 4, lineHeight: 18 },
    cardMeta: { flexDirection: 'row', gap: 12 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: 11, color: '#4b5563', fontWeight: '600' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '90%', overflow: 'hidden' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
    closeButton: { padding: 6, backgroundColor: '#f3f4f6', borderRadius: 999 },

    mapArea: { width: '100%', height: 320, backgroundColor: '#f3f4f6', position: 'relative' },
    mapPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
    mapPlaceholderText: { textAlign: 'center', color: '#9ca3af', fontSize: 14, lineHeight: 22 },
    locateButton: { position: 'absolute', bottom: 16, right: 16, backgroundColor: 'white', padding: 12, borderRadius: 999, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 4 },

    controlArea: { padding: 24, gap: 16 },
    infoBoxes: { flexDirection: 'row', gap: 16 },
    infoBox: { flex: 1, padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconWrapper: { padding: 8, borderRadius: 8 },
    infoBoxLabel: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 2 },
    infoBoxValue: { fontSize: 14, fontWeight: 'bold', color: '#1f2937' },

    startButton: { width: '100%', paddingVertical: 16, backgroundColor: '#064e3b', borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
    startButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

    navigatingContainer: { gap: 16 },
    activeInfoBoxes: { flexDirection: 'row', gap: 16 },
    timeBox: { flex: 1, backgroundColor: '#064e3b', padding: 20, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
    timeBoxLabel: { fontSize: 11, color: '#a7f3d0', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4 },
    timeBoxValue: { fontSize: 24, fontWeight: '900', color: 'white', letterSpacing: 1 },

    distBox: { flex: 1, backgroundColor: 'white', borderWidth: 2, borderColor: '#064e3b', padding: 20, borderRadius: 20 },
    distBoxLabel: { fontSize: 11, color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4 },
    distBoxValue: { fontSize: 24, fontWeight: '900', color: '#064e3b' },

    actionButtons: { flexDirection: 'row', gap: 12 },
    pauseButton: { flex: 1, paddingVertical: 16, backgroundColor: '#f3f4f6', borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    resumeButton: { backgroundColor: '#f59e0b' },
    pauseButtonText: { color: '#6b7280', fontWeight: 'bold', fontSize: 15 },
    resumeButtonText: { color: 'white', fontWeight: 'bold', fontSize: 15 },

    stopButton: { flex: 2, paddingVertical: 16, backgroundColor: '#ef4444', borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
    stopButtonText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
});