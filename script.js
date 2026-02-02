const URL = "https://teachablemachine.withgoogle.com/models/uAwE3C3fU/";

let model, webcam;
let currentFacingMode = "environment";

const infoBox = document.getElementById("infoBox");
const detailBox = document.getElementById("detailBox");
const startBtn = document.getElementById("startBtn");
const switchBtn = document.getElementById("switchBtn");

startBtn.addEventListener("click", init);
switchBtn.addEventListener("click", switchCamera);

/* ================== UTIL ================== */
/* แปลงชื่อคลาสให้เป็น key กลาง (กันเว้นวรรค / ตัวพิมพ์) */
function normalizeClass(name) {
  return name.toLowerCase().replace(/\s+/g, "");
}

/* ================== DATABASE โรค ================== */
const diseaseData = {
  tungro: {
    name: "โรคใบสีส้มของข้าว",
    symptom:
      "เกิดจากเชื้อไวรัส มีเพลี้ยจักจั่นปีกลายหยักเป็นพาหะ ใบข้าวมีสีเหลืองส้มและใบม้วน",
    prevent:
      "ปลูกพันธุ์ข้าวต้านทาน ปลูกข้าวให้พร้อมกันในพื้นที่เดียวกัน และกำจัดต้นที่เป็นโรค"
  },

  brownspot: {
    name: "โรคใบจุดสีน้ำตาลของข้าว",
    symptom:
      "เกิดจากเชื้อรา Bipolaris oryzae แพร่กระจายผ่านเมล็ดพันธุ์ เศษซากพืช ลม และน้ำ",
    prevent:
      "ปรับปรุงความอุดมสมบูรณ์ของดิน ใช้เมล็ดพันธุ์ที่ปลอดโรค และกำจัดเศษซากพืชในแปลงนา"
  },

  blast: {
    name: "โรคไหม้ของข้าว",
    symptom:
      "เกิดจากเชื้อรา Pyricularia oryzae พบมากในสภาพอากาศชื้น สร้างความเสียหายรุนแรง",
    prevent:
      "ปลูกพันธุ์ข้าวต้านทาน จัดการปุ๋ยอย่างเหมาะสม และใช้สารป้องกันกำจัดเชื้อรา"
  },

  bacterialblight: {
    name: "โรคขอบใบแห้งของข้าว",
    symptom:
      "เป็นโรคแบคทีเรีย ใบแห้งจากขอบใบ พบมากในพื้นที่นาชลประทานและฝนตกชุก",
    prevent:
      "ปลูกพันธุ์ข้าวต้านทาน จัดการปุ๋ยไนโตรเจนอย่างเหมาะสม และจัดการน้ำในแปลงนา"
  },

  healthy: {
    name: "ข้าวปกติ (Healthy)",
    symptom:
      "ต้นข้าวมีลักษณะสมบูรณ์ ใบเขียว แข็งแรง ไม่พบอาการผิดปกติของโรค",
    prevent:
      "ดูแลใส่ปุ๋ยตามคำแนะนำ รักษาความสะอาดแปลงนา และเฝ้าระวังศัตรูพืชอย่างสม่ำเสมอ"
  }
};

/* ================== INIT ================== */
async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  model = await tmImage.load(modelURL, metadataURL);

  await startWebcam();
  switchBtn.style.display = "inline-block";
}

/* ================== WEBCAM ================== */
async function startWebcam() {
  if (webcam) await webcam.stop();

  const flip = currentFacingMode === "user";
  webcam = new tmImage.Webcam(260, 260, flip);

  await webcam.setup({ facingMode: currentFacingMode });
  await webcam.play();
  window.requestAnimationFrame(loop);

  const container = document.getElementById("webcam-container");
  container.innerHTML = "";
  container.appendChild(webcam.canvas);
}

async function switchCamera() {
  currentFacingMode =
    currentFacingMode === "environment" ? "user" : "environment";
  await startWebcam();
}

/* ================== LOOP ================== */
async function loop() {
  webcam.update();
  await predict();
  window.requestAnimationFrame(loop);
}

/* ================== PREDICT ================== */
async function predict() {
  const prediction = await model.predict(webcam.canvas);

  let best = prediction[0];
  for (let p of prediction) {
    if (p.probability > best.probability) best = p;
  }

  // แสดงผลหลัก
  document.getElementById("disease-name").innerText = best.className;
  document.getElementById("confidence").innerText =
    `ความมั่นใจ ${(best.probability * 100).toFixed(1)}%`;

  infoBox.style.display = "block";
  startBtn.style.display = "none";

  // แสดงรายละเอียดโรค
  const key = normalizeClass(best.className);
  if (diseaseData[key]) {
    const data = diseaseData[key];
    document.getElementById("detail-title").innerText = data.name;
    document.getElementById("detail-symptom").innerText = data.symptom;
    document.getElementById("detail-prevent").innerText = data.prevent;
    detailBox.style.display = "block";
  } else {
    // เผื่อกรณีไม่รู้จักคลาส
    detailBox.style.display = "none";
  }
}
