import hanla from "../assets/hanla.jpeg";
import hanla1 from "../assets/hanla1.jpg";
import hanla2 from "../assets/hanla2.jpg";
import seorak from "../assets/seorak.jpg";
import seorak1 from "../assets/seorak1.jpg";
import seorak2 from "../assets/seorak2.jpg";
import bukhan from "../assets/bukhan.jpeg";
import bukhan1 from "../assets/bukhan1.jpg";
import bukhan2 from "../assets/bukhan2.jpg";
import gyeyang from "../assets/gyeyang.jpeg";
import gyeyang1 from "../assets/gyeyang1.jpg";
import gyeyang2 from "../assets/gyeyang2.jpg";
import jiri from "../assets/jiri.jpg";
import jiri1 from "../assets/jiri1.jpg";
import jiri2 from "../assets/jiri2.jpg";
import dobong from "../assets/dobong.jpg";
import dobong1 from "../assets/dobong1.jpg";
import dobong2 from "../assets/dobong2.jpg";
import chunma from "../assets/chunma.jpg";
import chunma1 from "../assets/chunma1.jpg";
import chunma2 from "../assets/chunma2.jpg";
import daedun from "../assets/daedun.jpg";
import daedun1 from "../assets/daedun1.jpg";
import daedun2 from "../assets/daedun2.jpg";
import taebaek from "../assets/taebaek.jpg";
import taebaek1 from "../assets/taebaek1.jpg";
import taebaek2 from "../assets/taebaek2.jpg";
import surak from "../assets/surak.jpg";
import surak1 from "../assets/surak1.jpg";
import surak2 from "../assets/surak2.jpg";
import gwanak from "../assets/gwanak.jpg";
import gwanak1 from "../assets/gwanak1.jpg";
import gwanak2 from "../assets/gwanak2.jpg";

export const guides = [
  {
    name: "한라산",
    image: [hanla, hanla1, hanla2], 
    description:
      "남한에서 가장 높은 산이자 유네스코 세계자연유산입니다. 정상의 백록담과 사계절 내내 변하는 아름다운 자연 경관으로 유명합니다.",
    trails: "성판악 코스 (9.6km, 편도 4시간 30분)\n관음사 코스 (8.7km, 편도 5시간)",
    difficulty: "성판악(중), 관음사(상)",
    height: "1,947m",
    lat: 33.3617, 
    lon: 126.5292, 
    notices: [
      "한라산은 날씨 변동이 매우 심하니, 방한/방수 의류를 꼭 챙기세요.",
      "탐방로 입산 및 하산 시간이 정해져 있으니(계절별 상이) 미리 확인해야 합니다.",
      "성판악, 관음사 코스를 이용한 정상(백록담) 탐방은 사전 예약이 필수입니다.",
      "지정된 탐방로 외에는 출입을 금합니다.",
      "비상 시 119 또는 한라산국립공원사무소(064-713-9950)로 연락하세요."
    ]
  },
  {
    name: "설악산",
    image: [seorak, seorak1, seorak2],
    description:
      "웅장한 기암괴석과 맑은 계곡이 어우러진 대한민국 대표 명산입니다. 유네스코 생물권 보전지역으로, 특히 가을 단풍이 절경입니다.",
    trails:
      "대청봉 코스 (오색 출발, 5km, 편도 4시간)\n울산바위 코스 (3.8km, 왕복 4시간)",
    difficulty: "대청봉(상), 울산바위(중)",
    height: "1,708m",
    lat: 38.1197, 
    lon: 128.4659, 
    notices: [
      "설악산은 지형이 험하고 날씨 변화가 심합니다. 안전사고에 유의하세요.",
      "대청봉 등 고지대는 기온이 낮으니 보온 의류를 준비하세요.",
      "입산 시간이 정해져 있으니 미리 확인하세요.",
      "야생동물(특히 곰) 출몰 지역이 있으니 주의가 필요합니다.",
      "낙석 위험 구간이 있으니, 지정된 탐방로를 이용하세요."
    ]
  },
  {
    name: "북한산",
    image: [bukhan, bukhan1, bukhan2],
    description:
      "서울과 경기도에 걸쳐 있는 국립공원으로, '서울의 폐'라 불립니다. 화강암 봉우리와 북한산성이 어우러져 수많은 등산객이 찾습니다.",
    trails:
      "백운대 코스 (우이동 기점, 3.4km, 편도 1시간 30분)\n북한산성 코스 (산성입구 기점, 3.4km, 편도 1시간 10분)",
    difficulty: "백운대(중상), 북한산성(하)",
    height: "836m (백운대)",
    lat: 37.6581, 
    lon: 126.9895, 
    notices: [
      "암벽 구간이 많으니 미끄러지지 않는 등산화를 착용하세요.",
      "주말 및 공휴일에는 매우 혼잡할 수 있으니, 여유롭게 산행하세요.",
      "지정된 탐방로가 아닌 샛길(비법정 탐방로) 출입을 금합니다.",
      "고양이 등 야생동물에게 먹이를 주지 마세요.",
      "낙석 위험 구간에서는 주의가 필요합니다."
    ]
  },
  {
    name: "계양산",
    image: [gyeyang, gyeyang1, gyeyang2 ],
    description:
      "인천광역시를 대표하는 산으로, 정상에서 인천 시내는 물론, 날씨가 좋으면 서울과 서해 바다까지 조망할 수 있습니다. 잘 정비된 숲길과 둘레길이 특징입니다.",
    trails:
      "연무정 코스 (1.5km, 편도 40분)\n계산역 코스 (1.9km, 편도 50분)",
    difficulty: "하~중",
    height: "395m",
    lat: 37.5556, 
    lon: 126.7372,
    notices: [
      "도심과 가까워 주말에 등산객이 많으니, 안전사고에 유의하세요.",
      "계양산성 등 문화재가 있으니 훼손되지 않도록 주의해주세요.",
      "낮은 산이지만, 등산로가 아닌 샛길로 빠지지 않도록 주의합니다.",
      "산불 조심 기간(봄, 가을)에는 화기 소지를 엄격히 금합니다."
    ]
  },
  {
    name: "지리산",
    image: [jiri, jiri1, jiri2],
    description:
      "대한민국에서 두 번째로 높은 산으로, 남한 내륙 최고봉인 천왕봉을 포함합니다. 능선이 길고 완만해 다양한 장거리 산행 코스로 유명합니다.",
    trails:
      "천왕봉 코스 (중산리, 5.4km, 편도 4시간)\n화엄사 코스 (8.2km, 편도 4시간 30분)",
    difficulty: "천왕봉(상), 화엄사(중상)",
    height: "1,915m",
    lat: 35.3273,
    lon: 127.7302,
    notices: [
      "지리산은 일교차가 큰 편이므로 얇은 보온 의류를 반드시 챙기세요.",
      "장거리 능선 산행은 체력 소모가 크므로 충분한 물과 식량이 필요합니다.",
      "탐방 예약제가 운영되는 구간이 있으니 사전 확인이 필요합니다.",
      "야생동물(반달가슴곰) 보호 구역 출입 금지 구간이 있습니다.",
      "기상 악화 시 능선에 바람이 강하니 주의하세요."
    ]
  },
  {
    name: "도봉산",
    image: [dobong, dobong1, dobong2],
    description:
      "서울과 경기의 명산으로, 기암괴석과 사찰이 어우러진 아름다운 경관을 자랑합니다. 초보자부터 상급자까지 즐길 수 있는 다양한 코스가 있습니다.",
    trails:
      "자운봉 코스 (1.8km, 편도 1시간 30분)\n오봉 코스 (3.2km, 왕복 3시간)",
    difficulty: "자운봉(중상), 오봉(중)",
    height: "740m",
    lat: 37.6881,
    lon: 127.0154,
    notices: [
      "암릉 구간이 많아 미끄럼 주의가 필요합니다.",
      "주말에는 탐방객이 많아 혼잡할 수 있습니다.",
      "비·눈 오는 날에는 암벽 구간 접근을 자제해주세요.",
      "야생동물에게 먹이 주기를 금지합니다.",
      "초보자는 오봉 코스를 추천합니다."
    ]
  },
  {
    name: "천마산",
    image: [chunma, chunma1, chunma2],
    description:
      "경기도 남양주에 위치한 산으로, 비교적 낮지만 조망이 뛰어나며 가벼운 산책부터 등산까지 모두 즐길 수 있습니다.",
    trails:
      "천마산역 코스 (2.1km, 편도 1시간)\n평내호평 코스 (2.4km, 편도 1시간 10분)",
    difficulty: "하~중",
    height: "810m",
    lat: 37.6545,
    lon: 127.2331,
    notices: [
      "등산 초보자도 쉽게 오를 수 있으나, 겨울철에는 낙상에 주의하세요.",
      "능선 풍경이 좋은 만큼 바람이 강한 날에는 체감 온도가 낮습니다.",
      "샛길로 이동 시 길이 미끄러울 수 있으니 지정된 탐방로를 이용하세요.",
      "주차장이 협소하므로 대중교통 이용을 추천합니다."
    ]
  },
  {
    name: "대둔산",
    image: [daedun, daedun1, daedun2],
    description:
      "금강 구름다리와 삼선계단으로 유명한 산으로, 기암괴석과 절경이 특징입니다. 사진 명소가 많은 인기 등산지입니다.",
    trails:
      "대둔산 구름다리 코스 (2.5km, 편도 1시간 30분)\n삼선계단 코스 (2.2km, 편도 1시간 20분)",
    difficulty: "중~상",
    height: "878m",
    lat: 36.3427,
    lon: 127.2345,
    notices: [
      "구름다리와 계단 구간은 고소공포증이 있는 사람에게 다소 어려울 수 있습니다.",
      "바람이 강한 날에는 구름다리 통행 제한이 있을 수 있습니다.",
      "안전 난간을 반드시 잡고 이동해주세요.",
      "사진 촬영 시 주변 등산객과 충돌하지 않도록 주의하세요."
    ]
  },
  {
    name: "태백산",
    image: [taebaek, taebaek1, taebaek2],
    description:
      "겨울 설경과 일출 명소로 유명하며, 천제단이 위치한 신령스러운 산입니다. 비교적 완만한 산세로 가족 단위 등산객이 많이 찾습니다.",
    trails:
      "유일사 코스 (4.4km, 편도 2시간)\n당골 코스 (5.1km, 편도 2시간 30분)",
    difficulty: "중",
    height: "1,567m",
    lat: 37.1005,
    lon: 128.9855,
    notices: [
      "겨울철 기온이 매우 낮으므로 방한 장비 필수입니다.",
      "눈길·빙판길 구간이 많아 아이젠 착용이 필요합니다.",
      "정상 인근은 바람이 강하니 체온 유지에 주의하세요.",
      "천제단은 문화재이므로 훼손하지 않도록 주의합니다."
    ]
  },
  {
    name: "수락산",
    image: [surak, surak1, surak2],
    description:
      "서울과 남양주에서 쉽게 접근할 수 있으며, 암릉과 조망이 뛰어난 산입니다. 가벼운 등산부터 암릉 산행까지 즐길 수 있습니다.",
    trails:
      "도정봉 코스 (2.6km, 편도 1시간 20분)\n수락산역 코스 (3.0km, 편도 1시간 40분)",
    difficulty: "중",
    height: "640m",
    lat: 37.6821,
    lon: 127.0876,
    notices: [
      "암릉 구간이 많아 미끄럼에 주의하세요.",
      "초보자는 수락산역 코스를 추천합니다.",
      "주말·휴일에는 혼잡할 수 있으니 여유롭게 산행하세요.",
      "야간 산행은 제한된 구간이 있으니 공식 안내를 확인하세요."
    ]
  },
  {
    name: "관악산",
    image: [gwanak, gwanak1, gwanak2],
    description:
      "서울 남부의 대표적인 산으로 바위 능선과 뛰어난 조망을 자랑합니다. 가파른 구간이 많아 난이도는 중상 정도입니다.",
    trails:
      "연주대 코스 (3.2km, 편도 2시간)\n서울대 코스 (2.8km, 편도 1시간 40분)",
    difficulty: "중상",
    height: "632m",
    lat: 37.4458,
    lon: 126.9634,
    notices: [
      "바위 능선 구간이 많아 미끄럼 위험이 있습니다.",
      "연주대 부근은 강풍이 잦으니 주의하세요.",
      "초보자에게는 서울대 코스를 추천합니다.",
      "지정 탐방로 외 출입 금지 구간이 있으니 안내 표지를 따라주세요."
    ]
  },
    {
        name: "내장산",
        description:
            "전라북도의 대표 명산으로 단풍 명소로 유명하며, 계곡과 숲길이 아름다운 산입니다. 비교적 완만한 코스도 있지만 일부 구간은 돌계단과 경사가 있어 난이도는 중 정도입니다.",
        trails:
            "내장사~연자봉 코스 (3.5km, 편도 2시간)\n내장사~신선봉 코스 (4.2km, 편도 2시간 30분)",
        difficulty: "중",
        height: "763m",
        lat: 35.4893,
        lon: 126.8875,
        notices: [
            "가을 단풍철에는 탐방객이 많아 혼잡할 수 있습니다.",
            "계곡 주변은 습해 미끄러울 수 있으니 등산화 착용을 권장합니다.",
            "내장사 주변은 문화재 구역이므로 조용히 탐방해주세요.",
            "탐방로 이탈 시 사고 위험이 있으니 지정 코스를 이용하세요."
        ],
    }
];