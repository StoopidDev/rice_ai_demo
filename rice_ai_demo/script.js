const URL = "https://teachablemachine.withgoogle.com/models/suh5sE3nM/";

let model, webcam, maxPredictions;

const infoBox = document.getElementById("infoBox");
const startBtn = document.getElementById("startBtn");

startBtn.addEventListener("click", init);

async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  const flip = true;
  webcam = new tmImage.Webcam(260, 260, flip);
  await webcam.setup();
  await webcam.play();
  window.requestAnimationFrame(loop);

  document.getElementById("webcam-container").appendChild(webcam.canvas);
}

async function loop() {
  webcam.update();
  await predict();
  window.requestAnimationFrame(loop);
}

async function predict() {
  const prediction = await model.predict(webcam.canvas);

  let best = prediction[0];
  for (let p of prediction) {
    if (p.probability > best.probability) best = p;
  }

  document.getElementById("disease-name").innerText = best.className;
  document.getElementById("confidence").innerText =
    `ความมั่นใจ ${(best.probability * 100).toFixed(1)}%`;

  document.getElementById("disease-desc").innerText =
    getDiseaseDescription(best.className);

  infoBox.style.display = "block";
  startBtn.style.display = "none";
}

function getDiseaseDescription(name) {
  switch (name) {
    case "blast":
      return "โรคใบไหม้ พบจุดสีน้ำตาลหรือเทา บนใบข้าว";
    case "bacterial_blight":
      return "โรคขอบใบแห้ง ใบเหลือง แห้งจากขอบ";
    case "brownspot":
      return "โรคจุดสีน้ำตาล มีจุดกลมสีน้ำตาลบนใบ";
    case "tungro":
      return "โรคใบสีส้ม ข้าวแคระแกร็น ใบเหลืองส้ม";
    default:
      return "-";
  }
}
