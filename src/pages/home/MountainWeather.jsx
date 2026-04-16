    import React, { useEffect, useState } from "react";
import axios from "axios";
    import { Sunrise, Sunset } from "lucide-react-native";
const API_KEY = "7435802c8b57480c8b263a61cbecb98c";

const formatDailyDate = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleDateString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
};

const formatTime = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
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
        const url = `/weather-api/data/3.0/onecall?lat=${mountain.lat}&lon=${mountain.lon}&exclude=minutely,hourly,alerts&units=metric&lang=kr&appid=${API_KEY}`;
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

  if (loading) return <p className="p-4 text-center">날씨 정보를 불러오는 중...</p>;
  if (error) return <p className="p-4 text-center text-red-600">오류: {error}</p>;
  if (!data) return null;

  const currentDateFormatted = new Date(data.current.dt * 1000).toLocaleDateString("ko-KR", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  });

  return (
    <div className="max-w-xl mx-auto bg-gray-50 p-5 rounded-lg shadow-lg space-y-4">
      <div className="flex justify-between items-center pb-2 border-b">
        <h3 className="text-xl font-bold text-gray-800">⛰️ {mountain.name} 날씨</h3>
        <p className="text-xs text-gray-500">데이터출처: Openweather</p>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex flex-row gap-2">
          {data.daily.map((day, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 w-32 flex flex-col items-center p-2 bg-white rounded-lg shadow-sm"
            >
              <div className="text-sm font-semibold text-gray-700 mb-1">
                {formatDailyDate(day.dt)}
              </div>
              
              <div className="my-1">
                <img
                  src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                  alt={day.weather[0].description}
                  title={day.weather[0].description}
                  className="w-12 h-12"
                />
              </div>
              
              <div className="text-base font-medium mb-1">
                <span className="text-blue-600">{Math.round(day.temp.min)}°</span>
                <span className="text-gray-400"> / </span>
                <span className="text-red-600">{Math.round(day.temp.max)}°</span>
              </div>
              
              <div className="text-xs text-gray-600">
                풍속 {day.wind_speed.toFixed(1)}m/s
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 bg-white rounded-lg shadow-md flex justify-around items-center">
        <div className="text-center flex items-center space-x-5">
             <Sunrise />
          <div>
            <span className=" font-bold text-sm text-gray-700">일출</span>
            <div className="font-bold text-sm text-gray-800">{formatTime(data.current.sunrise)}</div>
          </div>
        </div>
        
        <div className="border-l border-gray-300 h-10"></div>
        
        <div className="text-center flex items-center space-x-5">
              <Sunset />
          <div>
            <span className="font-bold text-sm text-gray-700">일몰</span>
            <div className="font-bold text-sm text-gray-800">{formatTime(data.current.sunset)}</div>
          </div>
        </div>
      </div>
          
      <p className="text-sm text-gray-500 text-right">
        일출/일몰 기준일: {currentDateFormatted}
      </p>
    </div>
  );
}