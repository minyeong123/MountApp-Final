import React, { useEffect, useState } from "react";
import {
    View, Text, Image, ScrollView, TouchableOpacity,
    ActivityIndicator, Dimensions, StyleSheet, SafeAreaView
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Mountain as MountainIcon, Flag, Info, CheckCircle2 } from "lucide-react-native";

const LOGO_IMAGE = require("../../assets/logo.png");
const { width } = Dimensions.get("window");

export default function MountainDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [mountain, setMountain] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("home");

    useEffect(() => {
        const fakeMountainData = {
            id: id,
            name: id === "1" ? "설악산" : id === "2" ? "북한산" : "한라산",
            description: "이곳은 상세 설명입니다. 네이티브 환경에 맞춰 레이아웃을 구성했습니다.",
            height: 1708,
            notices: "입산 시간을 확인하세요 | 화기 엄금 | 쓰레기 되가져가기"
        };
        setTimeout(() => { setMountain(fakeMountainData); setLoading(false); }, 600);
    }, [id]);

    if (loading) return (
        <SafeAreaView style={styles.center}><ActivityIndicator size="large" color="#15803d" /><Text style={{marginTop:10}}>로딩 중...</Text></SafeAreaView>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}><ArrowLeft size={24} color="#374151" /></TouchableOpacity>
                    <Text style={styles.headerTitle}>{mountain.name}</Text>
                </View>

                <View style={styles.imageContainer}>
                    <Image source={LOGO_IMAGE} style={styles.mainImage} resizeMode="contain" />
                </View>

                <View style={styles.descriptionBox}><Text style={styles.descriptionText}>{mountain.description}</Text></View>

                <View style={styles.tabContainer}>
                    {["home", "course", "weather", "notice"].map((t) => (
                        <TouchableOpacity key={t} onPress={() => setTab(t)} style={[styles.tabButton, tab === t && styles.activeTab]}>
                            <Text style={[styles.tabText, tab === t && styles.activeTabText]}>{t === "home" ? "홈" : t === "course" ? "코스" : t === "weather" ? "날씨" : "유의사항"}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.content}>
                    {tab === "home" && (
                        <View style={styles.infoCard}>
                            <View style={styles.infoGrid}>
                                <View style={styles.infoItem}>
                                    <Text style={styles.infoLabel}>최고 고도</Text>
                                    <View style={styles.infoRow}><MountainIcon size={20} color="#15803d" /><Text style={styles.infoValue}>{mountain.height}m</Text></View>
                                </View>
                                <View style={styles.infoItem}>
                                    <Text style={styles.infoLabel}>난이도</Text>
                                    <View style={styles.infoRow}><Flag size={20} color="#eab308" /><Text style={styles.infoValue}>보통</Text></View>
                                </View>
                            </View>
                        </View>
                    )}
                    {tab === "notice" && mountain.notices.split("|").map((n, i) => (
                        <View key={i} style={styles.noticeItem}><CheckCircle2 size={20} color="#22c55e" /><Text style={styles.noticeText}>{n.trim()}</Text></View>
                    ))}
                    {(tab === "course" || tab === "weather") && <Text style={styles.emptyText}>정보 준비 중...</Text>}
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
    imageContainer: { width: width, height: 250, backgroundColor: "#f3f4f6", justifyContent: 'center' },
    mainImage: { width: "100%", height: "80%" },
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