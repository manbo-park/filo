// 항상 노출되는 기본 조리개 값 (풀스탑 + 초고속 렌즈용 f/0.95)
const FULL_STOP_APERTURES = [
    'f/0.95',
    'f/1.0',
    'f/1.4',
    'f/2',
    'f/2.8',
    'f/4',
    'f/5.6',
    'f/8',
    'f/11',
    'f/16',
    'f/22',
];

// 1/2스탑 단위 조리개 값 (설정에 따라 선택적으로 노출)
const HALF_STOP_APERTURES = [
    'f/1.2',
    'f/1.7',
    'f/2.4',
    'f/3.4',
    'f/4.8',
    'f/6.7',
    'f/9.5',
    'f/13',
    'f/19',
];

const toOption = (v: string) => ({ value: v, label: v });

// 'f/2.8' → 2.8 형태로 변환해 조리개 수치 기준 정렬에 사용한다.
const apertureValue = (v: string) => parseFloat(v.slice(2));

// 1/2스탑 노출 여부에 따라 조리개 옵션 목록을 생성한다.
// 이미 기록된 값(currentValue)이 목록에 없으면 표시·보존을 위해 포함한다.
export function getApertureOptions(includeHalfStops: boolean, currentValue?: string) {
    const values = includeHalfStops
        ? [...FULL_STOP_APERTURES, ...HALF_STOP_APERTURES]
        : [...FULL_STOP_APERTURES];
    if (currentValue && !values.includes(currentValue)) {
        values.push(currentValue);
    }
    values.sort((a, b) => apertureValue(a) - apertureValue(b));
    return values.map(toOption);
}

export const SHUTTER_OPTIONS = [
    '1',
    '1/2',
    '1/4',
    '1/8',
    '1/15',
    '1/30',
    '1/60',
    '1/125',
    '1/250',
    '1/500',
    '1/1000',
    '1/2000',
    '1/4000',
    '1/8000',
].map(toOption);
