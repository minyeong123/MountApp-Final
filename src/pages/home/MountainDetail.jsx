import React, { useEffect, useState } from "react";
import {
    View, Text, Image, ScrollView, TouchableOpacity,
    ActivityIndicator, Dimensions, StyleSheet, SafeAreaView
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Mountain as MountainIcon, Flag, Info, CheckCircle2 } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// 🔥 방금 앱용으로 변환한 컴포넌트들을 불러옵니다!
import MountainCourse from "./MountainCourse";
import MountainWeather from "./MountainWeather";

const LOGO_IMAGE = require("../../assets/logo.png");
const { width } = Dimensions.get("window");

const getDebuggingUrl = () => {
    return "http://10.0.2.2:8082"; // [1] 에뮬레이터용
    // return "http://mountapp.mooo.com:8082"; // [3] DDNS 외부망 테스트용
};

const API_BASE_URL = getDebuggingUrl();

export default function MountainDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [mountain, setMountain] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("home");

    // 사진 스와이프를 위한 인덱스 상태
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const getSafeImageSource = (path) => {
        if (!path || typeof path !== 'string') return LOGO_IMAGE;
        if (path.startsWith("http") && !path.includes("8082") && !path.includes("mountapp.mooo.com")) {
            return { uri: path };
        }
        const filename = path.split('\\').pop().split('/').pop();
        return { uri: `${API_BASE_URL}/uploads/${filename}` };
    };

    useEffect(() => {
        const fetchMountainDetail = async () => {
            try {
                const token = await AsyncStorage.getItem("jwtToken");
                const res = await axios.get(`${API_BASE_URL}/api/mountains/${id}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                setMountain(res.data);
            } catch (error) {
                console.error("산 상세 정보 로딩 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchMountainDetail();
        }
    }, [id]);

    const handleScroll = (event) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
        setCurrentImageIndex(index);
    };

    if (loading) return (
        <SafeAreaView style={styles.center}><ActivityIndicator size="large" color="#15803d" /><Text style={{marginTop:10}}>로딩 중...</Text></SafeAreaView>
    );

    if (!mountain) return (
        <SafeAreaView style={styles.center}><Text>산 정보를 찾을 수 없습니다.</Text></SafeAreaView>
    );

    const images = mountain.imageUrl ? mountain.imageUrl.split(",") : [];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <ScrollView style={styles.container}>
                {/* 헤더 영역 */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft size={24} color="#374151" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{mountain.name}</Text>
                </View>

                {/* 이미지 스와이프 영역 */}
                <View style={styles.imageContainer}>
                    {images.length > 0 ? (
                        <>
                            <ScrollView
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                onMomentumScrollEnd={handleScroll}
                                style={{ width: width, height: 250 }}
                            >
                                {images.map((imgUrl, index) => (
                                    <Image
                                        key={index}
                                        source={getSafeImageSource(imgUrl)}
                                        style={{ width: width, height: 250 }}
                                        resizeMode="cover"
                                    />
                                ))}
                            </ScrollView>
                            {images.length > 1 && (
                                <View style={styles.indicatorContainer}>
                                    <Text style={styles.indicatorText}>
                                        {currentImageIndex + 1} / {images.length}
                                    </Text>
                                </View>
                            )}
                        </>
                    ) : (
                        <Image source={LOGO_IMAGE} style={{ width: width, height: 250 }} resizeMode="contain" />
                    )}
                </View>

                <View style={styles.descriptionBox}>
                    <Text style={styles.descriptionText}>{mountain.description}</Text>
                </View>

                {/* 탭 버튼 영역 */}
                <View style={styles.tabContainer}>
                    {["home", "course", "weather", "notice"].map((t) => (
                        <TouchableOpacity key={t} onPress={() => setTab(t)} style={[styles.tabButton, tab === t && styles.activeTab]}>
                            <Text style={[styles.tabText, tab === t && styles.activeTabText]}>
                                {t === "home" ? "홈" : t === "course" ? "코스" : t === "weather" ? "날씨" : "유의사항"}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* 탭 내용 렌더링 영역 */}
                <View style={styles.content}>
                    {tab === "home" && (
                        <View style={styles.infoCard}>
                            <View style={styles.infoGrid}>
                                <View style={styles.infoItem}>
                                    <Text style={styles.infoLabel}>최고 고도</Text>
                                    <View style={styles.infoRow}><MountainIcon size={20} color="#15803d" /><Text style={styles.infoValue}>{mountain.height || 0}m</Text></View>
                                </View>
                                <View style={styles.infoItem}>
                                    <Text style={styles.infoLabel}>난이도</Text>
                                    <View style={styles.infoRow}><Flag size={20} color="#eab308" /><Text style={styles.infoValue}>보통</Text></View>
                                </View>
                            </View>
                        </View>
                    )}

                    {tab === "notice" && (
                        mountain.notices ? (
                            mountain.notices.split("|").map((n, i) => (
                                <View key={i} style={styles.noticeItem}><CheckCircle2 size={20} color="#22c55e" /><Text style={styles.noticeText}>{n.trim()}</Text></View>
                            ))
                        ) : (
                            <Text style={styles.emptyText}>등록된 유의사항이 없습니다.</Text>
                        )
                    )}

                    {/* 🔥 정보 준비 중... 텍스트를 지우고 실제 컴포넌트 연결! */}
                    {tab === "course" && <MountainCourse trails={mountain.trails} />}
                    {tab === "weather" && <MountainWeather mountain={mountain} />}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f9fafb" },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 16, backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: '#eee' },
    backButton: { position: "absolute", left: 16 },
    headerTitle: { fontSize: 18, fontWeight: "800" },

    imageContainer: { width: width, height: 250, backgroundColor: "#f3f4f6", position: 'relative' },
    indicatorContainer: { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(0, 0, 0, 0.6)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 15 },
    indicatorText: { color: 'white', fontSize: 12, fontWeight: 'bold' },

    descriptionBox: { padding: 20, backgroundColor: "white" },
    descriptionText: { color: "#4b5563", fontSize: 15, lineHeight: 22 },
    tabContainer: { flexDirection: "row", justifyContent: "space-around", backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
    tabButton: { paddingVertical: 15, paddingHorizontal: 10 },
    activeTab: { borderBottomWidth: 3, borderBottomColor: "#15803d" },
    tabText: { fontSize: 14, fontWeight: "700", color: "#9ca3af" },
    activeTabText: { color: "#15803d" },
    content: { padding: 16 },
    infoCard: { backgroundColor: "white", borderRadius: 15, padding: 20, borderWidth: 1, borderColor: "#e5e7eb" },
    infoGrid: { flexDirection: "row", justifyContent: "space-around" },
    infoItem: { alignItems: "center" },
    infoLabel: { color: "#9ca3af", fontSize: 12, marginBottom: 6 },
    infoRow: { flexDirection: "row", alignItems: "center" },
    infoValue: { fontSize: 18, fontWeight: "800", marginLeft: 6 },
    noticeItem: { flexDirection: "row", backgroundColor: "white", padding: 15, borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb", marginBottom: 10, alignItems: "center" },
    noticeText: { marginLeft: 10, fontSize: 14, color: "#374151" },
    emptyText: { textAlign: "center", color: "#9ca3af", marginTop: 40 }
});