import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import axios from "axios";
import { Sunrise, Sunset } from "lucide-react-native";

const API_KEY = "7435802c8b57480c8b263a61cbecb98c";

// 🔥 모바일 앱에서 에러가 나지 않는 안전한 날짜/시간 포맷 함수
const formatDailyDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const weekday = weekdays[date.getDay()];
  return `${month}.${day} (${weekday})`;
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp * 1000);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export default function MountainWeather({ mountain }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!mountain) return;

    const fetchWeather = async () => {
      setLoading(true);
      setError(null);

      try {
        // 🔥 웹 프록시(/weather-api) 대신 실제 API 전체 주소 명시
        // 산 데이터에 위도경도가 없을 경우 서울을 기본값으로 설정
        const lat = mountain.lat || mountain.latitude || 37.5665;
        const lon = mountain.lon || mountain.longitude || 126.9780;
        
        const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=metric&lang=kr&appid=${API_KEY}`;
        const response = await axios.get(url);
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [mountain]); 

  if (loading) return <ActivityIndicator size="large" color="#3b82f6" style={{ marginVertical: 40 }} />;
  if (error) return <Text style={styles.errorText}>오류: {error}</Text>;
  if (!data) return null;

  const currentDate = new Date(data.current.dt * 1000);
  const currentDateFormatted = `${String(currentDate.getFullYear()).slice(2)}.${String(currentDate.getMonth() + 1).padStart(2, '0')}.${String(currentDate.getDate()).padStart(2, '0')}`;

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>⛰️ {mountain.name} 날씨</Text>
        <Text style={styles.subtitle}>데이터출처: Openweather</Text>
      </View>

      {/* 일별 날씨 가로 스크롤 */}
      <View style={styles.scrollContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {data.daily.map((day, idx) => (
            <View key={idx} style={styles.dayCard}>
              <Text style={styles.dateText}>{formatDailyDate(day.dt)}</Text>
              
              <Image
                source={{ uri: `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png` }}
                style={styles.weatherIcon}
                resizeMode="contain"
              />
              
              <View style={styles.tempRow}>
                <Text style={styles.tempMin}>{Math.round(day.temp.min)}°</Text>
                <Text style={styles.tempDivider}> / </Text>
                <Text style={styles.tempMax}>{Math.round(day.temp.max)}°</Text>
              </View>
              
              <Text style={styles.windText}>풍속 {day.wind_speed.toFixed(1)}m/s</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* 일출 / 일몰 정보 */}
      <View style={styles.sunContainer}>
        <View style={styles.sunItem}>
          <Sunrise color="#f97316" size={28} />
          <View style={styles.sunTextCol}>
            <Text style={styles.sunLabel}>일출</Text>
            <Text style={styles.sunTime}>{formatTime(data.current.sunrise)}</Text>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.sunItem}>
          <Sunset color="#6366f1" size={28} />
          <View style={styles.sunTextCol}>
            <Text style={styles.sunLabel}>일몰</Text>
            <Text style={styles.sunTime}>{formatTime(data.current.sunset)}</Text>
          </View>
        </View>
      </View>
          
      <Text style={styles.footerText}>일출/일몰 기준일: {currentDateFormatted}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { backgroundColor: '#f9fafb', padding: 20, borderRadius: 12, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, gap: 16, marginVertical: 10, marginHorizontal: 2 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    title: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
    subtitle: { fontSize: 11, color: '#6b7280' },

    // 1. 스크롤 뷰가 컨테이너 밖으로 살짝 나가서 스크롤되도록 마진을 깎고 패딩을 줍니다. (그림자 잘림 방지)
    scrollContainer: {
        marginHorizontal: -20,
    },
    // 2. 내부 패딩을 주어 첫 번째 카드와 마지막 카드가 정렬이 맞게 하고, gap 대신 마진을 쓰도록 변경합니다.
    scrollContent: {
        paddingHorizontal: 20,
        paddingVertical: 8, // 위아래 그림자도 잘리지 않게 여유 공간 확보
    },
    // 3. marginRight를 고정값으로 주고, 폭(width)을 115 정도로 살짝 늘려 글씨 잘림을 예방합니다.
    dayCard: {
        width: 115,
        alignItems: 'center',
        padding: 12,
        backgroundColor: 'white',
        borderRadius: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        marginRight: 12
    },

    dateText: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 4 },
    weatherIcon: { width: 50, height: 50, marginVertical: 4 },
    tempRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    tempMin: { fontSize: 15, fontWeight: '700', color: '#2563eb' },
    tempDivider: { fontSize: 14, fontWeight: '500', color: '#9ca3af' },
    tempMax: { fontSize: 15, fontWeight: '700', color: '#dc2626' },
    windText: { fontSize: 11, color: '#4b5563' },
    sunContainer: { padding: 16, backgroundColor: 'white', borderRadius: 12, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
    sunItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    sunTextCol: { flexDirection: 'column' },
    sunLabel: { fontSize: 13, fontWeight: 'bold', color: '#374151' },
    sunTime: { fontSize: 15, fontWeight: '800', color: '#1f2937' },
    divider: { borderLeftWidth: 1, borderLeftColor: '#d1d5db', height: 40 },
    footerText: { fontSize: 12, color: '#6b7280', textAlign: 'right' },
    errorText: { padding: 20, textAlign: 'center', color: '#dc2626', fontWeight: 'bold' }
});