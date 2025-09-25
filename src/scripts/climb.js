// --- Configuration ---
const SUMMIT_LATITUDE = 11.382117991152592;
const SUMMIT_LONGITUDE = 106.17201169600158;
const REGISTRATION_LATITUDE = 11.3636370; // Tọa độ địa điểm đăng ký - CẬP NHẬT THEO ĐỊA CHỈ CỤ THỂ
const REGISTRATION_LONGITUDE = 106.1664847; // Tọa độ địa điểm đăng ký - CẬP NHẬT THEO ĐỊA CHỈ CỤ THỂ
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzafxB0TBS4_gcPIvaqbINNrnJJ_7aaE9Az3m9EqqkH5s2eo_mbzrRiOOw3jXolS5jfng/exec'; // Ensure this is your latest script URL
const CROP_ASPECT_RATIO = 11.89 / 16.73; // Defined aspect ratio

// API URLs
const COMBINED_API_URL = '/.netlify/functions/combined-data';
const SSE_UPDATES_URL = '/.netlify/functions/sse-updates';

// Removed realtime systems entirely

// Default GPS settings (fallback)
let GPS_SETTINGS = {
    registrationRadius: 50,
    certificateRadius: 150,
    requireGpsRegistration: true,
    requireGpsCertificate: true,
    registrationTimeEnabled: false,
    registrationStartTime: '06:00',
    registrationEndTime: '18:00'
};

// --- State Variables ---
let messageTimeout;
let verifiedPhoneNumber = null;
let uploadedPhotos = {}; // Stores { 'Member Name': 'croppedBase64string' }
let cropperInstance = null; // Holds the Cropper.js instance
let currentCropContext = null; // Holds {name, previewId, removeId, fileInput} during cropping
let signatureContext = null; // Holds canvas context for signature
let isDrawing = false; // Signature drawing state
let pendingRegistrationData = null; // Stores form data before commitment
let selectedRepresentativeType = null; // Stores the selected representative type

// --- DOM Elements (sẽ được khởi tạo trong DOMContentLoaded) ---
let registrationForm, registerBtn, registerSpinner, groupSizeInput, memberListInput, safetyCommitCheckbox, safetyCommitError;
let phoneVerificationArea, verifyPhoneNumberInput, verifyPhoneBtn, certSpinner, memberSelectionArea, memberListContainer, generateSelectedBtn, generateSpinner, resetVerificationBtn;
let phoneNotFoundError, phoneVerificationSuccess;
let certificateResult, certificateResultTitle, certificateResultMessage, downloadLinks;
let messageBox, currentYearSpan, mapCanvas;
let cropModal, imageToCrop, cancelCropBtn, confirmCropBtn;
let commitmentModal, closeCommitmentBtn, cancelCommitmentBtn, confirmCommitmentBtn, clearSignatureBtn, signatureCanvas;
let commitmentName, commitmentPhone, commitmentCCCD, commitmentEmail, commitmentAddress, commitmentGroupSize, commitmentDate, commitmentTime, commitmentBirthday;
let downloadGpxBtn;
let representativeModal, startRegistrationBtn, startRegistrationArea, registrationFormContainer, confirmRepresentativeBtn, cancelRepresentativeBtn;

// --- Trekking Route Data (Unchanged) ---
const powerPoleTrailGeoJSON = { /* ... GeoJSON data ... */
    "type": "Feature", "properties": { "name": "Đường cột điện", "highway": "footway", "surface": "wood" }, "geometry": { "type": "LineString", "coordinates": [ [106.1664847, 11.3636370], [106.1662692, 11.3638531], [106.1660653, 11.3641397], [106.1658347, 11.3646262], [106.1656858, 11.3648313], [106.1656147, 11.3649273], [106.1655959, 11.3650180], [106.1655664, 11.3650864], [106.1655718, 11.3651890], [106.1655557, 11.3652626], [106.1655128, 11.3652941], [106.1655182, 11.3653730], [106.1655772, 11.3654467], [106.1656845, 11.3655229], [106.1657301, 11.3656255], [106.1657944, 11.3657175], [106.1658615, 11.3657780], [106.1659151, 11.3658595], [106.1659715, 11.3659647], [106.1659929, 11.3660725], [106.1659634, 11.3661593], [106.1659634, 11.3662671], [106.1659634, 11.3663775], [106.1659205, 11.3664696], [106.1658347, 11.3666615], [106.1658695, 11.3667825], [106.1659151, 11.3668772], [106.1659701, 11.3670507], [106.1659902, 11.3671165], [106.1660090, 11.3672335], [106.1660399, 11.3672861], [106.1660747, 11.3673558], [106.1660935, 11.3674346], [106.1661042, 11.3675780], [106.1661163, 11.3676674], [106.1661592, 11.3677370], [106.1661579, 11.3678370], [106.1661525, 11.3678777], [106.1661941, 11.3679869], [106.1661954, 11.3680855], [106.1661726, 11.3681289], [106.1661418, 11.3681972], [106.1661606, 11.3682879], [106.1661887, 11.3683432], [106.1662021, 11.3684786], [106.1661726, 11.3685312], [106.1661056, 11.3685917], [106.1660586, 11.3686574], [106.1660466, 11.3687231], [106.1660814, 11.3687915], [106.1661230, 11.3689559], [106.1661538, 11.3690058], [106.1661860, 11.3691057], [106.1662196, 11.3692214], [106.1662732, 11.3695580], [106.1663081, 11.3697092], [106.1663108, 11.3697645], [106.1663550, 11.3698407], [106.1663537, 11.3699038], [106.1663376, 11.3699301], [106.1662826, 11.3699538], [106.1662665, 11.3699801], [106.1662786, 11.3700274], [106.1662893, 11.3701339], [106.1662839, 11.3702273], [106.1662330, 11.3702733], [106.1661673, 11.3703285], [106.1661109, 11.3703798], [106.1660801, 11.3704679], [106.1661029, 11.3705034], [106.1661150, 11.3706085], [106.1660747, 11.3706546], [106.1660036, 11.3706940], [106.1659460, 11.3707663], [106.1659540, 11.3708215], [106.1659607, 11.3708597], [106.1659768, 11.3709504], [106.1659648, 11.3710266], [106.1659326, 11.3710635], [106.1658950, 11.3711029], [106.1658816, 11.3711516], [106.1658803, 11.3712055], [106.1658937, 11.3712765], [106.1659648, 11.3713317], [106.1660358, 11.3713856], [106.1661109, 11.3714355], [106.1661914, 11.3715013], [106.1662450, 11.3715512], [106.1662531, 11.3715999], [106.1662692, 11.3716696], [106.1663349, 11.3717222], [106.1663859, 11.3717458], [106.1663993, 11.3717682], [106.1663912, 11.3718458], [106.1663778, 11.3718878], [106.1663872, 11.3720088], [106.1664677, 11.3721468], [106.1664797, 11.3722165], [106.1665106, 11.3722770], [106.1665481, 11.3723007], [106.1666380, 11.3723493], [106.1666822, 11.3724137], [106.1667533, 11.3724913], [106.1668164, 11.3725492], [106.1668579, 11.3726202], [106.1668982, 11.3727451], [106.1669223, 11.3728371], [106.1669451, 11.3730028], [106.1669759, 11.3731014], [106.1670202, 11.3731526], [106.1670819, 11.3732802], [106.1670685, 11.3732933], [106.1670698, 11.3733393], [106.1671248, 11.3734537], [106.1671382, 11.3736062], [106.1671101, 11.3736628], [106.1670497, 11.3737377], [106.1670524, 11.3738311], [106.1670765, 11.3739481], [106.1670832, 11.3740519], [106.1670698, 11.3741558], [106.1671020, 11.3741847], [106.1671449, 11.3742307], [106.1671972, 11.3742768], [106.1672334, 11.3743359], [106.1672455, 11.3744122], [106.1672187, 11.3744753], [106.1672133, 11.3745410], [106.1672737, 11.3745778], [106.1672965, 11.3746396], [106.1672629, 11.3746935], [106.1672388, 11.3747593], [106.1672576, 11.3747803], [106.1673193, 11.3748855], [106.1674038, 11.3749933], [106.1675017, 11.3750472], [106.1675969, 11.3751669], [106.1676760, 11.3752589], [106.1677310, 11.3753049], [106.1677793, 11.3753575], [106.1678115, 11.3754061], [106.1678651, 11.3754811], [106.1679067, 11.3755034], [106.1679764, 11.3755521], [106.1680703, 11.3756428], [106.1680904, 11.3757256], [106.1681360, 11.3757703], [106.1682138, 11.3758624], [106.1682741, 11.3759518], [106.1682996, 11.3760307], [106.1683251, 11.3761385], [106.1683425, 11.3762305], [106.1683492, 11.3762897], [106.1683801, 11.3763436], [106.1684230, 11.3763817], [106.1684659, 11.3764027], [106.1686094, 11.3764856], [106.1686765, 11.3765395], [106.1687408, 11.3766013], [106.1688025, 11.3766736], [106.1688253, 11.3767314], [106.1688428, 11.3768629], [106.1688401, 11.3770088], [106.1688602, 11.3770601], [106.1688924, 11.3771837], [106.1688910, 11.3772560], [106.1688857, 11.3773323], [106.1688937, 11.3774335], [106.1689031, 11.3775807], [106.1689259, 11.3776794], [106.1689407, 11.3777293], [106.1689661, 11.3778161], [106.1689970, 11.3779055], [106.1690345, 11.3779699], [106.1690949, 11.3780725], [106.1691257, 11.3781619], [106.1691847, 11.3782487], [106.1692277, 11.3783025], [106.1692920, 11.3784051], [106.1692934, 11.3784695], [106.1693148, 11.3785537], [106.1693121, 11.3786786], [106.1693242, 11.3787180], [106.1693484, 11.3787732], [106.1693470, 11.3788390], [106.1693417, 11.3788666], [106.1693470, 11.3789823], [106.1693457, 11.3791032], [106.1693497, 11.3792255], [106.1693538, 11.3793057], [106.1693591, 11.3793649], [106.1693524, 11.3794135], [106.1693644, 11.3795068], [106.1693604, 11.3796199], [106.1693510, 11.3796541], [106.1692840, 11.3797409], [106.1692679, 11.3798710], [106.1692384, 11.3799991], [106.1692277, 11.3801642], [106.1692317, 11.3802891], [106.1692518, 11.3803496], [106.1692800, 11.3804443], [106.1692558, 11.3805521], [106.1693001, 11.3806993], [106.1692947, 11.3808347], [106.1692491, 11.3809715], [106.1691834, 11.3810970], [106.1691532, 11.3812423], [106.1692143, 11.3813435], [106.1693477, 11.3814671], [106.1694603, 11.3815263], [106.1695898, 11.3815881], [106.1696689, 11.3817189], [106.1697579, 11.3818330] ] } };

// --- Utility Functions ---
function showMessage(message, type = 'info', duration = 6000) {
    clearTimeout(messageTimeout);
    const iconClass = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-times-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';
    const colorClass = type === 'success' ? 'bg-green-100 border-green-400 text-green-800' : type === 'error' ? 'bg-red-100 border-red-400 text-red-800' : type === 'warning' ? 'bg-yellow-100 border-yellow-400 text-yellow-800' : 'bg-blue-100 border-blue-400 text-blue-800';
    messageBox.innerHTML = `
        <div class="flex items-center">
            <i class="fa-solid ${iconClass} text-xl mr-3"></i>
            <span class="flex-1">${message}</span>
            <button id="closeMessageBtn" class="ml-4 text-lg text-gray-500 hover:text-gray-800 focus:outline-none" aria-label="Đóng">&times;</button>
        </div>
    `;
    messageBox.className = `fixed top-6 left-1/2 transform -translate-x-1/2 z-[300] min-w-[280px] max-w-[90vw] px-4 py-3 rounded-lg shadow-lg border ${colorClass} message-box transition-all duration-300`;
    messageBox.classList.remove('hidden');
    messageBox.classList.add('show');
    messageBox.classList.add(type); // Thêm class type để dễ kiểm tra

    // Nút đóng thủ công
    const closeBtn = document.getElementById('closeMessageBtn');
    if (closeBtn) closeBtn.onclick = hideMessage;

    // Ẩn khi click/touch bất kỳ đâu trên màn hình (trừ messageBox và chỉ với thông báo info)
    function hideOnUserAction(e) {
        if (!messageBox.contains(e.target)) {
            // Chỉ ẩn thông báo info, không ẩn thông báo error
            if (messageBox.classList.contains('info')) {
                hideMessage();
            }
        }
    }
    document.addEventListener('mousedown', hideOnUserAction, { once: true });
    document.addEventListener('touchstart', hideOnUserAction, { once: true });

    // Scroll vào vùng nhìn thấy nếu bị che
    setTimeout(() => {
        messageBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);

    // Chỉ tự động ẩn thông báo info, không tự động ẩn thông báo error
    if (duration > 0 && type !== 'error') {
        messageTimeout = setTimeout(hideMessage, duration);
    }
}
function hideMessage() {
    clearTimeout(messageTimeout);
    messageBox.classList.remove('show');
    setTimeout(() => messageBox.classList.add('hidden'), 300); // Đợi hiệu ứng fade out
}
function deg2rad(deg) { return deg * (Math.PI / 180); }
function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000; const dLat = deg2rad(lat2 - lat1); const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); return R * c;
}
function setLoadingState(button, spinner, isLoading) {
    if (!button || !spinner) return; button.disabled = isLoading; spinner.classList.toggle('hidden', !isLoading);
}

// Hàm format ngày từ yyyy-mm-dd sang dd/mm/yyyy
function formatDateToDDMMYYYY(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Trả về nguyên bản nếu không parse được
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Hàm format ngày từ Date object sang dd/mm/yyyy
function formatDateObjectToDDMMYYYY(date) {
    if (!date || isNaN(date.getTime())) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Hàm validation ngày sinh
function validateBirthday() {
    const birthdayInput = document.getElementById('birthday');
    if (!birthdayInput) return;

    const birthdayValue = birthdayInput.value;
    if (!birthdayValue) return;

    // Kiểm tra format yyyy-mm-dd
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(birthdayValue)) {
        birthdayInput.setCustomValidity('Vui lòng chọn ngày sinh hợp lệ');
        return;
    }

    const birthday = new Date(birthdayValue);
    const today = new Date();
    const age = today.getFullYear() - birthday.getFullYear();
    const monthDiff = today.getMonth() - birthday.getMonth();
    
    // Tính tuổi chính xác
    let actualAge = age;
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
        actualAge--;
    }

                if (actualAge < 15) {
                birthdayInput.setCustomValidity('Bạn phải từ 15 tuổi trở lên để đăng ký leo núi');
            } else if (actualAge > 100) {
                birthdayInput.setCustomValidity('Vui lòng kiểm tra lại ngày sinh');
            } else {
                birthdayInput.setCustomValidity('');
            }
}

// Hàm helper để đảm bảo format ngày sinh đúng
function ensureBirthdayFormat(birthdayValue) {
    if (!birthdayValue) return '';
    
    // Nếu đã đúng format yyyy-mm-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(birthdayValue)) {
        return birthdayValue;
    }
    
    // Nếu là Date object
    if (birthdayValue instanceof Date) {
        const year = birthdayValue.getFullYear();
        const month = String(birthdayValue.getMonth() + 1).padStart(2, '0');
        const day = String(birthdayValue.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    // Nếu là string khác format, thử parse
    try {
        const date = new Date(birthdayValue);
        if (!isNaN(date.getTime())) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
    } catch (e) {
        console.warn('Không thể parse ngày sinh:', birthdayValue);
    }
    
    return birthdayValue; // Trả về nguyên bản nếu không parse được
}

// Validate CMND/CCCD: 9 digits OR 12 digits starting with 0
function isValidNationalId(nationalId) {
    const value = String(nationalId || '').trim();
    return /^(?:\d{9}|0\d{11})$/.test(value);
}

// --- Name Validation (profanity filter removed per request) ---
function normalizeVi(str) {
    return String(str || '')
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase();
}

// --- Date/Time Validation Helpers ---
function parseLocalDateTime(yyyyMmDd, hhMm) {
    if (!yyyyMmDd) return null;
    try {
        const [y, m, d] = yyyyMmDd.split('-').map(Number);
        if (!y || !m || !d) return null;
        let hours = 0, minutes = 0;
        if (hhMm && /^(\d{2}):(\d{2})$/.test(hhMm)) {
            const parts = hhMm.split(':').map(Number);
            hours = parts[0]; minutes = parts[1];
        }
        return new Date(y, m - 1, d, hours, minutes, 0, 0);
    } catch (e) { return null; }
}

function isClimbDateTimeWithinGrace(dateStr, timeStr, graceMinutes = 30) {
    const scheduled = parseLocalDateTime(dateStr, timeStr);
    if (!scheduled) return true; // if cannot parse, don't block here
    const now = new Date();
    const graceMs = Math.max(0, Number(graceMinutes)) * 60 * 1000;
    return scheduled.getTime() >= (now.getTime() - graceMs);
}

const PROFANITY_PATTERNS = [];

function containsProfanity(name) { return false; }

function isCleanName(name) {
    const trimmed = String(name || '').trim();
    if (!trimmed) return false;
    if (trimmed.length < 2 || trimmed.length > 100) return false;
    // profanity filter removed
    return true;
}

// Lưu ý về định dạng ngày:
// - Input type="date" trả về yyyy-mm-dd (đúng cho backend)
// - Hiển thị trong modal cam kết: dd/mm/yyyy (đã format)
// - Backend có hàm formatDateDMY() để chuyển yyyy-mm-dd sang dd/mm/yyyy cho PDF

// --- Helper function to escape HTML (RESTORED and used by GPX) ---
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') {
        try {
            unsafe = String(unsafe);
        } catch (e) {
            console.warn("Cannot convert value to string for escaping:", unsafe);
            return '';
        }
    }
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function createGpxContent(trailName, coordinates, creator = "NuiBaDenWebsite") {
    let gpx = `<gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1" creator="${escapeHtml(creator)}">`;
    gpx += `<metadata><name>${escapeHtml(trailName)}</name></metadata>`;
    gpx += `<trk><name>${escapeHtml(trailName)}</name><trkseg>`;
    coordinates.forEach(coord => {
        gpx += `<trkpt lat="${coord[1]}" lon="${coord[0]}"></trkpt>`; // GeoJSON is [lon, lat], GPX is lat, lon
    });
    gpx += `</trkseg></trk></gpx>`;
    return gpx;
}

// --- Map Initialization ---
function initializeLeafletMap() {
    if (!mapCanvas) { 
        console.error('Map canvas not found');
        return; 
    }
    
    // Kiểm tra từng thư viện một cách chi tiết
    if (typeof L === 'undefined') {
        mapCanvas.innerHTML = '<div class="flex items-center justify-center h-full text-red-600"><i class="fa-solid fa-exclamation-triangle mr-2"></i> Lỗi: Leaflet chưa được tải.</div>';
        console.error('Leaflet library not loaded');
        return;
    }
    
    if (typeof L.Control === 'undefined') {
        mapCanvas.innerHTML = '<div class="flex items-center justify-center h-full text-red-600"><i class="fa-solid fa-exclamation-triangle mr-2"></i> Lỗi: Leaflet Control chưa được tải.</div>';
        console.error('Leaflet Control not available');
        return;
    }
    
    if (typeof L.Control.Locate === 'undefined') {
        // Plugin Locate Control chưa có; tiếp tục khởi tạo bản đồ mà không có nút định vị
        console.warn('Leaflet Locate Control not available; continuing without locate control');
    }
    mapCanvas.innerHTML = '';

    try {
        const mapCenter = [11.3727, 106.1676];
        const map = L.map(mapCanvas).setView(mapCenter, 15); // Use local map variable
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: ''
        }).addTo(map);
        const trailStyle = { "color": "#E67E22", "weight": 4, "opacity": 0.8 };
        const geoJsonLayer = L.geoJSON(powerPoleTrailGeoJSON, {
            style: trailStyle,
            onEachFeature: (feature, layer) => { if (feature.properties?.name) layer.bindPopup(`<b>${escapeHtml(feature.properties.name)}</b><br>Tuyến đường chính thức.`); }
        }).addTo(map);
        map.fitBounds(geoJsonLayer.getBounds().pad(0.1));
        const startPoint = powerPoleTrailGeoJSON.geometry.coordinates[0];
        const endPoint = powerPoleTrailGeoJSON.geometry.coordinates[powerPoleTrailGeoJSON.geometry.coordinates.length - 1];
        const startIcon = L.divIcon({ html: '<i class="fa-solid fa-person-hiking text-green-600 text-2xl"></i>', className: 'bg-transparent border-none', iconSize: [24, 24], iconAnchor: [12, 24], popupAnchor: [0, -24] });
        const endIcon = L.divIcon({ html: '<i class="fa-solid fa-flag-checkered text-red-600 text-2xl"></i>', className: 'bg-transparent border-none', iconSize: [24, 24], iconAnchor: [12, 24], popupAnchor: [0, -24] });
        if (startPoint) L.marker([startPoint[1], startPoint[0]], { icon: startIcon, title: "Điểm bắt đầu" }).addTo(map).bindPopup("<b>Điểm bắt đầu</b><br>Tuyến đường Cột Điện");
        if (endPoint) L.marker([endPoint[1], endPoint[0]], { icon: endIcon, title: "Điểm kết thúc (Gần đỉnh)" }).addTo(map).bindPopup("<b>Điểm kết thúc</b><br>(Gần đỉnh)");
        // User location/heading artifacts (shared across controls)
        let userMarker = null;
        let accuracyCircle = null;

        if (typeof L.Control !== 'undefined' && typeof L.Control.Locate !== 'undefined') {
            // Sử dụng plugin Locate Control với cấu hình tối ưu
            const locateControl = L.control.locate({
                position: 'topright', 
                flyTo: true,
                drawCircle: true,
                drawMarker: true,
                showPopup: true,
                strings: { 
                    title: "Hiển thị vị trí của tôi", 
                    popup: "Bạn đang ở trong bán kính {distance} {unit} từ điểm này", 
                    outsideMapBoundsMsg: "Có vẻ bạn đang ở ngoài phạm vi bản đồ." 
                },
                locateOptions: { 
                    maxZoom: 17, 
                    enableHighAccuracy: true,
                    timeout: 20000,
                    maximumAge: 0
                },
                iconElement: 'i', 
                icon: 'fa-solid fa-location-crosshairs', 
                iconLoading: 'fa-solid fa-spinner fa-spin'
            }).addTo(map);
            
            // Xử lý sự kiện cho plugin Locate Control
            map.on('locate', function(e) {
                showMessage('Đang yêu cầu quyền định vị và điều hướng...', 'info', 0);
            });
            
            map.on('locationfound', function(e) {
                hideMessage();
                showMessage('Đã tìm thấy vị trí của bạn!', 'success', 3000);
            });
            
            map.on('locationerror', function(e) {
                hideMessage();
                let errorMsg = 'Lỗi định vị: ';
                let instructionMsg = '';
                
                switch (e.code) {
                    case e.PERMISSION_DENIED: 
                        errorMsg += 'Quyền truy cập bị từ chối.';
                        instructionMsg = 'Vui lòng cấp quyền định vị và điều hướng trong cài đặt trình duyệt và thử lại.';
                        break;
                    case e.POSITION_UNAVAILABLE: 
                        errorMsg += 'Thông tin vị trí không khả dụng.';
                        instructionMsg = 'Vui lòng kiểm tra GPS và kết nối mạng, sau đó thử lại.';
                        break;
                    case e.TIMEOUT: 
                        errorMsg += 'Yêu cầu vị trí hết thời gian chờ.';
                        instructionMsg = 'Vui lòng đảm bảo GPS được bật và thử lại.';
                        break;
                    default: 
                        errorMsg += `Lỗi không xác định (${e.code}).`;
                        instructionMsg = 'Vui lòng kiểm tra cài đặt định vị và thử lại.';
                        break;
                }
                
                const fullMessage = `${errorMsg} ${instructionMsg}`;
                showMessage(fullMessage, 'error', 15000);
            });
        } else {
            // Fallback: add a simple locate button using native Geolocation
            const FallbackLocate = L.Control.extend({
                options: { position: 'topright' },
                onAdd: function() {
                    const container = L.DomUtil.create('div', 'leaflet-bar');
                    const link = L.DomUtil.create('a', '', container);
                    link.href = '#';
                    link.title = 'Hiển thị vị trí của tôi';
                    link.innerHTML = '<i class="fa-solid fa-location-crosshairs" style="line-height:26px;width:26px;display:inline-block;text-align:center"></i>';
                    L.DomEvent.on(link, 'click', function(e) {
                        L.DomEvent.stopPropagation(e);
                        L.DomEvent.preventDefault(e);
                        
                        // Hiển thị thông báo yêu cầu quyền
                        showMessage('Đang yêu cầu quyền định vị và điều hướng...', 'info', 0);
                        
                        // Yêu cầu vị trí với cấu hình tối ưu
                        map.locate({ 
                            setView: true, 
                            enableHighAccuracy: true, 
                            maxZoom: 17,
                            timeout: 20000,
                            maximumAge: 0
                        });
                    });
                    return container;
                }
            });
            map.addControl(new FallbackLocate());
            
            // Xử lý khi tìm thấy vị trí
            map.on('locationfound', function(e) {
                hideMessage(); // Ẩn thông báo yêu cầu quyền
                showMessage('Đã tìm thấy vị trí của bạn!', 'success', 3000);
                const radius = e.accuracy || 50;
                ensureUserLocation(e.latlng, radius);
            });
            
            // Xử lý lỗi định vị
            map.on('locationerror', function(e) {
                hideMessage(); // Ẩn thông báo yêu cầu quyền
                let errorMsg = 'Lỗi định vị: ';
                let instructionMsg = '';
                
                switch (e.code) {
                    case e.PERMISSION_DENIED: 
                        errorMsg += 'Quyền truy cập bị từ chối.';
                        instructionMsg = 'Vui lòng cấp quyền định vị và điều hướng trong cài đặt trình duyệt và thử lại.';
                        break;
                    case e.POSITION_UNAVAILABLE: 
                        errorMsg += 'Thông tin vị trí không khả dụng.';
                        instructionMsg = 'Vui lòng kiểm tra GPS và kết nối mạng, sau đó thử lại.';
                        break;
                    case e.TIMEOUT: 
                        errorMsg += 'Yêu cầu vị trí hết thời gian chờ.';
                        instructionMsg = 'Vui lòng đảm bảo GPS được bật và thử lại.';
                        break;
                    default: 
                        errorMsg += `Lỗi không xác định (${e.code}).`;
                        instructionMsg = 'Vui lòng kiểm tra cài đặt định vị và thử lại.';
                        break;
                }
                
                const fullMessage = `${errorMsg} ${instructionMsg}`;
                showMessage(fullMessage, 'error', 15000);
            });
        }

        // Ensure/create user marker + accuracy visuals with rotating arrow
        function ensureUserLocation(latlng, radius) {
            const r = radius || 50;
            if (!userMarker) {
                const arrowSvg = `\
<div class="heading-arrow" style="width:36px;height:36px;transform-origin:50% 50%;transition:transform 0.1s ease-out;">\
  <svg viewBox="0 0 24 24" width="36" height="36">\
    <path d="M12 2l4 10-4-2-4 2 4-10z" fill="#2563eb"/>\
    <circle cx="12" cy="12" r="3" fill="#1d4ed8"/>\
  </svg>\
</div>`;
                const icon = L.divIcon({ className: 'heading-marker', html: arrowSvg, iconAnchor: [18, 18] });
                userMarker = L.marker(latlng, { title: 'Vị trí của bạn', icon }).addTo(map);
                
                // Store reference to arrow element for better access
                userMarker._arrowElement = userMarker.getElement().querySelector('.heading-arrow');
            } else {
                userMarker.setLatLng(latlng);
                // Update arrow reference if needed
                if (!userMarker._arrowElement) {
                    const el = userMarker.getElement();
                    if (el) {
                        userMarker._arrowElement = el.querySelector('.heading-arrow');
                    }
                }
            }
            if (!accuracyCircle) {
                accuracyCircle = L.circle(latlng, { radius: r, color: '#2563eb', fillColor: '#60a5fa', fillOpacity: 0.12 }).addTo(map);
            } else {
                accuracyCircle.setLatLng(latlng);
                accuracyCircle.setRadius(r);
            }
        }

        // Live location tracking
        if (navigator.geolocation) {
            try {
                navigator.geolocation.watchPosition(
                    (pos) => {
                        const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                        ensureUserLocation(latlng, pos.coords.accuracy);
                    },
                    (err) => { console.warn('Geolocation watch error:', err.message); },
                    { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
                );
            } catch (e) { /* noop */ }
        }

        // Device orientation (compass) to rotate arrow
        let orientationHandler = null;
        
        function rotateHeading(deg) {
            if (!userMarker) return;
            
            // Try to use stored reference first
            let arrow = userMarker._arrowElement;
            
            // If stored reference is not available, try to find it
            if (!arrow) {
                const el = userMarker.getElement();
                if (el) {
                    arrow = el.querySelector('.heading-arrow');
                    userMarker._arrowElement = arrow; // Store for next time
                }
            }
            
            if (arrow) {
                arrow.style.transform = `rotate(${deg}deg)`;
            }
        }

        function startOrientationTracking() {
            if (orientationHandler) {
                window.removeEventListener('deviceorientation', orientationHandler, true);
            }
            
            orientationHandler = (e) => {
                let headingDeg = null;
                if (typeof e.webkitCompassHeading === 'number') {
                    headingDeg = e.webkitCompassHeading; // iOS
                } else if (typeof e.alpha === 'number') {
                    // alpha: 0 is facing north; invert for compass-like
                    headingDeg = 360 - e.alpha;
                }
                if (headingDeg != null && !isNaN(headingDeg)) rotateHeading(headingDeg);
            };
            window.addEventListener('deviceorientation', orientationHandler, true);
        }

        // Request orientation permission and start tracking
        async function requestOrientationPermission() {
            try {
                if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                    const result = await DeviceOrientationEvent.requestPermission();
                    if (result === 'granted') {
                        startOrientationTracking();
                        console.log('Device orientation permission granted');
                    } else {
                        console.log('Device orientation permission denied');
                    }
                } else if (window.DeviceOrientationEvent) {
                    startOrientationTracking();
                    console.log('Device orientation tracking started');
                }
            } catch (error) {
                console.warn('Failed to request device orientation permission:', error);
            }
        }

        // Start orientation tracking on map interaction or automatically
        map.once('click', requestOrientationPermission);
        
        // Also try to start automatically after a short delay
        setTimeout(requestOrientationPermission, 1000);
        
        // Re-request permission on orientation change (for some devices)
        window.addEventListener('orientationchange', () => {
            setTimeout(requestOrientationPermission, 500);
        });
        
        // Xử lý lỗi định vị đã được di chuyển vào phần fallback locate control
    } catch (error) {
        mapCanvas.innerHTML = '<div class="flex items-center justify-center h-full text-red-600"><i class="fa-solid fa-exclamation-triangle mr-2"></i> Lỗi khởi tạo bản đồ. Vui lòng thử lại.</div>';
    }
}

// --- GPS Settings Management ---

// Load GPS settings from API first, then localStorage if needed (legacy - now using combined API)
async function loadGpsSettings() {
    console.warn('loadGpsSettings is deprecated, use loadAllDataFromAPI instead');
    // Fallback to localStorage
    const storedSettings = localStorage.getItem('gpsSettings');
    if (storedSettings) {
        GPS_SETTINGS = JSON.parse(storedSettings);
        console.log('GPS Settings loaded from localStorage (fallback):', GPS_SETTINGS);
    }
}

// Get current GPS settings
function getGpsSettings() {
    return GPS_SETTINGS;
}

// --- Registration Form Handler ---
async function handleRegistrationSubmit(event) {
    event.preventDefault();
    
    if (safetyCommitError) safetyCommitError.classList.add('hidden');

    // Kiểm tra thời gian đăng ký
    if (!validateRegistrationTime()) {
        return;
    }

    // Kiểm tra số lượng thành viên nhận chứng nhận không vượt quá số lượng đăng ký
    const groupSize = parseInt(groupSizeInput?.value || '0', 10);
    const memberListRaw = memberListInput?.value || '';
    const memberListArr = memberListRaw.split('\n').map(x => x.trim()).filter(x => x);
    if (memberListArr.length > groupSize) {
        showMessage('Số lượng thành viên nhận chứng nhận không được lớn hơn số lượng đăng ký!', 'error');
        return;
    }

    if (!registrationForm.checkValidity()) {
        registrationForm.reportValidity();
        if (safetyCommitCheckbox && !safetyCommitCheckbox.checked && safetyCommitError) {
            safetyCommitError.classList.remove('hidden');
        }
        showMessage('Vui lòng điền đủ thông tin (*) và xác nhận cam kết.', 'error');
        return;
    }
    // Validate climb date/time not before current time
    const climbDateVal = document.getElementById('climbDate')?.value || '';
    const climbTimeVal = document.getElementById('climbTime')?.value || '';
    if (!isClimbDateTimeWithinGrace(climbDateVal, climbTimeVal, 30)) {
        showMessage('Ngày/giờ leo chỉ được sớm hơn tối đa 30 phút so với hiện tại.', 'error');
        return;
    }
    // Validate leader name and each member name (basic length only)
    const leaderNameInput = document.getElementById('leaderName');
    const leaderNameVal = leaderNameInput ? leaderNameInput.value : '';
    if (!leaderNameVal || leaderNameVal.trim().length < 2 || leaderNameVal.trim().length > 100) {
        showMessage('Họ và tên không hợp lệ.', 'error');
        return;
    }
    const memberListRawCheck = memberListInput?.value || '';
    const memberListArrForCheck = memberListRawCheck.split('\n').map(x => x.trim()).filter(x => x);
    for (const name of memberListArrForCheck) {
        if (!name || name.length < 2 || name.length > 100) {
            showMessage('Danh sách thành viên chứa tên không hợp lệ.', 'error');
            return;
        }
    }
    
    
    
    // Kiểm tra xem có yêu cầu GPS cho đăng ký không (chỉ bỏ qua khi được đặt rõ ràng là false)
    if (GPS_SETTINGS && GPS_SETTINGS.requireGpsRegistration === false) {
        // Nếu không yêu cầu GPS, tiếp tục với form data
        const formData = new FormData(registrationForm);
        // Validate national ID
        const nationalId = formData.get('cccd');
        if (!isValidNationalId(nationalId)) {
            showMessage('Số CMND/CCCD phải gồm 9 số hoặc 12 số bắt đầu bằng 0.', 'error');
            return;
        }
        pendingRegistrationData = {
            leaderName: formData.get('leaderName'),
            birthday: ensureBirthdayFormat(formData.get('birthday')),
            phoneNumber: formData.get('phoneNumber'),
            cccd: formData.get('cccd'),
            address: formData.get('address'),
            groupSize: formData.get('groupSize'),
            email: formData.get('email'),
            climbDate: formData.get('climbDate'),
            climbTime: formData.get('climbTime'),
            safetyCommit: safetyCommitCheckbox.checked,
            memberList: formData.get('memberList').trim()
        };
        showCommitmentModal();
        return;
    }
    
    // Kiểm tra vị trí trước khi cho phép đăng ký
    showMessage('Đang yêu cầu quyền định vị và điều hướng...', 'info', 0);

    if (!navigator.geolocation) {
        showMessage('Trình duyệt không hỗ trợ định vị. Vui lòng sử dụng thiết bị khác.', 'error');
        return;
    }

    const LOCATION_TIMEOUT = 5000; // 5 giây
    const ACCEPTABLE_ACCURACY = 200; // mét
    let bestPosition = null;
    let hasProcessedLocation = false;
    let accuracyTimeout = null;

    const watchId = navigator.geolocation.watchPosition(
        (pos) => {
            if (!bestPosition || pos.coords.accuracy < bestPosition.coords.accuracy) {
                bestPosition = pos;
            }
            // Nếu có vị trí đủ tốt, dùng luôn
            if (bestPosition.coords.accuracy < ACCEPTABLE_ACCURACY && !hasProcessedLocation) {
                navigator.geolocation.clearWatch(watchId);
                if (accuracyTimeout) clearTimeout(accuracyTimeout);
                hasProcessedLocation = true;
                handleLocationCheckForRegistration(bestPosition);
            }
        },
        (err) => {
            if (accuracyTimeout) clearTimeout(accuracyTimeout);
            handleLocationErrorForRegistration(err);
        },
        { enableHighAccuracy: false, timeout: LOCATION_TIMEOUT, maximumAge: 60000 }
    );

    // Nếu sau 5 giây chưa có vị trí tốt, dùng vị trí tốt nhất hiện có
    accuracyTimeout = setTimeout(() => {
        if (!hasProcessedLocation && bestPosition) {
            navigator.geolocation.clearWatch(watchId);
            hasProcessedLocation = true;
            showMessage('Đang sử dụng vị trí hiện tại...', 'info', 1500);
            handleLocationCheckForRegistration(bestPosition);
        } else if (!hasProcessedLocation) {
            navigator.geolocation.clearWatch(watchId);
            showMessage('Không thể xác định vị trí chính xác. Vui lòng kiểm tra quyền truy cập vị trí và thử lại.', 'error');
        }
    }, LOCATION_TIMEOUT);
}

// Kiểm tra vị trí cho đăng ký
function handleLocationCheckForRegistration(position) {
    // Kiểm tra position có hợp lệ không
    if (!position || !position.coords) {
        showMessage('Không thể xác định vị trí. Vui lòng thử lại.', 'error');
        return;
    }
    
    const userLat = position.coords.latitude;
    const userLon = position.coords.longitude;
    const accuracy = position.coords.accuracy;

    const distance = getDistanceFromLatLonInMeters(userLat, userLon, REGISTRATION_LATITUDE, REGISTRATION_LONGITUDE);

    if (distance <= GPS_SETTINGS.registrationRadius) {
        showMessage('Vị trí hợp lệ. Đang chuẩn bị cam kết...', 'success', 2000);

        // Lưu lại dữ liệu form để dùng cho bước cam kết
        const formData = new FormData(registrationForm);
        // Validate climb date/time not before current time (redundant check)
        const climbDateVal2 = String(formData.get('climbDate') || '');
        const climbTimeVal2 = String(formData.get('climbTime') || '');
        if (!isClimbDateTimeWithinGrace(climbDateVal2, climbTimeVal2, 30)) {
            showMessage('Ngày/giờ leo chỉ được sớm hơn tối đa 30 phút so với hiện tại.', 'error');
            return;
        }
        // Validate names (leader + members) with basic length only
        const leaderNameVal = String(formData.get('leaderName') || '').trim();
        if (!leaderNameVal || leaderNameVal.length < 2 || leaderNameVal.length > 100) {
            showMessage('Họ và tên không hợp lệ.', 'error');
            return;
        }
        const memberListRawCheck2 = (formData.get('memberList') || '').toString();
        const memberListArrForCheck2 = memberListRawCheck2.split('\n').map(x => x.trim()).filter(x => x);
        for (const name of memberListArrForCheck2) {
            if (!name || name.length < 2 || name.length > 100) {
                showMessage('Danh sách thành viên chứa tên không hợp lệ.', 'error');
                return;
            }
        }
        // Validate national ID
        const nationalId = formData.get('cccd');
        if (!isValidNationalId(nationalId)) {
            showMessage('Số CMND/CCCD phải gồm 9 số hoặc 12 số bắt đầu bằng 0.', 'error');
            return;
        }
        
        // Đảm bảo format ngày sinh đúng (yyyy-mm-dd)
        let birthdayValue = formData.get('birthday');
        if (birthdayValue) {
            // Nếu có flatpickr, lấy giá trị thực từ input
            const birthdayInput = document.getElementById('birthday');
            if (birthdayInput && birthdayInput._flatpickr && birthdayInput._flatpickr.selectedDates[0]) {
                birthdayValue = birthdayInput._flatpickr.selectedDates[0];
            }
            // Sử dụng helper function để đảm bảo format đúng
            birthdayValue = ensureBirthdayFormat(birthdayValue);
        }
        
        pendingRegistrationData = {
            leaderName: formData.get('leaderName'),
            birthday: birthdayValue,
            phoneNumber: formData.get('phoneNumber'),
            cccd: formData.get('cccd'),
            address: formData.get('address'),
            groupSize: formData.get('groupSize'),
            email: formData.get('email'),
            climbDate: formData.get('climbDate'),
            climbTime: formData.get('climbTime'),
            safetyCommit: safetyCommitCheckbox.checked,
            memberList: formData.get('memberList').trim()
        };

        setTimeout(() => showCommitmentModal(), 2000);
    } else {
        showMessage(`Vị trí không hợp lệ (cách ${distance.toFixed(0)}m). Vui lòng di chuyển đến đúng địa điểm đăng ký và thử lại.`, 'error', 10000);
    }
}

// Xử lý lỗi định vị cho đăng ký
function handleLocationErrorForRegistration(error) {
    let errorMsg = 'Lỗi định vị: ';
    let detailedMsg = '';
    
    switch (error.code) {
        case error.PERMISSION_DENIED: 
            errorMsg += 'Quyền truy cập bị từ chối.';
            detailedMsg = 'Vui lòng cấp quyền định vị và điều hướng trong cài đặt trình duyệt và thử lại.';
            break;
        case error.POSITION_UNAVAILABLE: 
            errorMsg += 'Thông tin vị trí không khả dụng.';
            detailedMsg = 'Không thể xác định vị trí. Vui lòng kiểm tra GPS và kết nối mạng, sau đó thử lại.';
            break;
        case error.TIMEOUT: 
            errorMsg += 'Yêu cầu vị trí hết thời gian chờ.';
            detailedMsg = 'Vui lòng đảm bảo GPS được bật và thử lại.';
            break;
        default: 
            errorMsg += `Lỗi không xác định (${error.code}).`;
            detailedMsg = 'Vui lòng kiểm tra cài đặt định vị và thử lại.';
            break;
    }
    
    const fullMessage = detailedMsg ? `${errorMsg} ${detailedMsg}` : errorMsg;
    showMessage(fullMessage, 'error', 12000);
}



// --- Commitment Modal Functions ---

// Hiển thị modal cam kết
function showCommitmentModal() {
    if (!pendingRegistrationData) {
        showMessage('Lỗi: Không có dữ liệu đăng ký.', 'error');
        return;
    }

    // Cập nhật thông tin trong modal
    if (commitmentName) commitmentName.textContent = pendingRegistrationData.leaderName;
    if (commitmentPhone) commitmentPhone.textContent = pendingRegistrationData.phoneNumber;
    if (commitmentCCCD) commitmentCCCD.textContent = pendingRegistrationData.cccd;
    if (commitmentEmail) commitmentEmail.textContent = pendingRegistrationData.email;
    if (commitmentAddress) commitmentAddress.textContent = pendingRegistrationData.address;
    if (commitmentGroupSize) commitmentGroupSize.textContent = pendingRegistrationData.groupSize;
    if (commitmentDate) commitmentDate.textContent = formatDateToDDMMYYYY(pendingRegistrationData.climbDate) || 'Chưa chọn';
    if (commitmentTime) commitmentTime.textContent = pendingRegistrationData.climbTime || 'Chưa chọn';
    if (commitmentBirthday) commitmentBirthday.textContent = formatDateToDDMMYYYY(pendingRegistrationData.birthday) || '';

    // Tự động điền ngày tháng năm hiện tại với định dạng dd/mm/yyyy
    const today = new Date();
    const dayElement = document.getElementById('commitmentDay');
    const monthElement = document.getElementById('commitmentMonth');
    const yearElement = document.getElementById('commitmentYear');
    
    if (dayElement) dayElement.textContent = String(today.getDate()).padStart(2, '0');
    if (monthElement) monthElement.textContent = String(today.getMonth() + 1).padStart(2, '0');
    if (yearElement) yearElement.textContent = today.getFullYear();

    // Hiển thị modal
    if (commitmentModal) {
        commitmentModal.classList.remove('hidden');
        initializeSignatureCanvas();
    } else {
        showMessage('Lỗi: Không thể hiển thị modal cam kết.', 'error');
    }
}

// Khởi tạo canvas chữ ký
function initializeSignatureCanvas() {
    if (!signatureCanvas) return;

    const canvas = signatureCanvas;
    const ctx = canvas.getContext('2d');

    // Lấy kích thước hiển thị thực tế
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;

    // Tăng kích thước pixel thực tế để xuất ảnh nét hơn
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;

    // Scale context để nét hơn trên mọi thiết bị
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    signatureContext = ctx;

    // Thiết lập style cho canvas
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Xóa canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Thêm event listeners cho chữ ký
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch events cho mobile
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', stopDrawing);
}

// Bắt đầu vẽ chữ ký
function startDrawing(e) {
    isDrawing = true;
    draw(e);
}

// Vẽ chữ ký
function draw(e) {
    if (!isDrawing || !signatureContext) return;

    e.preventDefault();
    const canvas = signatureCanvas;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    signatureContext.lineTo(x, y);
    signatureContext.stroke();
    signatureContext.beginPath();
    signatureContext.moveTo(x, y);
}

// Dừng vẽ chữ ký
function stopDrawing() {
    isDrawing = false;
    if (signatureContext) {
        signatureContext.beginPath();
    }
}

// Xử lý touch events
function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    signatureCanvas.dispatchEvent(mouseEvent);
}

function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    signatureCanvas.dispatchEvent(mouseEvent);
}

// Xóa chữ ký
function clearSignature() {
    if (signatureContext && signatureCanvas) {
        signatureContext.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
    }
}

// Kiểm tra chữ ký có hợp lệ không
function isSignatureValid() {
    if (!signatureContext || !signatureCanvas) return false;
    
    const imageData = signatureContext.getImageData(0, 0, signatureCanvas.width, signatureCanvas.height);
    const data = imageData.data;
    
    // Kiểm tra xem có pixel nào được vẽ không
    for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 0) return true; // Có pixel được vẽ
    }
    return false;
}

// Ẩn modal cam kết
function hideCommitmentModal() {
    if (commitmentModal) {
        commitmentModal.classList.add('hidden');
    }
    pendingRegistrationData = null;
    clearSignature();
}

// --- Certification Flow Functions ---

/** Starts the verification process (Location + Phone). */
function handleVerifyPhoneAndLocation() {
    const phoneNumber = verifyPhoneNumberInput.value.trim();
    if (!phoneNumber || !/^[0-9]{10,11}$/.test(phoneNumber)) {
        // REFINED MESSAGE
        showMessage('Vui lòng nhập SĐT đã đăng ký (10-11 số).', 'error');
        verifyPhoneNumberInput.focus();
        return;
    }

    setLoadingState(verifyPhoneBtn, certSpinner, true);
    hideMemberSelectionAndResults();

    // Clear any previous error messages first
    if(phoneNotFoundError) phoneNotFoundError.classList.add('hidden');
    if(phoneVerificationSuccess) phoneVerificationSuccess.classList.add('hidden');

    // Kiểm tra xem có yêu cầu GPS cho chứng chỉ không (chỉ bỏ qua khi được đặt rõ ràng là false)
    if (GPS_SETTINGS && GPS_SETTINGS.requireGpsCertificate === false) {
        // Nếu không yêu cầu GPS, tiếp tục trực tiếp
        showMessage('Đang kiểm tra số điện thoại...', 'info', 0);
        fetchMembersListForSelection(phoneNumber);
        return;
    }

    // REFINED MESSAGE
    showMessage('Đang kiểm tra vị trí và số điện thoại...', 'info', 0);

    if (!navigator.geolocation) {
        // REFINED MESSAGE
        showMessage('Trình duyệt không hỗ trợ định vị.', 'error');
        setLoadingState(verifyPhoneBtn, certSpinner, false);
        return;
    }

    // Yêu cầu cả 2 quyền: định vị và điều hướng
    showMessage('Đang yêu cầu quyền định vị và điều hướng...', 'info', 0);

    navigator.geolocation.getCurrentPosition(
        (position) => handleLocationSuccessForVerification(position, phoneNumber),
        handleLocationErrorForVerification,
        { 
            enableHighAccuracy: true, 
            timeout: 20000, 
            maximumAge: 0,
            // Yêu cầu quyền điều hướng (heading) nếu có
            ...(navigator.geolocation.getCurrentPosition.length > 2 ? {} : {})
        }
    );
}

/** Geolocation success callback during verification. */
function handleLocationSuccessForVerification(position, phoneNumber) {
    const userLat = position.coords.latitude;
    const userLon = position.coords.longitude;
    const accuracy = position.coords.accuracy;
    let isValid = false;

    showMessage(`Vị trí xác định (~${accuracy.toFixed(0)}m). Đang kiểm tra...`, 'info', 0);

    const distance = getDistanceFromLatLonInMeters(userLat, userLon, SUMMIT_LATITUDE, SUMMIT_LONGITUDE);

    // Check distance to set isValid
    if (distance <= GPS_SETTINGS.certificateRadius) {
        isValid = true;
    }

    // Xử lý logic tiếp theo dựa trên isValid
    if (isValid) {
        showMessage(`Vị trí hợp lệ. Đang kiểm tra số điện thoại...`, 'info', 0);
        fetchMembersListForSelection(phoneNumber);
    } else {
        showMessage(`Vị trí không hợp lệ (cách đỉnh ~${distance.toFixed(0)}m). Cần trong phạm vi ${GPS_SETTINGS.certificateRadius}m. Vui lòng di chuyển đến đỉnh núi và thử lại.`, 'error', 12000);
        setLoadingState(verifyPhoneBtn, certSpinner, false);
    }
}

/** Geolocation error handler specific to the verification step. */
function handleLocationErrorForVerification(error) {
    let errorMsg = 'Lỗi định vị: ';
    let instructionMsg = '';
    
    switch (error.code) {
        case error.PERMISSION_DENIED: 
            errorMsg += 'Quyền truy cập bị từ chối.';
            instructionMsg = 'Vui lòng cấp quyền định vị và điều hướng trong cài đặt trình duyệt và thử lại.';
            break;
        case error.POSITION_UNAVAILABLE: 
            errorMsg += 'Thông tin vị trí không khả dụng.';
            instructionMsg = 'Vui lòng kiểm tra GPS và kết nối mạng, sau đó thử lại.';
            break;
        case error.TIMEOUT: 
            errorMsg += 'Yêu cầu vị trí hết thời gian chờ.';
            instructionMsg = 'Vui lòng đảm bảo GPS được bật và thử lại.';
            break;
        default: 
            errorMsg += `Lỗi không xác định (${error.code}).`;
            instructionMsg = 'Vui lòng kiểm tra cài đặt định vị và thử lại.';
            break;
    }
    
    const fullMessage = `${errorMsg} ${instructionMsg}`;
    
    showMessage(fullMessage, 'error', 15000);
    setLoadingState(verifyPhoneBtn, certSpinner, false);
    if (messageBox.classList.contains('info')) hideMessage();
}



/** Fetches the member list from Google Apps Script for selection. */
async function fetchMembersListForSelection(phoneNumber) {
    const fetchUrl = new URL(GOOGLE_SCRIPT_URL);
    fetchUrl.searchParams.append('action', 'getMembersByPhone');
    fetchUrl.searchParams.append('phone', phoneNumber);

    if(memberListContainer) {
        memberListContainer.innerHTML = '';
        memberListContainer.classList.add('loading');
    } else {
        setLoadingState(verifyPhoneBtn, certSpinner, false);
        return;
    }

    try {
        const response = await fetch(fetchUrl.toString(), { method: 'GET' });
        if (!response.ok) {
             let serverErrorMsg = `Lỗi ${response.status}: ${response.statusText}`;
             try { const errResult = await response.json(); serverErrorMsg = errResult.message || serverErrorMsg; } catch(e) {}
             throw new Error(serverErrorMsg);
         }
        const result = await response.json();

        if (result.success && Array.isArray(result.members)) {
            // Check if members list is empty (phone not registered)
            if (result.members.length === 0) {
                // Hide loading message and show error
                hideMessage();
                // Show inline error message for empty list
                if(phoneNotFoundError) phoneNotFoundError.classList.remove('hidden');
                if(phoneVerificationSuccess) phoneVerificationSuccess.classList.add('hidden');
                showMessage(`Số điện thoại ${phoneNumber} chưa được đăng ký trong hệ thống. Vui lòng kiểm tra lại.`, 'error', 0);
                setLoadingState(verifyPhoneBtn, certSpinner, false);
                return;
            }
            
            // If we have members, hide loading message and proceed
            hideMessage();
            
            verifiedPhoneNumber = phoneNumber;
            displayMemberListForSelection(result.members, phoneNumber);
            if(phoneVerificationArea) phoneVerificationArea.classList.add('hidden');
            if(memberSelectionArea) memberSelectionArea.classList.remove('hidden');
            // Hide error messages and show success
            if(phoneNotFoundError) phoneNotFoundError.classList.add('hidden');
            if(phoneVerificationSuccess) phoneVerificationSuccess.classList.remove('hidden');
        } else {
             throw new Error(result.message || 'Không thể lấy danh sách thành viên.');
        }
    } catch (error) {
        // Hide loading message first
        if (messageBox.classList.contains('info')) hideMessage();
        
        // Check if it's a "not found" error
        if (error.message.includes('not found') || error.message.includes('Không tìm thấy')) {
            // Show inline error message
            if(phoneNotFoundError) phoneNotFoundError.classList.remove('hidden');
            if(phoneVerificationSuccess) phoneVerificationSuccess.classList.add('hidden');
            // Also show general message
            showMessage(`Số điện thoại ${phoneNumber} chưa được đăng ký trong hệ thống. Vui lòng kiểm tra lại.`, 'error', 0);
        } else {
            // Hide inline messages for other errors
            if(phoneNotFoundError) phoneNotFoundError.classList.add('hidden');
            if(phoneVerificationSuccess) phoneVerificationSuccess.classList.add('hidden');
            showMessage(`Lỗi tải danh sách: ${error.message}. Vui lòng thử lại.`, 'error', 10000);
        }
        resetVerificationProcess();
    } finally {
        setLoadingState(verifyPhoneBtn, certSpinner, false);
        if(memberListContainer) memberListContainer.classList.remove('loading');
    }
}

/** Dynamically creates and displays the member list for selection. */
function displayMemberListForSelection(members, phoneNumber) {
    if (!memberListContainer) return;
    memberListContainer.innerHTML = '';
    uploadedPhotos = {};

    if (members.length === 0) {
        memberListContainer.innerHTML = `
            <div class="text-center py-6">
                <div class="text-red-500 mb-2">
                    <i class="fas fa-exclamation-triangle text-2xl"></i>
                </div>
                <p class="text-red-600 font-medium mb-2">Số điện thoại chưa đăng ký!</p>
                <p class="text-gray-600 text-sm">Số điện thoại <strong>${phoneNumber}</strong> chưa được đăng ký trong hệ thống.</p>
                <p class="text-gray-500 text-sm mt-2">Vui lòng kiểm tra lại số điện thoại hoặc đăng ký trước khi nhận chứng chỉ.</p>
            </div>
        `;
        if (generateSelectedBtn) generateSelectedBtn.disabled = true;
        return;
    }

    if (generateSelectedBtn) generateSelectedBtn.disabled = false;

    // Thêm checkbox "Chọn tất cả"
    const selectAllId = 'selectAllMembersCheckbox';
    const selectAllDiv = document.createElement('div');
    selectAllDiv.className = 'flex items-center mb-2';
    selectAllDiv.innerHTML = `
        <input type="checkbox" id="${selectAllId}" class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2">
        <label for="${selectAllId}" class="text-sm font-medium text-gray-700 cursor-pointer select-none">Chọn tất cả</label>
    `;
    memberListContainer.appendChild(selectAllDiv);

    // Tạo danh sách thành viên
    const memberCheckboxes = [];
    members.forEach(name => {
        const memberId = `member_${name.replace(/[^a-zA-Z0-9_-]/g, '')}_${Math.random().toString(36).substring(2, 7)}`;
        const escapedName = escapeHtml(name);

        const listItem = document.createElement('div');
        listItem.className = 'member-item flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-100/60 rounded-md gap-3 sm:gap-4';
        listItem.innerHTML = `
            <div class="flex items-center space-x-3 flex-grow min-w-0">
                <input type="checkbox" id="cb_${memberId}" class="member-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0" data-member-name="${escapedName}">
                <label for="cb_${memberId}" class="member-name text-sm font-medium text-gray-700 truncate cursor-pointer" title="${escapedName}">${escapedName}</label>
                <img id="preview_${memberId}" src="" alt="Preview" class="member-preview h-10 w-10 object-cover rounded-full hidden border border-gray-200">
            </div>
            <div class="flex items-center space-x-2 flex-shrink-0 pl-7 sm:pl-0">
                <button type="button" class="upload-photo-btn text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-2 rounded-md transition duration-150 ease-in-out" data-input-id="file_${memberId}">
                    <i class="fa-solid fa-camera mr-1"></i> Tải ảnh
                </button>
                <input type="file" accept="image/*" class="hidden member-photo-input" id="file_${memberId}" data-member-name="${escapedName}" data-preview-id="preview_${memberId}" data-remove-id="remove_${memberId}">
                <button type="button" id="remove_${memberId}" class="remove-photo-btn text-xs text-red-500 hover:text-red-700 hidden" title="Xóa ảnh đã chọn">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;

        const uploadBtn = listItem.querySelector('.upload-photo-btn');
        const fileInput = listItem.querySelector('.member-photo-input');
        const removeBtn = listItem.querySelector('.remove-photo-btn');
        const checkbox = listItem.querySelector('.member-checkbox');
        if (checkbox) memberCheckboxes.push(checkbox);

        uploadBtn?.addEventListener('click', () => fileInput.click());
        fileInput?.addEventListener('change', handlePhotoSelection);
        removeBtn?.addEventListener('click', handleRemovePhoto);

        memberListContainer.appendChild(listItem);
    });

    // Xử lý logic "Chọn tất cả"
    const selectAllCheckbox = document.getElementById(selectAllId);
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            memberCheckboxes.forEach(cb => {
                cb.checked = selectAllCheckbox.checked;
            });
        });
        // Nếu tất cả checkbox con được tick thủ công thì "Chọn tất cả" cũng tick
        memberCheckboxes.forEach(cb => {
            cb.addEventListener('change', function() {
                const allChecked = memberCheckboxes.every(c => c.checked);
                selectAllCheckbox.checked = allChecked;
            });
        });
    }
}

// --- Photo Cropping Functions ---

// Fallback loadCropperJS function if not defined in HTML
if (typeof window.loadCropperJS !== 'function') {
    window.loadCropperJS = function() {
        if (window.Cropper) return Promise.resolve();
        
        return new Promise((resolve, reject) => {
            console.log('Fallback: Loading Cropper.js from CDN...');
            const cropperScript = document.createElement('script');
            cropperScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.js';
            cropperScript.onload = () => {
                console.log('Fallback: Cropper.js script loaded');
                // Wait a bit more to ensure Cropper is available
                setTimeout(() => {
                    if (window.Cropper) {
                        console.log('Fallback: Cropper.js is available');
                        resolve();
                    } else {
                        console.log('Fallback: Cropper.js not available after load');
                        reject(new Error('Cropper.js not available after loading'));
                    }
                }, 100);
            };
            cropperScript.onerror = () => {
                console.log('Fallback: Failed to load Cropper.js');
                reject(new Error('Failed to load Cropper.js from CDN'));
            };
            document.head.appendChild(cropperScript);
        });
    };
}

/** Handles photo selection, validates, and opens the cropper modal. */
async function handlePhotoSelection(event) {
    const fileInput = event.target;
    const memberName = fileInput.dataset.memberName;
    const previewId = fileInput.dataset.previewId;
    const removeId = fileInput.dataset.removeId;
    const file = fileInput.files[0];

    if (!file || !previewId || !removeId || !memberName || !cropModal || !imageToCrop) {
        if (fileInput) fileInput.value = '';
        return;
    }

    // Validation
    if (!file.type.startsWith('image/')) {
        showMessage('Vui lòng chọn tệp ảnh.', 'error');
        fileInput.value = ''; return;
    }
    const maxSizeMB = 8;
    if (file.size > maxSizeMB * 1024 * 1024) {
        showMessage(`Ảnh quá lớn (tối đa ${maxSizeMB}MB).`, 'error');
        fileInput.value = ''; return;
    }

    try {
        // Ensure Cropper.js is loaded before proceeding
        if (typeof window.loadCropperJS !== 'function') {
            throw new Error('loadCropperJS function not available');
        }
        
        console.log('Loading Cropper.js...');
        await window.loadCropperJS();
        console.log('Cropper.js loaded, checking availability...');
        
        // Wait a bit more to ensure Cropper is fully available
        let attempts = 0;
        while (typeof window.Cropper === 'undefined' && attempts < 10) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (typeof window.Cropper === 'undefined') {
            throw new Error('Cropper.js failed to load properly');
        }
        
        console.log('Cropper.js is ready to use');
        
        const reader = new FileReader();
        reader.onload = (e) => {
            imageToCrop.src = e.target.result;
            currentCropContext = { name: memberName, previewId: previewId, removeId: removeId, fileInput: fileInput };
            cropModal.classList.remove('hidden');
            if (cropperInstance) cropperInstance.destroy();
            
            // Double-check that Cropper is available
            if (typeof window.Cropper === 'undefined') {
                showMessage('Lỗi: Thư viện cắt ảnh chưa được tải.', 'error');
                handleCancelCrop();
                return;
            }
            
            cropperInstance = new window.Cropper(imageToCrop, {
                aspectRatio: CROP_ASPECT_RATIO, viewMode: 1, dragMode: 'move', background: false,
                autoCropArea: 0.9, responsive: true, restore: false, checkOrientation: false,
                modal: true, guides: true, center: true, highlight: false, cropBoxMovable: true,
                cropBoxResizable: true, toggleDragModeOnDblclick: false,
            });
        }
        reader.onerror = (e) => {
            showMessage('Lỗi đọc tệp ảnh.', 'error');
            fileInput.value = '';
            handleCancelCrop();
        }
        reader.readAsDataURL(file);
    } catch (error) {
        showMessage('Lỗi tải thư viện cắt ảnh.', 'error');
        fileInput.value = '';
    }
}

/** Handles clicking the "Cancel" button in the crop modal. */
function handleCancelCrop() {
    if (cropperInstance) { cropperInstance.destroy(); cropperInstance = null; }
    if (cropModal) cropModal.classList.add('hidden');
    if (currentCropContext && currentCropContext.fileInput) currentCropContext.fileInput.value = '';
    if (imageToCrop) imageToCrop.src = '';
    currentCropContext = null;
}

/** Handles clicking the "Confirm Crop" button in the crop modal. */
function handleConfirmCrop() {
    if (!cropperInstance || !currentCropContext) {
        showMessage('Lỗi: Không tìm thấy dữ liệu cắt.', 'error');
        handleCancelCrop();
        return;
    }

    try {
        const MAX_PHOTO_WIDTH = 800; // Define a max width for the output photo
        const croppedCanvas = cropperInstance.getCroppedCanvas({
            width: MAX_PHOTO_WIDTH, // Set desired width
            height: MAX_PHOTO_WIDTH / CROP_ASPECT_RATIO, // Calculate height based on aspect ratio
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high',
        });
        if (!croppedCanvas) throw new Error("Không thể tạo ảnh đã cắt.");

        const croppedBase64 = croppedCanvas.toDataURL('image/jpeg', 0.95); // Quality 0.95 for higher quality
        const { name, previewId, removeId } = currentCropContext;
        const previewImg = document.getElementById(previewId);
        const removeBtn = document.getElementById(removeId);

        uploadedPhotos[name] = croppedBase64;

        if (previewImg) { previewImg.src = croppedBase64; previewImg.classList.remove('hidden'); }
        if (removeBtn) removeBtn.classList.remove('hidden');

        handleCancelCrop();

    } catch (error) {
        showMessage(`Lỗi cắt ảnh: ${error.message}`, 'error');
        handleCancelCrop();
    }
}

/** Handles the removal of a selected photo. */
function handleRemovePhoto(event) {
    const removeBtn = event.target.closest('.remove-photo-btn');
    if (!removeBtn) return;
    const memberItem = removeBtn.closest('.member-item');
    if (!memberItem) return;

    const fileInput = memberItem.querySelector('.member-photo-input');
    const previewImg = memberItem.querySelector('.member-preview');
    const memberName = fileInput?.dataset.memberName;

    if (previewImg) { previewImg.classList.add('hidden'); previewImg.src = ''; }
    if (fileInput) fileInput.value = '';
    removeBtn.classList.add('hidden');

    if (memberName && uploadedPhotos[memberName]) {
        delete uploadedPhotos[memberName];
    }
}

// --- Certificate Generation & Display ---

/** Gathers selected members and sends data to generate certificates. */
async function handleGenerateSelectedCertificates() {
    if (!verifiedPhoneNumber) {
        showMessage('Lỗi: SĐT chưa được xác thực.', 'error');
        return;
    }

    const checkedBoxes = memberListContainer.querySelectorAll('.member-checkbox:checked');
    if (checkedBoxes.length === 0) {
        showMessage('Vui lòng chọn thành viên.', 'error');
        return;
    }

    setLoadingState(generateSelectedBtn, generateSpinner, true);
    showMessage(`Đang tạo ${checkedBoxes.length} chứng nhận...`, 'info', 0);

    const selectedMembersData = [];
    checkedBoxes.forEach(checkbox => {
        const memberName = checkbox.dataset.memberName;
        if (memberName) {
            selectedMembersData.push({
                name: memberName,
                photoData: uploadedPhotos[memberName] || null
            });
        }
    });

    const postData = { 
        action: 'generateCertificatesWithPhotos', 
        phone: verifiedPhoneNumber, 
        members: selectedMembersData,
        verificationMethod: 'gps'
    };

    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST', redirect: "follow",
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(postData)
        });
        const result = await response.json();

        if (result.success) {
            hideMessage();
            let resultMessage = `Hoàn tất! Đã tạo ${result.pdfLinks?.length || 0} chứng nhận.`;
             if (result.message && result.message.toLowerCase().includes('lỗi')) resultMessage = result.message;
            showMessage(resultMessage, (result.pdfLinks?.length > 0) ? 'success' : 'info', 15000);

            if(result.pdfLinks && result.pdfLinks.length > 0) {
                displayDownloadLinks(result.pdfLinks);
            } else {
                 displayDownloadLinks([]);
                 if(certificateResultMessage) certificateResultMessage.textContent = result.message || 'Không có chứng nhận nào được tạo thành công.';
            }

            // Ẩn khu vực chọn thành viên sau khi tạo thành công để tránh tạo nhiều lần
            if (memberSelectionArea) memberSelectionArea.classList.add('hidden');
            // Đảm bảo khu vực kết quả hiển thị rõ ràng
            if (certificateResult) {
                certificateResult.classList.remove('hidden');
                try { certificateResult.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch(e) {}
            }
        } else {
             throw new Error(result.message || `Không thể tạo chứng nhận.`);
        }
    } catch (error) {
        showMessage(`Lỗi tạo chứng nhận: ${error.message}. Vui lòng thử lại.`, 'error', 10000);
    } finally {
        setLoadingState(generateSelectedBtn, generateSpinner, false);
        if (messageBox.classList.contains('info')) hideMessage();
    }
}

/** Displays the final download links. */
function displayDownloadLinks(pdfLinks) {
    if (!certificateResult || !certificateResultTitle || !certificateResultMessage || !downloadLinks) {
        return;
    }
    downloadLinks.innerHTML = '';

    if (!Array.isArray(pdfLinks) || pdfLinks.length === 0) {
        certificateResultTitle.textContent = 'Thông báo';
        certificateResultMessage.textContent = certificateResultMessage.textContent || 'Không có chứng nhận nào được tạo hoặc có lỗi.';
    } else {
        certificateResultTitle.textContent = 'Chúc mừng! Chứng nhận đã sẵn sàng';
        certificateResultMessage.textContent = 'Tải chứng nhận của các thành viên đã tạo:';
        pdfLinks.forEach(linkInfo => {
            if (!linkInfo || typeof linkInfo !== 'object' || !linkInfo.name || !linkInfo.url) { return; }
            const li = document.createElement('li');
            const safeName = escapeHtml(linkInfo.name);
            const safeUrl = escapeHtml(linkInfo.url);
            const filenameSafeName = safeName.replace(/[^a-zA-Z0-9\s_-]/g, '').replace(/\s+/g, '_');
            li.innerHTML = `
                <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" download="ChungNhan_NuiBaDen_${filenameSafeName}.pdf"
                   class="flex items-center text-blue-600 hover:text-blue-800 hover:underline font-medium py-1 group text-sm md:text-base">
                    <i class="fa-solid fa-cloud-arrow-down text-lg mr-3 text-blue-500 group-hover:text-blue-700 transition-colors"></i>
                    <span>Tải chứng nhận: ${safeName}</span>
                </a>`;
            downloadLinks.appendChild(li);
        });
    }
    certificateResult.classList.remove('hidden');
}

/** Hides the member selection and results areas. */
function hideMemberSelectionAndResults() {
    if(memberSelectionArea) memberSelectionArea.classList.add('hidden');
    if(certificateResult) certificateResult.classList.add('hidden');
    if(downloadLinks) downloadLinks.innerHTML = '';
}

/** Resets the verification process. */
function resetVerificationProcess() {
    hideMemberSelectionAndResults();
    if(phoneVerificationArea) phoneVerificationArea.classList.remove('hidden');
    if(memberListContainer) memberListContainer.innerHTML = '';
    if(verifyPhoneNumberInput) verifyPhoneNumberInput.value = '';
    verifiedPhoneNumber = null;
    uploadedPhotos = {};
    
    // Hide all inline messages
    if(phoneNotFoundError) phoneNotFoundError.classList.add('hidden');
    if(phoneVerificationSuccess) phoneVerificationSuccess.classList.add('hidden');
    
    setLoadingState(verifyPhoneBtn, certSpinner, false);
    setLoadingState(generateSelectedBtn, generateSpinner, false);
    
    // Chỉ ẩn thông báo info, không ẩn thông báo error
    if (messageBox && messageBox.classList.contains('info')) {
        hideMessage();
    }

    handleCancelCrop(); // Ensure cropper is reset
}

/** Handles GPX Download Button Click */
function handleDownloadGpx() {
    if (!powerPoleTrailGeoJSON || !powerPoleTrailGeoJSON.geometry || !powerPoleTrailGeoJSON.geometry.coordinates) {
        showMessage('Lỗi: Dữ liệu tuyến đường không khả dụng để tạo GPX.', 'error');
        return;
    }
    try {
        const trailName = powerPoleTrailGeoJSON.properties?.name || "Duong Leo Nui Ba Den";
        const gpxData = createGpxContent(trailName, powerPoleTrailGeoJSON.geometry.coordinates);
        
        const blob = new Blob([gpxData], { type: 'application/gpx+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tuyen_cot_dien.gpx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showMessage('Đã bắt đầu tải xuống tệp GPX.', 'success', 4000);
    } catch (error) {
        showMessage('Lỗi khi tạo tệp GPX. Vui lòng thử lại.', 'error');
    }
}



// Xử lý xác nhận cam kết
async function handleConfirmCommitment() {
    if (!isSignatureValid()) {
        showMessage('Vui lòng ký tay để xác nhận cam kết.', 'error');
        return;
    }

    if (!pendingRegistrationData) {
        showMessage('Lỗi: Không có dữ liệu đăng ký.', 'error');
        return;
    }

    // Disable nút xác nhận cam kết ngay khi bắt đầu gửi + hiệu ứng loading
    if (confirmCommitmentBtn) {
        confirmCommitmentBtn.disabled = true;
        confirmCommitmentBtn.classList.add('opacity-60', 'cursor-not-allowed');
        let spinner = confirmCommitmentBtn.querySelector('.spinner');
        if (!spinner) {
            spinner = document.createElement('div');
            spinner.className = 'spinner ml-2 border-2 border-white border-t-transparent rounded-full w-4 h-4 inline-block align-middle animate-spin';
            confirmCommitmentBtn.appendChild(spinner);
        } else {
            spinner.classList.remove('hidden');
        }
    }

    // Thông báo chờ
    showMessage('Vui lòng chờ, đang tạo bản cam kết...', 'info', 0);
    setLoadingState(confirmCommitmentBtn, null, true);

    try {
        // Lấy chữ ký dưới dạng base64
        const signatureData = signatureCanvas.toDataURL('image/png');

        const data = {
            action: 'register',
            ...pendingRegistrationData,
            signatureData: signatureData,
            locationMethod: 'gps'
        };

        showMessage('Đang gửi thông tin đăng ký...', 'info', 0);
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            redirect: "follow",
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (result.success) {
            hideMessage(); // Ẩn thông báo đợi trước khi hiển thị thành công
            showMessage('Đăng ký thành công! Vui lòng kiểm tra email.', 'success', 10000);
            registrationForm.reset();
            if (safetyCommitError) safetyCommitError.classList.add('hidden');
            
            // Update user climb statistics
            try {
                const token = localStorage.getItem('authToken');
                if (token) {
                    // User is logged in, update by token
                    const authResponse = await fetch('/.netlify/functions/auth', {
                        method: 'POST',
                        headers: {
                            'Authorization': 'Bearer ' + token,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ action: 'updateClimbStats' })
                    });
                    
                    if (authResponse.ok) {
                        const authResult = await authResponse.json();
                        if (authResult.success) {
                            console.log('Climb statistics updated by token:', authResult);
                        }
                    }
                } else {
                    // User is not logged in, try to update by phone number
                    const phoneNumber = pendingRegistrationData?.phoneNumber;
                    if (phoneNumber) {
                        const authResponse = await fetch('/.netlify/functions/auth', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ 
                                action: 'updateClimbStatsByPhone',
                                phoneNumber: phoneNumber
                            })
                        });
                        
                        if (authResponse.ok) {
                            const authResult = await authResponse.json();
                            if (authResult.success) {
                                console.log('Climb statistics updated by phone:', authResult);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to update climb statistics:', error);
                // Don't show error to user as registration was successful
            }
            
            // Đóng modal
            hideCommitmentModal();
        } else {
            throw new Error(result.message || 'Đăng ký thất bại từ máy chủ.');
        }
    } catch (error) {
        hideMessage(); // Ẩn thông báo đợi trước khi hiển thị lỗi
        showMessage(`Lỗi đăng ký: ${error.message}. Vui lòng thử lại.`, 'error', 15000);
    } finally {
        setLoadingState(confirmCommitmentBtn, null, false);
        if (confirmCommitmentBtn) {
            confirmCommitmentBtn.disabled = false;
            confirmCommitmentBtn.classList.remove('opacity-60', 'cursor-not-allowed');
            let spinner = confirmCommitmentBtn.querySelector('.spinner');
            if (spinner) spinner.classList.add('hidden');
        }
    }
}

// --- Auto-fill User Information ---
async function autoFillUserInformation() {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) return; // User not logged in
        
        // Verify token and get user info
        const response = await fetch('/.netlify/functions/auth', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action: 'me' })
        });
        
        const result = await response.json();
        if (!response.ok || !result.success) {
            console.log('User not authenticated or token expired');
            return;
        }
        
        const user = result.user;
        if (!user) return;
        
        // Auto-fill form fields with user information
        const leaderNameInput = document.getElementById('leaderName');
        const phoneInput = document.getElementById('phoneNumber');
        const birthdayInput = document.getElementById('birthday');
        const cccdInput = document.getElementById('cccd');
        const addressInput = document.getElementById('address');
        const emailInput = document.getElementById('email');
        
        if (leaderNameInput && user.name) {
            leaderNameInput.value = user.name;
        }
        
        if (phoneInput && user.phone) {
            phoneInput.value = user.phone;
        }
        
        if (birthdayInput && user.dob) {
            birthdayInput.value = user.dob;
        }
        
        if (cccdInput && user.idCard) {
            cccdInput.value = user.idCard;
        }
        
        if (addressInput && user.address) {
            addressInput.value = user.address;
        }
        
        if (emailInput && user.email) {
            emailInput.value = user.email;
        }
        
        console.log('User information auto-filled successfully');
        
    } catch (error) {
        console.error('Error auto-filling user information:', error);
    }
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
    // Khởi tạo tất cả DOM elements
    initializeDOMElements();
    
    // Thiết lập event listeners
    setupEventListeners();
    
    // Tự động điền ngày và giờ hiện tại
    setupDefaultDateTime();
    
    // Auto-fill user information if logged in
    await autoFillUserInformation();
    
    // Load all data from combined API
    await loadAllDataFromAPI();
    
    // Realtime notification system removed

    // SSE realtime removed
    
    // Khởi tạo bản đồ với delay nhỏ để đảm bảo Leaflet đã load
    setTimeout(() => {
        initializeLeafletMap();
    }, 100);
    
    // Expose functions globally for HTML onclick handlers
    window.selectRepresentativeType = selectRepresentativeType;
    window.handleConfirmRepresentative = handleConfirmRepresentative;

            // Khởi tạo flatpickr cho ngày sinh (nếu có)
        const birthdayInput = document.getElementById('birthday');
        if (birthdayInput && typeof flatpickr !== 'undefined') {
            flatpickr(birthdayInput, {
                dateFormat: "Y-m-d",
                maxDate: "2009-12-31", // Giới hạn 15 tuổi trở lên
                locale: "vn",
                altInput: true,
                altFormat: "d/m/Y",
                yearRange: [1900, 2009],
                defaultDate: null,
                onChange: function(selectedDates, dateStr, instance) {
                    // Đảm bảo format đúng cho backend
                    birthdayInput.value = dateStr;
                }
            });
        } else if (birthdayInput) {
        // Fallback cho mobile: thêm validation và format
        birthdayInput.addEventListener('input', function() {
            // Đảm bảo format yyyy-mm-dd
            let value = this.value;
            if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                // Nếu người dùng nhập dd/mm/yyyy, chuyển thành yyyy-mm-dd
                const parts = value.split('/');
                if (parts.length === 3) {
                    const day = parts[0].padStart(2, '0');
                    const month = parts[1].padStart(2, '0');
                    const year = parts[2];
                    if (year.length === 4) {
                        this.value = `${year}-${month}-${day}`;
                    }
                }
            }
        });
    }
});

// Hàm khởi tạo tất cả DOM elements
function initializeDOMElements() {
    // Registration Form
    registrationForm = document.getElementById('registrationForm');
    registerBtn = document.getElementById('registerBtn');
    registerSpinner = document.getElementById('registerSpinner');
    groupSizeInput = document.getElementById('groupSize');
    memberListInput = document.getElementById('memberList');
    safetyCommitCheckbox = document.getElementById('safetyCommit');
    safetyCommitError = document.getElementById('safetyCommitError');

    // Certification Flow
    phoneVerificationArea = document.getElementById('phoneVerificationArea');
    verifyPhoneNumberInput = document.getElementById('verifyPhoneNumber');
    verifyPhoneBtn = document.getElementById('verifyPhoneBtn');
    certSpinner = document.getElementById('certSpinner');
    phoneNotFoundError = document.getElementById('phoneNotFoundError');
    phoneVerificationSuccess = document.getElementById('phoneVerificationSuccess');
    memberSelectionArea = document.getElementById('memberSelectionArea');
    memberListContainer = document.getElementById('memberListContainer');
    generateSelectedBtn = document.getElementById('generateSelectedBtn');
    generateSpinner = document.getElementById('generateSpinner');
    resetVerificationBtn = document.getElementById('resetVerificationBtn');

    // Results Area
    certificateResult = document.getElementById('certificateResult');
    certificateResultTitle = document.getElementById('certificateResultTitle')?.querySelector('span');
    certificateResultMessage = document.getElementById('certificateResultMessage');
    downloadLinks = document.getElementById('downloadLinks');

    // General Elements
    messageBox = document.getElementById('messageBox');
    currentYearSpan = document.getElementById('currentYear');
    mapCanvas = document.getElementById('mapCanvas');

    // Cropper Modal Elements
    cropModal = document.getElementById('cropModal');
    imageToCrop = document.getElementById('imageToCrop');
    cancelCropBtn = document.getElementById('cancelCropBtn');
    confirmCropBtn = document.getElementById('confirmCropBtn');

    // Commitment Modal Elements
    commitmentModal = document.getElementById('commitmentModal');
    closeCommitmentBtn = document.getElementById('closeCommitmentBtn');
    cancelCommitmentBtn = document.getElementById('cancelCommitmentBtn');
    confirmCommitmentBtn = document.getElementById('confirmCommitmentBtn');
    clearSignatureBtn = document.getElementById('clearSignatureBtn');
    signatureCanvas = document.getElementById('signatureCanvas');

    // Commitment Display Elements
    commitmentName = document.getElementById('commitmentName');
    commitmentPhone = document.getElementById('commitmentPhone');
    commitmentCCCD = document.getElementById('commitmentCCCD');
    commitmentEmail = document.getElementById('commitmentEmail');
    commitmentAddress = document.getElementById('commitmentAddress');
    commitmentGroupSize = document.getElementById('commitmentGroupSize');
    commitmentDate = document.getElementById('commitmentDate');
    commitmentTime = document.getElementById('commitmentTime');
    commitmentBirthday = document.getElementById('commitmentBirthday');

    // Other Elements
    downloadGpxBtn = document.getElementById('downloadGpxBtn');

    // Representative Modal Elements
    representativeModal = document.getElementById('representativeModal');
    startRegistrationBtn = document.getElementById('startRegistrationBtn');
    startRegistrationArea = document.getElementById('startRegistrationArea');
    registrationFormContainer = document.getElementById('registrationFormContainer');
    cancelRepresentativeBtn = document.getElementById('cancelRepresentativeBtn');
    confirmRepresentativeBtn = document.getElementById('confirmRepresentativeBtn');

    // Cập nhật năm hiện tại
    if (currentYearSpan) currentYearSpan.textContent = new Date().getFullYear();

    // Đảm bảo modal cam kết được ẩn khi khởi tạo
    if (commitmentModal) {
        commitmentModal.classList.add('hidden');
    }
}

// --- Representative Modal Functions ---
function showRepresentativeModal() {
    // Block when registration time is closed
    if (!isWithinRegistrationTime()) {
        const status = getRegistrationTimeStatus();
        showMessage(status ? `Không thể đăng ký lúc này. ${status}` : 'Không thể đăng ký lúc này.', 'error');
        // Ensure form stays hidden
        if (registrationFormContainer) registrationFormContainer.classList.add('hidden');
        if (startRegistrationArea) startRegistrationArea.classList.remove('hidden');
        return;
    }
    if (representativeModal) {
        representativeModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function hideRepresentativeModal() {
    if (representativeModal) {
        representativeModal.classList.add('hidden');
        document.body.style.overflow = '';
        // Reset selection
        selectedRepresentativeType = null;
        const radioButtons = document.querySelectorAll('input[name="representativeType"]');
        radioButtons.forEach(radio => radio.checked = false);
        if (confirmRepresentativeBtn) {
            confirmRepresentativeBtn.disabled = true;
            confirmRepresentativeBtn.classList.add('disabled:opacity-50', 'disabled:cursor-not-allowed');
        }
    }
}



function selectRepresentativeType(type) {
    selectedRepresentativeType = type;
    
    // Update radio button
    const radioButton = document.getElementById(type + 'Type');
    if (radioButton) {
        radioButton.checked = true;
    }
    
    // Auto-fill group size for individual climber
    if (type === 'individual' && groupSizeInput) {
        groupSizeInput.value = '1';
        // Trigger change event to update any dependent logic
        groupSizeInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    // Enable/disable confirm button based on selection
    if (confirmRepresentativeBtn) {
        if (type === 'member') {
            confirmRepresentativeBtn.disabled = true;
            confirmRepresentativeBtn.classList.add('disabled:opacity-50', 'disabled:cursor-not-allowed');
        } else {
            confirmRepresentativeBtn.disabled = false;
            confirmRepresentativeBtn.classList.remove('disabled:opacity-50', 'disabled:cursor-not-allowed');
        }
    }
}

function handleConfirmRepresentative() {
    // Block when registration time is closed
    if (!isWithinRegistrationTime()) {
        const status = getRegistrationTimeStatus();
        showMessage(status ? `Không thể đăng ký lúc này. ${status}` : 'Không thể đăng ký lúc này.', 'error');
        hideRepresentativeModal();
        if (registrationFormContainer) registrationFormContainer.classList.add('hidden');
        if (startRegistrationArea) startRegistrationArea.classList.remove('hidden');
        return;
    }
    if (!selectedRepresentativeType) {
        showMessage('Vui lòng chọn vai trò của bạn.', 'error');
        return;
    }
    
    if (selectedRepresentativeType === 'member') {
        showMessage('Vui lòng liên hệ trưởng đoàn để đăng ký thay vì tự đăng ký.', 'warning');
        return;
    }
    
    // Hide modal and show registration form
    hideRepresentativeModal();
    
    // Show registration form
    if (startRegistrationArea) {
        startRegistrationArea.classList.add('hidden');
    }
    if (registrationFormContainer) {
        registrationFormContainer.classList.remove('hidden');
    }
    
    // Show success message
    showMessage(`Đã xác nhận vai trò: ${selectedRepresentativeType === 'leader' ? 'Trưởng đoàn/Đại diện nhóm' : 'Cá nhân leo núi'}. Vui lòng điền thông tin đăng ký.`, 'success');
}

// Hàm thiết lập event listeners
function setupEventListeners() {
    // Representative Modal Event Listeners
    if (startRegistrationBtn) startRegistrationBtn.addEventListener('click', showRepresentativeModal);
    if (cancelRepresentativeBtn) cancelRepresentativeBtn.addEventListener('click', hideRepresentativeModal);
    if (confirmRepresentativeBtn) confirmRepresentativeBtn.addEventListener('click', handleConfirmRepresentative);
    
    // Registration Form Event Listeners
    if (registrationForm) registrationForm.addEventListener('submit', handleRegistrationSubmit);
    
    if (verifyPhoneBtn) verifyPhoneBtn.addEventListener('click', handleVerifyPhoneAndLocation);
    
    // Clear error messages when user types in phone input
    if (verifyPhoneNumberInput) {
        verifyPhoneNumberInput.addEventListener('input', function() {
            if(phoneNotFoundError) phoneNotFoundError.classList.add('hidden');
            if(phoneVerificationSuccess) phoneVerificationSuccess.classList.add('hidden');
        });
    }
    if (generateSelectedBtn) generateSelectedBtn.addEventListener('click', handleGenerateSelectedCertificates);
    if (resetVerificationBtn) resetVerificationBtn.addEventListener('click', resetVerificationProcess);
    if (downloadGpxBtn) downloadGpxBtn.addEventListener('click', handleDownloadGpx);

    // Cropper Modal Button Listeners
    if (cancelCropBtn) cancelCropBtn.addEventListener('click', handleCancelCrop);
    if (confirmCropBtn) confirmCropBtn.addEventListener('click', handleConfirmCrop);

    // Commitment Modal Button Listeners
    if (closeCommitmentBtn) closeCommitmentBtn.addEventListener('click', hideCommitmentModal);
    if (cancelCommitmentBtn) cancelCommitmentBtn.addEventListener('click', hideCommitmentModal);
    if (clearSignatureBtn) clearSignatureBtn.addEventListener('click', clearSignature);
    if (confirmCommitmentBtn) confirmCommitmentBtn.addEventListener('click', handleConfirmCommitment);

    if (safetyCommitCheckbox && safetyCommitError) {
        safetyCommitCheckbox.addEventListener('change', () => {
            safetyCommitError.classList.toggle('hidden', safetyCommitCheckbox.checked);
        });
    }

    // Validation cho ngày sinh
    const birthdayInput = document.getElementById('birthday');
    if (birthdayInput) {
        birthdayInput.addEventListener('change', validateBirthday);
        birthdayInput.addEventListener('blur', validateBirthday);
    }



    // Enforce CMND/CCCD only digits and max length 12 while typing
    const cccdInput = document.getElementById('cccd');
    if (cccdInput) {
        // Set maxlength attribute for text inputs; if type=number, we'll still hard-truncate below
        try { cccdInput.setAttribute('maxlength', '12'); } catch (e) {}
        cccdInput.setAttribute('inputmode', 'numeric');
        cccdInput.addEventListener('input', function() {
            const digitsOnly = this.value.replace(/\D/g, '');
            // Allow up to 12 digits max
            const truncated = digitsOnly.slice(0, 12);
            if (this.value !== truncated) this.value = truncated;
        });
        cccdInput.addEventListener('paste', function(e) {
            e.preventDefault();
            const pasted = (e.clipboardData || window.clipboardData).getData('text');
            const digitsOnly = String(pasted || '').replace(/\D/g, '').slice(0, 12);
            document.execCommand('insertText', false, digitsOnly);
        });
    }

    // Close representative modal when clicking outside
    if (representativeModal) {
        representativeModal.addEventListener('click', function(e) {
            if (e.target === representativeModal) {
                hideRepresentativeModal();
            }
        });
    }
}

// Hàm thiết lập ngày giờ mặc định
function setupDefaultDateTime() {
    const climbDateInput = document.getElementById('climbDate');
    const climbTimeInput = document.getElementById('climbTime');
    const now = new Date();
    
    if (climbDateInput) {
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        climbDateInput.value = `${yyyy}-${mm}-${dd}`;
    }
    
    if (climbTimeInput) {
        const hh = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        climbTimeInput.value = `${hh}:${min}`;
    }
}

// --- Admin Notification System ---
let adminNotifications = [];
let notificationCheckInterval = null;

// Configuration for notification system
const NOTIFICATION_CONFIG = {
    DISPLAY_DURATION: 10000, // Show notifications for 10 seconds
    FADE_DURATION: 500, // Fade animation duration
    MAX_NOTIFICATIONS: 3 // Maximum number of notifications to show at once
};

// Notification types and their styling
const NOTIFICATION_TYPES = {
    weather: { 
        name: 'Cảnh báo thời tiết', 
        icon: 'fa-cloud-rain', 
        bgColor: 'bg-blue-100', 
        borderColor: 'border-blue-500', 
        textColor: 'text-blue-900',
        iconColor: 'text-blue-600'
    },
    maintenance: { 
        name: 'Bảo trì', 
        icon: 'fa-tools', 
        bgColor: 'bg-yellow-100', 
        borderColor: 'border-yellow-500', 
        textColor: 'text-yellow-900',
        iconColor: 'text-yellow-600'
    },
    announcement: { 
        name: 'Thông báo chung', 
        icon: 'fa-bullhorn', 
        bgColor: 'bg-green-100', 
        borderColor: 'border-green-500', 
        textColor: 'text-green-900',
        iconColor: 'text-green-600'
    },
    emergency: { 
        name: 'Khẩn cấp', 
        icon: 'fa-exclamation-triangle', 
        bgColor: 'bg-red-100', 
        borderColor: 'border-red-500', 
        textColor: 'text-red-900',
        iconColor: 'text-red-600'
    }
};

// Function to fetch notifications from admin system (legacy - now using combined API)
async function fetchAdminNotifications() {
    console.warn('fetchAdminNotifications is deprecated, use loadAllDataFromAPI instead');
    return [];
}

// Function to check if notification is new (not seen before)
function isNewNotification(notification) {
    const seenNotifications = JSON.parse(localStorage.getItem('seenNotifications') || '[]');
    const isSeen = seenNotifications.includes(notification.id);
    
    return !isSeen;
    
    // Production code (uncomment when deploying)
    // return !isSeen;
}

// Function to mark notification as seen
function markNotificationAsSeen(notificationId) {
    const seenNotifications = JSON.parse(localStorage.getItem('seenNotifications') || '[]');
    if (!seenNotifications.includes(notificationId)) {
        seenNotifications.push(notificationId);
        localStorage.setItem('seenNotifications', JSON.stringify(seenNotifications));
    }
}

// Function to create notification HTML
function createNotificationHTML(notification) {
    const typeInfo = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.announcement;
    
    return `
        <div id="notification-${notification.id}" class="notification-item notification-enter bg-white border-l-4 ${typeInfo.borderColor} rounded-lg shadow-lg p-4" data-notification-id="${notification.id}">
            <div class="flex items-start justify-between">
                <div class="flex items-start space-x-3 flex-1">
                    <div class="flex-shrink-0 mt-1">
                        <div class="w-10 h-10 rounded-full ${typeInfo.bgColor} flex items-center justify-center">
                            <i class="fas ${typeInfo.icon} ${typeInfo.iconColor} text-lg"></i>
                        </div>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between mb-2">
                            <h4 class="font-semibold ${typeInfo.textColor} text-base leading-tight">${notification.title}</h4>
                            <span class="px-3 py-1 text-xs font-medium ${typeInfo.bgColor} ${typeInfo.textColor} rounded-full">
                                ${typeInfo.name}
                            </span>
                        </div>
                        <p class="text-sm ${typeInfo.textColor} opacity-90 leading-relaxed">${notification.message}</p>
                    </div>
                </div>
                <button onclick="dismissNotification('${notification.id}')" class="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
                    <i class="fas fa-times text-sm"></i>
                </button>
            </div>
        </div>
    `;
}

// Function to show notification
function showNotification(notification) {
    console.log('Showing notification:', notification);
    
    let container = document.getElementById('adminNotifications');
    if (!container) {
        // Auto-create container if missing
        container = document.createElement('div');
        container.id = 'adminNotifications';
        container.className = 'fixed top-20 left-4 right-4 z-[160] max-w-md mx-auto space-y-3';
        document.body.appendChild(container);
        console.warn('adminNotifications container was missing; created dynamically.');
    }
    
    console.log('Found adminNotifications container:', container);
    
    const notificationHTML = createNotificationHTML(notification);
    container.insertAdjacentHTML('beforeend', notificationHTML);
    
    // Animate in
    const notificationElement = document.getElementById(`notification-${notification.id}`);
    if (notificationElement) {
        // Force reflow
        notificationElement.offsetHeight;
        
        setTimeout(() => {
            notificationElement.classList.remove('notification-enter');
            notificationElement.classList.add('notification-enter-active');
        }, 50);
        
        // Auto-dismiss after 10 seconds
        setTimeout(() => {
            dismissNotification(notification.id);
        }, 10000);
    }
    
    // Auto dismiss after duration
    setTimeout(() => {
        dismissNotification(notification.id);
    }, NOTIFICATION_CONFIG.DISPLAY_DURATION);
    
    // Mark as seen
    markNotificationAsSeen(notification.id);
}

// Function to dismiss notification
function dismissNotification(notificationId) {
    const notificationElement = document.getElementById(`notification-${notificationId}`);
    if (!notificationElement) return;
    
    // Mark as seen in localStorage
    const seenNotifications = JSON.parse(localStorage.getItem('seenNotifications') || '[]');
    if (!seenNotifications.includes(notificationId)) {
        seenNotifications.push(notificationId);
        localStorage.setItem('seenNotifications', JSON.stringify(seenNotifications));
    }
    
    // Animate out
    notificationElement.classList.remove('notification-enter-active');
    notificationElement.classList.add('notification-exit', 'notification-exit-active');
    
    setTimeout(() => {
        if (notificationElement.parentNode) {
            notificationElement.parentNode.removeChild(notificationElement);
        }
    }, 300);
}

// Function to load all data from combined API
async function loadAllDataFromAPI(forceFresh = false) {
    try {
        console.log('Loading all data from combined API...');
        const url = forceFresh ? `${COMBINED_API_URL}?t=${Date.now()}` : COMBINED_API_URL;
        const response = await fetch(url, {
            cache: forceFresh ? 'no-store' : 'default',
            headers: forceFresh ? { 'Cache-Control': 'no-cache' } : undefined
        });
        if (response.ok) {
            const result = await response.json();
            console.log('Combined API result:', result);
            
            // Check if we have cached data to compare
            const cachedData = localStorage.getItem('combinedDataCache');
            if (cachedData && !forceFresh) {
                const cached = JSON.parse(cachedData);
                const notificationsChanged = cached.notifications.lastModified !== result.notifications.lastModified;
                const gpsChanged = cached.gpsSettings.lastModified !== result.gpsSettings.lastModified;
                
                if (!notificationsChanged && !gpsChanged) {
                    // Use cached data and update UI
                    GPS_SETTINGS = cached.gpsSettings.data;
                    const notifications = cached.notifications.data.filter(n => n.active);
                    processNotifications(notifications);
                    // Ensure UI reflects cached settings
                    updateRegistrationTimeStatus();
                    updateCertificateRadiusDisplay();
                    return;
                }
            }
            
            // Save new data to cache
            localStorage.setItem('combinedDataCache', JSON.stringify({
                notifications: result.notifications,
                gpsSettings: result.gpsSettings
            }));
            
            // Process GPS settings
            GPS_SETTINGS = result.gpsSettings.data;
            localStorage.setItem('gpsSettings', JSON.stringify(GPS_SETTINGS));
            
            // Process notifications
            const notifications = result.notifications.data.filter(n => n.active);
            localStorage.setItem('climbNotifications', JSON.stringify(notifications));
            processNotifications(notifications);
            
                // Update registration time status after GPS settings are loaded
    updateRegistrationTimeStatus();
    
    // Update certificate radius display
    updateCertificateRadiusDisplay();
            
        } else {
            throw new Error('Failed to fetch combined data');
        }
    } catch (error) {
        console.error('Error loading combined data:', error);
        // Fallback to individual APIs
        await loadGpsSettings();
        checkForNewNotificationsFromLocalStorage();
        
        // Update registration time status even in fallback case
        updateRegistrationTimeStatus();
        
        // Update certificate radius display
        updateCertificateRadiusDisplay();
    }
}

// Function to process notifications
function processNotifications(notifications) {
    // Filter for new notifications
    const newNotifications = notifications.filter(isNewNotification);
    
    // Limit the number of notifications shown
    const notificationsToShow = newNotifications.slice(0, NOTIFICATION_CONFIG.MAX_NOTIFICATIONS);
    
    notificationsToShow.forEach(notification => {
        showNotification(notification);
    });
}

// Function to check for new notifications on page load (fetch from API first)
async function checkForNewNotificationsOnPageLoad() {
    // This function is now replaced by loadAllDataFromAPI
    await loadAllDataFromAPI();
}

// Function to check for new notifications from localStorage only (no API call)
function checkForNewNotificationsFromLocalStorage() {
    try {
        const storedNotifications = localStorage.getItem('climbNotifications');
        if (!storedNotifications) return;
        
        const data = JSON.parse(storedNotifications);
        
        // Handle both old format (array) and new format (object with notifications array)
        let notifications;
        if (Array.isArray(data)) {
            notifications = data;
        } else if (data.notifications && Array.isArray(data.notifications)) {
            notifications = data.notifications;
        } else {
            console.warn('Invalid notifications format in localStorage:', data);
            return;
        }
        
        const activeNotifications = notifications.filter(n => n.active);
        const newNotifications = activeNotifications.filter(isNewNotification);
        
        // Limit the number of notifications shown
        const notificationsToShow = newNotifications.slice(0, NOTIFICATION_CONFIG.MAX_NOTIFICATIONS);
        
        notificationsToShow.forEach(notification => {
            showNotification(notification);
        });
    } catch (error) {
        console.error('Error checking for notifications from localStorage:', error);
    }
}

// Function to check for new notifications (with API call - only when needed)
async function checkForNewNotifications() {
    console.warn('checkForNewNotifications is deprecated, use loadAllDataFromAPI instead');
    await loadAllDataFromAPI();
}

// Function to show real-time notification to users (improved version)
function showRealTimeNotification(message, type = 'info', duration = 3000) {
    // Create a subtle notification toast
    const notification = document.createElement('div');
    const iconClass = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-times-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-sync-alt';
    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500';
    
    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full opacity-0`;
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${iconClass} mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
    }, 100);
    
    // Auto-remove after duration
    setTimeout(() => {
        hideNotification(notification);
    }, duration);
    
    // Click to close
    notification.addEventListener('click', () => hideNotification(notification));
    
    function hideNotification(element) {
        element.style.transform = 'translateX(100%)';
        element.style.opacity = '0';
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, 300);
    }
}

// Function to load only notifications (not all data) - optimized with cache
async function loadNotificationsOnly(forceRefresh = false) {
    try {
        const fetchNotifications = async () => {
            const response = await fetch('/.netlify/functions/combined-data');
            if (!response.ok) throw new Error('Failed to fetch notifications');
            return await response.json();
        };

        const result = forceRefresh ? 
            await fetchNotifications() : 
            await window.cacheManager.getDataWithStaleWhileRevalidate(
                'notifications_cache', 
                fetchNotifications,
                { forceRefresh: false, showLoading: false }
            );

        const notifications = result.notifications?.data || [];
        
        // Store in localStorage for future use
        localStorage.setItem('climbNotifications', JSON.stringify({
            notifications: notifications.filter(n => n.active),
            lastUpdated: Date.now()
        }));
        
        // Process and show new notifications
        processNotifications(notifications);
        
        console.log('Notifications refreshed successfully');
        return notifications;
    } catch (error) {
        console.error('Error loading notifications:', error);
        // Fallback to localStorage if API fails
        checkForNewNotificationsFromLocalStorage();
        return [];
    }
}

// Function to load only GPS settings (not all data) - optimized with cache
async function loadGpsSettingsOnly(forceRefresh = false) {
    try {
        const fetchGpsSettings = async () => {
            const response = await fetch('/.netlify/functions/combined-data');
            if (!response.ok) throw new Error('Failed to fetch GPS settings');
            return await response.json();
        };

        const result = forceRefresh ? 
            await fetchGpsSettings() : 
            await window.cacheManager.getDataWithStaleWhileRevalidate(
                'gps_settings_cache', 
                fetchGpsSettings,
                { forceRefresh: false, showLoading: false }
            );

        const gpsSettings = result.gpsSettings?.data;
        
        if (gpsSettings) {
            // Store in localStorage
            localStorage.setItem('gpsSettings', JSON.stringify(gpsSettings));
            
            // Update global GPS_SETTINGS
            GPS_SETTINGS = gpsSettings;
            
            // Update UI components
            updateRegistrationTimeStatus();
            updateCertificateRadiusDisplay();
            
            console.log('GPS settings refreshed successfully');
            return gpsSettings;
        }
        return null;
    } catch (error) {
        console.error('Error loading GPS settings:', error);
        return null;
    }
}

// Function to initialize notification system
function initializeNotificationSystem() {
    // Check for notifications immediately on page load (fetch from API first, then localStorage)
    checkForNewNotificationsOnPageLoad();
    
    // Listen for localStorage changes (when admin creates new notifications)
    window.addEventListener('storage', function(e) {
        if (e.key === 'climbNotifications') {
            console.log('New notification detected via storage event, refreshing...');
            // Clear existing notifications and check for new ones
            const container = document.getElementById('adminNotifications');
            if (container) {
                container.innerHTML = '';
            }
            checkForNewNotificationsFromLocalStorage();
        }
        
        // Listen for real-time notification updates from admin
        if (e.key === 'notificationUpdate') {
            console.log('🚀 Real-time notification update received from admin');
            try {
                const updateData = JSON.parse(e.newValue || '{}');
                if (updateData.action === 'refresh') {
                    console.log('📱 Processing notification update:', updateData);
                    
                    // Check if this is a new notification (has newNotification data)
                    if (updateData.newNotification && updateData.isNew) {
                        console.log('🆕 New notification received:', updateData.newNotification);
                        
                        // Show the new notification immediately
                        showNotification(updateData.newNotification);
                        
                        // Show success message with notification title
                        showRealTimeNotification(`Thông báo mới: ${updateData.newNotification.title}`, 'success', 5000);
                        
                        // Update notifications array immediately
                        if (window.notifications) {
                            window.notifications.push(updateData.newNotification);
                        }
                        
                        // Update UI immediately
                        updateNotificationsDisplay();
                        
                        console.log('✅ New notification displayed immediately');
                    } else {
                        console.log('🔄 Regular notification refresh');
                        
                        // Force refresh notifications immediately
                        loadNotificationsOnly(true).then((notifications) => {
                            console.log('📋 Loaded notifications:', notifications);
                            if (notifications && notifications.length > 0) {
                                showRealTimeNotification('Thông báo đã được cập nhật', 'success');
                            }
                        }).catch(err => {
                            console.error('❌ Error loading notifications:', err);
                            // Fallback to localStorage
                            checkForNewNotificationsFromLocalStorage();
                            showRealTimeNotification('Thông báo đã được cập nhật', 'info');
                        });
                    }
                }
            } catch (err) {
                console.error('❌ Error parsing notification update:', err);
            }
        }
    });
    
    // Listen for custom events from admin panel (same-tab communication)
    window.addEventListener('adminNotificationUpdate', function(e) {
        console.log('🚀 Custom admin notification update received:', e.detail);
        try {
            const updateData = e.detail;
            if (updateData.action === 'refresh') {
                console.log('📱 Processing custom notification update:', updateData);
                
                // Check if this is a new notification
                if (updateData.newNotification && updateData.isNew) {
                    console.log('🆕 New notification received via custom event:', updateData.newNotification);
                    
                    // Show the new notification immediately
                    showNotification(updateData.newNotification);
                    
                    // Show success message with notification title
                    showRealTimeNotification(`Thông báo mới: ${updateData.newNotification.title}`, 'success', 5000);
                    
                    // Update notifications array immediately
                    if (window.notifications) {
                        window.notifications.push(updateData.newNotification);
                    }
                    
                    // Update UI immediately
                    updateNotificationsDisplay();
                    
                    console.log('✅ New notification displayed immediately via custom event');
                } else {
                    console.log('🔄 Regular notification refresh via custom event');
                    
                    // Force refresh notifications immediately
                    loadNotificationsOnly(true).then((notifications) => {
                        console.log('📋 Loaded notifications via custom event:', notifications);
                        if (notifications && notifications.length > 0) {
                            showRealTimeNotification('Thông báo đã được cập nhật', 'success');
                        }
                    }).catch(err => {
                        console.error('❌ Error loading notifications via custom event:', err);
                        // Fallback to localStorage
                        checkForNewNotificationsFromLocalStorage();
                        showRealTimeNotification('Thông báo đã được cập nhật', 'info');
                    });
                }
            }
        } catch (err) {
            console.error('❌ Error processing custom notification update:', err);
        }
    });
    
    // Listen for custom GPS settings updates from admin panel (same-tab communication)
    window.addEventListener('adminGpsSettingsUpdate', function(e) {
        console.log('🚀 Custom admin GPS settings update received:', e.detail);
        try {
            const updateData = e.detail;
            if (updateData.action === 'refresh' && updateData.settings) {
                console.log('📱 Updating GPS settings via custom event:', updateData.settings);
                GPS_SETTINGS = updateData.settings;
                updateRegistrationTimeStatus();
                updateCertificateRadiusDisplay();
                showRealTimeNotification('Cài đặt GPS đã được cập nhật bởi quản trị viên', 'success');
            } else if (updateData.action === 'refresh') {
                console.log('🔄 Loading GPS settings from API via custom event');
                loadGpsSettingsOnly(true).then((settings) => {
                    console.log('📋 Loaded GPS settings via custom event:', settings);
                    if (settings) {
                        showRealTimeNotification('Cài đặt GPS đã được cập nhật bởi quản trị viên', 'success');
                    }
                }).catch(err => {
                    console.error('❌ Error loading GPS settings via custom event:', err);
                    showRealTimeNotification('Cài đặt GPS đã được cập nhật', 'info');
                });
            }
        } catch (err) {
            console.error('❌ Error processing custom GPS settings update:', err);
        }
    });
    
    // Setup BroadcastChannel for cross-tab communication with admin
    if (typeof BroadcastChannel !== 'undefined') {
        const userBroadcastChannel = new BroadcastChannel('admin-notifications');
        
        // Listen for messages from admin tabs
        userBroadcastChannel.addEventListener('message', function(event) {
            if (event.data.type === 'notificationCreated') {
                console.log('📢 New notification created by admin:', event.data.notification);
                
                // Show the new notification immediately
                showNotification(event.data.notification);
                
                // Show success message
                showRealTimeNotification(`Thông báo mới: ${event.data.notification.title}`, 'success', 5000);
                
                // Update notifications array immediately
                if (window.notifications) {
                    window.notifications.push(event.data.notification);
                }
                
                // Update UI immediately
                updateNotificationsDisplay();
                
                console.log('✅ New notification displayed immediately via BroadcastChannel');
            }
        });
        
        // Store channel reference for later use
        window.userBroadcastChannel = userBroadcastChannel;
    }
    
    // Listen for custom events from admin panel (cross-window communication)
    window.addEventListener('message', function(e) {
        if (e.data && e.data.type === 'NEW_NOTIFICATION') {
            console.log('New notification event received, refreshing...');
            const container = document.getElementById('adminNotifications');
            if (container) {
                container.innerHTML = '';
            }
            checkForNewNotificationsFromLocalStorage();
        }
    });
    
    // Listen for GPS settings changes
    window.addEventListener('storage', function(e) {
        if (e.key === 'gpsSettings') {
            console.log('GPS settings changed via storage event, refreshing...');
            try {
                const newSettings = JSON.parse(e.newValue || '{}');
                GPS_SETTINGS = newSettings;
                console.log('GPS Settings updated from storage:', GPS_SETTINGS);
                // Update registration time status when GPS settings change
                updateRegistrationTimeStatus();
                
                // Update certificate radius display when GPS settings change
                updateCertificateRadiusDisplay();
                
                // Show real-time notification
                showRealTimeNotification('Cài đặt GPS đã được cập nhật');
            } catch (err) {
                console.error('Error parsing GPS settings:', err);
            }
        }
        
        // Listen for real-time GPS settings updates from admin
        if (e.key === 'gpsSettingsUpdate') {
            console.log('Real-time GPS settings update received from admin');
            try {
                const updateData = JSON.parse(e.newValue || '{}');
                if (updateData.action === 'refresh' && updateData.settings) {
                    console.log('Updating GPS settings directly:', updateData.settings);
                    GPS_SETTINGS = updateData.settings;
                    updateRegistrationTimeStatus();
                    updateCertificateRadiusDisplay();
                    showRealTimeNotification('Cài đặt GPS đã được cập nhật bởi quản trị viên', 'success');
                } else if (updateData.action === 'refresh') {
                    console.log('Loading GPS settings from API');
                    // Force refresh GPS settings immediately
                    loadGpsSettingsOnly(true).then((settings) => {
                        console.log('Loaded GPS settings:', settings);
                        if (settings) {
                            showRealTimeNotification('Cài đặt GPS đã được cập nhật bởi quản trị viên', 'success');
                        }
                    }).catch(err => {
                        console.error('Error loading GPS settings:', err);
                        showRealTimeNotification('Cài đặt GPS đã được cập nhật', 'info');
                    });
                }
            } catch (err) {
                console.error('Error parsing GPS settings update:', err);
            }
        }
    });
    
    // Listen for combined data cache changes
    window.addEventListener('storage', function(e) {
        if (e.key === 'combinedDataCache') {
            console.log('Combined data cache changed, refreshing...');
            // Force refresh to get latest data
            loadAllDataFromAPI();
        }
    });
    
    // Set up periodic refresh for both notifications and GPS settings (every 2 minutes)
    // This serves as a fallback in case real-time updates fail
    setInterval(() => {
        // Only refresh if user is active (not idle)
        if (!document.hidden) {
            console.log('Periodic refresh: checking for updates...');
            
            // Check for notification updates
            loadNotificationsOnly(false).catch(err => {
                console.warn('Periodic notification refresh failed:', err);
            });
            
            // Check for GPS settings updates
            loadGpsSettingsOnly(false).catch(err => {
                console.warn('Periodic GPS settings refresh failed:', err);
            });
        }
    }, 120000); // 2 minutes - fallback mechanism
    
    // Clean up old seen notifications (older than 7 days)
    cleanupOldSeenNotifications();
    
    // Initialize registration time status after data is loaded
    // updateRegistrationTimeStatus(); // Moved to after data loading
    
    // Update registration time status every minute
    setInterval(updateRegistrationTimeStatus, 60000);
    
    // Check for recent notifications on page load
    setTimeout(() => {
        const cachedData = localStorage.getItem('climbNotifications');
        if (cachedData) {
            try {
                const data = JSON.parse(cachedData);
                const notifications = data.notifications || data;
                const lastUpdate = data.lastUpdated || 0;
                const now = Date.now();
                
                // If notifications were updated within last 30 seconds, refresh display
                if (now - lastUpdate < 30000) {
                    console.log('🔄 Recent notifications detected, refreshing display...');
                    updateNotificationsDisplay();
                }
            } catch (err) {
                console.warn('Error checking cached notifications:', err);
            }
        }
    }, 1000);
    
    // Listen for page visibility changes (when user switches back to tab)
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            console.log('📱 Page became visible, checking for recent updates...');
            
            // Check for recent notifications
            const cachedData = localStorage.getItem('climbNotifications');
            if (cachedData) {
                try {
                    const data = JSON.parse(cachedData);
                    const lastUpdate = data.lastUpdated || 0;
                    const now = Date.now();
                    
                    // If notifications were updated within last 60 seconds, refresh display
                    if (now - lastUpdate < 60000) {
                        console.log('🔄 Recent notifications detected on tab focus, refreshing display...');
                        updateNotificationsDisplay();
                        showRealTimeNotification('Thông báo đã được cập nhật', 'info', 3000);
                    }
                } catch (err) {
                    console.warn('Error checking cached notifications on tab focus:', err);
                }
            }
        }
    });
}

// --- Realtime via Server-Sent Events (SSE) ---
function initializeRealtimeUpdatesViaSSE() {
    try {
        if (!window.EventSource) {
            console.warn('SSE not supported, consider fallback polling');
            // Fallback: periodic refresh every 30s
            if (!window.__climb_poll_fallback) {
                window.__climb_poll_fallback = setInterval(() => {
                    loadAllDataFromAPI();
                }, 30000);
            }
            return;
        }

        const es = new EventSource(SSE_UPDATES_URL, { withCredentials: false });
        let reconnectTimer = null;

        const onUpdate = async () => {
            try {
                console.log('[SSE] update event received -> refreshing data');
                await loadAllDataFromAPI(true);
            } catch (e) {
                console.warn('Failed to refresh after SSE update', e);
            }
        };

        es.addEventListener('hello', () => {
            console.log('[SSE] connected');
        });
        es.addEventListener('snapshot', onUpdate);
        es.addEventListener('update', onUpdate);
        es.addEventListener('ping', () => { /* keep-alive */ });
        es.addEventListener('error', (e) => {
            console.warn('[SSE] error event', e);
            // transient errors; rely on built-in reconnection
        });

        es.onerror = () => {
            if (reconnectTimer) return;
            console.warn('[SSE] connection lost, will retry in 3s');
            reconnectTimer = setTimeout(() => {
                reconnectTimer = null;
                try { es.close(); } catch {}
                initializeRealtimeUpdatesViaSSE();
            }, 3000);
        };

        window.addEventListener('beforeunload', () => {
            try { es.close(); } catch {}
        });
    } catch (e) {
        console.warn('Failed to init SSE:', e);
        // Fallback: periodic refresh every 30s
        if (!window.__climb_poll_fallback) {
            window.__climb_poll_fallback = setInterval(() => {
                loadAllDataFromAPI();
            }, 30000);
        }
    }
}

// Function to update registration time status display
function updateRegistrationTimeStatus() {
    const container = document.getElementById('registrationTimeStatus');
    if (!container) return;
    
    // Check if GPS_SETTINGS is properly initialized
    if (!GPS_SETTINGS || typeof GPS_SETTINGS.registrationTimeEnabled === 'undefined') {
        container.innerHTML = '';
        return;
    }
    
    const status = getRegistrationTimeStatus();
    if (!status) {
        container.innerHTML = '';
        return;
    }

    const isOpen = status.includes('✅');
    const bgColor = isOpen ? 'bg-green-100' : 'bg-red-100';
    const borderColor = isOpen ? 'border-green-500' : 'border-red-500';
    const textColor = isOpen ? 'text-green-800' : 'text-red-800';
    const icon = isOpen ? 'fa-clock' : 'fa-clock';
    const iconColor = isOpen ? 'text-green-600' : 'text-red-600';
    
    // Only show banner when CLOSED; inside hours, hide it
    if (!isOpen) {
        container.innerHTML = `
            <div id="regTimeBanner" class="${bgColor} border-l-4 ${borderColor} p-4 rounded-lg shadow-md relative" role="status" aria-live="polite">
                <button id="regTimeBannerClose" aria-label="Đóng" class="absolute right-2 top-1/2 -translate-y-1/2 text-red-700 hover:text-red-900 h-6 w-6 flex items-center justify-center">
                    <i class="fas fa-times"></i>
                </button>
                <div class="flex items-center pr-8">
                    <i class="fas ${icon} ${iconColor} text-lg mr-3"></i>
                    <div class="flex-1">
                        <p class="font-medium ${textColor} text-sm">${status}</p>
                    </div>
                </div>
            </div>
        `;
        // Ensure any previous temporary toast is hidden so no 'X' overlaps
        const closeBtn = document.getElementById('closeMessageBtn');
        if (closeBtn) closeBtn.click();
        // Force-hide and clear any toast so không còn nút tắt "X" chồng lên
        if (messageBox) {
            messageBox.innerHTML = '';
            messageBox.classList.add('hidden');
            messageBox.classList.remove('show');
        }
        // Dismiss handlers: click X or click outside
        const banner = document.getElementById('regTimeBanner');
        const bannerClose = document.getElementById('regTimeBannerClose');
        const dismiss = () => {
            container.innerHTML = '';
            document.removeEventListener('click', outsideHandler, true);
        };
        const outsideHandler = (e) => { if (banner && !banner.contains(e.target)) dismiss(); };
        bannerClose?.addEventListener('click', dismiss);
        setTimeout(() => { document.addEventListener('click', outsideHandler, true); }, 0);
    } else {
        container.innerHTML = '';
    }

    // Enforce UI state based on time window
    const isOpenNow = isOpen;
    if (startRegistrationBtn) {
        startRegistrationBtn.disabled = !isOpenNow;
        startRegistrationBtn.classList.toggle('opacity-60', !isOpenNow);
        startRegistrationBtn.classList.toggle('cursor-not-allowed', !isOpenNow);
    }
    if (!isOpenNow) {
        // If closed: ensure modal and form are hidden, show start area
        hideRepresentativeModal();
        if (registrationFormContainer) registrationFormContainer.classList.add('hidden');
        if (startRegistrationArea) startRegistrationArea.classList.remove('hidden');
    }
}

// Update certificate radius display
function updateCertificateRadiusDisplay() {
    const radiusElement = document.getElementById('certificateRadiusDisplay');
    if (!radiusElement || !GPS_SETTINGS) return;
    
    const radius = GPS_SETTINGS.certificateRadiusMeters || 150;
    radiusElement.textContent = radius;
}



// Function to update notifications display immediately
function updateNotificationsDisplay() {
    try {
        // Get current notifications from localStorage
        const cachedData = localStorage.getItem('climbNotifications');
        if (cachedData) {
            const data = JSON.parse(cachedData);
            const notifications = data.notifications || data; // Handle both formats
            
            // Update the notifications container
            const container = document.getElementById('notifications-container');
            if (container && notifications.length > 0) {
                container.innerHTML = notifications.map(notification => {
                    const typeInfo = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.announcement;
                    return `
                        <div class="notification-item ${typeInfo.bgColor} ${typeInfo.borderColor} border-l-4 p-4 rounded-lg mb-3" data-id="${notification.id}">
                            <div class="flex items-start justify-between">
                                <div class="flex items-start">
                                    <i class="fas ${typeInfo.icon} ${typeInfo.iconColor} mt-1 mr-3"></i>
                                    <div>
                                        <h3 class="font-semibold ${typeInfo.textColor}">${notification.title}</h3>
                                        <p class="text-sm text-gray-700 mt-1">${notification.message}</p>
                                        <p class="text-xs text-gray-500 mt-2">${new Date(notification.createdAt).toLocaleString('vi-VN')}</p>
                                    </div>
                                </div>
                                <button onclick="dismissNotification('${notification.id}')" class="text-gray-400 hover:text-gray-600 ml-4">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }
    } catch (err) {
        console.error('Error updating notifications display:', err);
    }
}

// Function to cleanup old seen notifications
function cleanupOldSeenNotifications() {
    const seenNotifications = JSON.parse(localStorage.getItem('seenNotifications') || '[]');
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    // In a real implementation, you might want to store timestamps with the IDs
    // For now, we'll just clear all seen notifications weekly
    if (seenNotifications.length > 100) { // Arbitrary limit
        localStorage.removeItem('seenNotifications');
    }
}

// Function to stop notification system
function stopNotificationSystem() {
    // Remove event listeners if needed
    // Currently using passive listeners, so no cleanup needed
}

// Function to manually refresh all data (can be called from admin panel)
function refreshAllData() {
    console.log('Manually refreshing all data...');
    const container = document.getElementById('adminNotifications');
    if (container) {
        container.innerHTML = '';
    }
    loadAllDataFromAPI();
}

// Function to manually refresh notifications (can be called from admin panel)
function refreshNotifications() {
    refreshAllData();
}

// Function to refresh GPS settings (can be called from admin panel)
async function refreshGpsSettings() {
    // Clear cache to force fresh data
    localStorage.removeItem('combinedDataCache');
    localStorage.removeItem('gpsSettings');
    
    // Load fresh data from API
    await loadAllDataFromAPI();
}

// ===== REGISTRATION TIME VALIDATION =====

// Check if current time is within registration time window
function isWithinRegistrationTime() {
    // Check if GPS_SETTINGS exists and has the required properties
    if (!GPS_SETTINGS || !GPS_SETTINGS.registrationTimeEnabled) {
        return true; // No time restriction
    }
    
    // Check if time settings exist
    if (!GPS_SETTINGS.registrationStartTime || !GPS_SETTINGS.registrationEndTime) {
        return true; // No time restriction if times are not set
    }
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert to minutes
    
    const [startHour, startMinute] = GPS_SETTINGS.registrationStartTime.split(':').map(Number);
    const [endHour, endMinute] = GPS_SETTINGS.registrationEndTime.split(':').map(Number);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    // Handle overnight time ranges (e.g., 22:00 to 06:00)
    if (endTime < startTime) {
        return currentTime >= startTime || currentTime <= endTime;
    } else {
        return currentTime >= startTime && currentTime <= endTime;
    }
}

// Get registration time status message
function getRegistrationTimeStatus() {
    // Check if GPS_SETTINGS exists and has the required properties
    if (!GPS_SETTINGS || !GPS_SETTINGS.registrationTimeEnabled) {
        return null;
    }
    
    // Check if time settings exist
    if (!GPS_SETTINGS.registrationStartTime || !GPS_SETTINGS.registrationEndTime) {
        return null;
    }
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMinute] = GPS_SETTINGS.registrationStartTime.split(':').map(Number);
    const [endHour, endMinute] = GPS_SETTINGS.registrationEndTime.split(':').map(Number);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    if (endTime < startTime) {
        // Overnight range
        if (currentTime >= startTime || currentTime <= endTime) {
            return `✅ Đăng ký mở cửa (${GPS_SETTINGS.registrationStartTime} - ${GPS_SETTINGS.registrationEndTime})`;
        } else {
            return `❌ Đăng ký đóng cửa (${GPS_SETTINGS.registrationStartTime} - ${GPS_SETTINGS.registrationEndTime})`;
        }
    } else {
        // Same day range
        if (currentTime >= startTime && currentTime <= endTime) {
            return `✅ Đăng ký mở cửa (${GPS_SETTINGS.registrationStartTime} - ${GPS_SETTINGS.registrationEndTime})`;
        } else {
            return `❌ Đăng ký đóng cửa (${GPS_SETTINGS.registrationStartTime} - ${GPS_SETTINGS.registrationEndTime})`;
        }
    }
}

// Validate registration time before form submission
function validateRegistrationTime() {
    if (!isWithinRegistrationTime()) {
        const status = getRegistrationTimeStatus();
        const message = status ? `Không thể đăng ký lúc này. ${status}` : 'Không thể đăng ký lúc này.';
        showMessage(message, 'error', 8000);
        return false;
    }
    return true;
}



// Export functions for global access
window.refreshNotifications = refreshNotifications;
// Debug function to test real-time updates
window.testRealTimeUpdate = function() {
    console.log('Testing real-time update system...');
    
    // Test notification update
    localStorage.setItem('notificationUpdate', JSON.stringify({
        action: 'refresh',
        newCount: 1,
        timestamp: Date.now(),
        force: true
    }));
    
    // Test GPS settings update
    localStorage.setItem('gpsSettingsUpdate', JSON.stringify({
        action: 'refresh',
        settings: {
            registrationRadius: 100,
            certificateRadius: 150,
            requireGpsRegistration: true,
            requireGpsCertificate: true,
            registrationTimeEnabled: false,
            registrationStartTime: '06:00',
            registrationEndTime: '18:00'
        },
        timestamp: Date.now(),
        force: true
    }));
    
    console.log('Test updates sent to localStorage');
};

window.dismissNotification = dismissNotification;
window.refreshGpsSettings = refreshGpsSettings;
window.getGpsSettings = getGpsSettings;
window.isWithinRegistrationTime = isWithinRegistrationTime;
window.getRegistrationTimeStatus = getRegistrationTimeStatus;
window.validateRegistrationTime = validateRegistrationTime;
window.updateNotificationsDisplay = updateNotificationsDisplay;
