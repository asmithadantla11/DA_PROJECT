const dashboardData = {
  summary: {
    record_count: 21609,
    average_sale_price: 511619,
    basement_area_total: 38643798,
  },
  sales_by_renovation: [
    { bin: "250K", label: "32,500K", value: 130, color: "#ff8b78" },
    { bin: "275K", label: "61,875K", value: 222, color: "#df3446" },
    { bin: "300K", label: "39,900K", value: 132, color: "#b91648" },
    { bin: "325K", label: "122,335K", value: 378, color: "#f7c9c5" },
    { bin: "350K", label: "60,200K", value: 170, color: "#ef4246" },
    { bin: "375K", label: "51,750K", value: 139, color: "#f8d0cb" },
    { bin: "400K", label: "100,900K", value: 254, color: "#4f9a55" },
    { bin: "425K", label: "109,815K", value: 260, color: "#f7b9b4" },
    { bin: "450K", label: "93,635K", value: 213, color: "#ff927d" },
    { bin: "475K", label: "76,950K", value: 170, color: "#8ccf7c" },
    { bin: "500K", label: "57,000K", value: 137, color: "#df3446" },
    { bin: "525K", label: "76,000K", value: 152, color: "#fb7a69" },
    { bin: "550K", label: "68,775K", value: 129, color: "#f26357" },
    { bin: "575K", label: "87,450K", value: 158, color: "#237241" },
    { bin: "600K", label: "53,475K", value: 93, color: "#c91446" },
    { bin: "625K", label: "66,000K", value: 110, color: "#f8b9b5" },
  ],
  age_distribution: [
    { age: 50, value: 50, color: "#947393" },
    { age: 63, value: 63, color: "#b69bb2" },
    { age: 68, value: 68, color: "#a5a33a" },
    { age: 71, value: 71, color: "#d1d47a" },
    { age: 75, value: 75, color: "#e15159" },
    { age: 76, value: 76, color: "#ff8e82" },
    { age: 88, value: 88, color: "#737373" },
    { age: 94, value: 94, color: "#bbb8b6" },
    { age: 96, value: 96, color: "#a98078" },
    { age: 118, value: 118, color: "#d8b5ad" },
  ],
  feature_distribution: [
    { age: 4, bathrooms: 1530, bedrooms: 2070, floors: 1190 },
    { age: 12, bathrooms: 1225, bedrooms: 1565, floors: 930 },
    { age: 13, bathrooms: 1180, bedrooms: 1530, floors: 910 },
    { age: 14, bathrooms: 1150, bedrooms: 1515, floors: 855 },
    { age: 15, bathrooms: 1100, bedrooms: 1495, floors: 835 },
  ],
};

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function setupTableauEmbed() {
  const target = document.querySelector("#tableau-embed");
  if (!target) return;

  const tableauUrl = target.dataset.tableauUrl.trim();
  if (!tableauUrl) return;

  target.innerHTML = `<iframe title="Tableau Public housing dashboard" src="${tableauUrl}" loading="lazy"></iframe>`;
  target.classList.add("loaded");
  document.querySelector("#local-dashboard")?.classList.add("is-fallback");
}

function prepareCanvas(canvas) {
  if (!canvas) return null;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "14px Arial";
  ctx.fillStyle = "#1f2d34";
  ctx.strokeStyle = "#d8dde0";
  return ctx;
}

function drawAxes(ctx, area, maxValue, xLabels) {
  ctx.strokeStyle = "#d8dde0";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(area.left, area.top);
  ctx.lineTo(area.left, area.bottom);
  ctx.lineTo(area.right, area.bottom);
  ctx.stroke();

  for (let tick = 0; tick <= 4; tick += 1) {
    const value = (maxValue / 4) * tick;
    const y = area.bottom - (value / maxValue) * (area.bottom - area.top);
    ctx.strokeStyle = tick === 0 ? "#bfc5c8" : "#eceff1";
    ctx.beginPath();
    ctx.moveTo(area.left, y);
    ctx.lineTo(area.right, y);
    ctx.stroke();
    ctx.fillStyle = "#1f2d34";
    ctx.textAlign = "right";
    ctx.fillText(Math.round(value).toString(), area.left - 10, y + 4);
  }

  ctx.textAlign = "center";
  xLabels.forEach((label, index) => {
    const step = (area.right - area.left) / xLabels.length;
    const x = area.left + step * index + step / 2;
    ctx.fillStyle = "#1f2d34";
    ctx.font = "bold 14px Arial";
    ctx.fillText(label, x, area.bottom + 30);
  });
}

function drawSalesChart() {
  const canvas = document.querySelector("#salesChart");
  const ctx = prepareCanvas(canvas);
  if (!ctx) return;

  const data = dashboardData.sales_by_renovation;
  const area = { left: 70, top: 25, right: canvas.width - 20, bottom: canvas.height - 70 };
  drawAxes(ctx, area, 400, data.filter((_, index) => index % 2 === 0).map((item) => item.bin));

  const step = (area.right - area.left) / data.length;
  const barWidth = Math.max(16, step * 0.82);
  data.forEach((item, index) => {
    const barHeight = (item.value / 400) * (area.bottom - area.top);
    const x = area.left + step * index + (step - barWidth) / 2;
    const y = area.bottom - barHeight;
    ctx.fillStyle = item.color;
    ctx.fillRect(x, y, barWidth, barHeight);

    ctx.save();
    ctx.translate(x + barWidth / 2 + 4, y - 8);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = "#111";
    ctx.font = "bold 13px Arial";
    ctx.fillText(item.label, 0, 0);
    ctx.restore();
  });

  ctx.fillStyle = "#1f2d34";
  ctx.font = "bold 14px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Sale Price (bin)", (area.left + area.right) / 2, canvas.height - 20);
  ctx.save();
  ctx.translate(18, (area.top + area.bottom) / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Count of Sale Price", 0, 0);
  ctx.restore();
}

function drawAgePieChart(canvasSelector = "#agePieChart") {
  const canvas = document.querySelector(canvasSelector);
  const ctx = prepareCanvas(canvas);
  if (!ctx) return;

  const data = dashboardData.age_distribution;
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2 + 12;
  const radius = Math.min(canvas.width, canvas.height) * 0.32;
  let startAngle = -Math.PI / 2;

  data.forEach((item) => {
    const angle = (item.value / total) * Math.PI * 2;
    const endAngle = startAngle + angle;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = item.color;
    ctx.fill();
    ctx.strokeStyle = "#111";
    ctx.stroke();

    const labelAngle = startAngle + angle / 2;
    const labelX = centerX + Math.cos(labelAngle) * (radius + 28);
    const labelY = centerY + Math.sin(labelAngle) * (radius + 28);
    ctx.fillStyle = "#111";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.fillText(item.age.toString(), labelX, labelY);
    startAngle = endAngle;
  });
}

function drawFeatureChart(canvasSelector = "#featureChart") {
  const canvas = document.querySelector(canvasSelector);
  const ctx = prepareCanvas(canvas);
  if (!ctx) return;

  const data = dashboardData.feature_distribution;
  const area = { left: 70, top: 45, right: canvas.width - 25, bottom: canvas.height - 70 };
  drawAxes(ctx, area, 2200, data.map((item) => item.age.toString()));

  const groupWidth = (area.right - area.left) / data.length;
  const barWidth = Math.min(42, groupWidth / 4.2);
  const series = [
    ["bathrooms", "No of Bathrooms", "#f3cf63"],
    ["bedrooms", "No of Bedrooms", "#ef7048"],
    ["floors", "No of Floors", "#bd1747"],
  ];

  data.forEach((item, groupIndex) => {
    const baseX = area.left + groupWidth * groupIndex + groupWidth / 2 - barWidth * 1.7;
    series.forEach(([key, label, color], seriesIndex) => {
      const value = item[key];
      const height = (value / 2200) * (area.bottom - area.top);
      const x = baseX + seriesIndex * (barWidth + 12);
      const y = area.bottom - height;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, barWidth, height);
      ctx.save();
      ctx.translate(x + barWidth / 2, area.bottom + 58);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = "#111";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "left";
      ctx.fillText(label, 0, 0);
      ctx.restore();
    });
  });

  ctx.fillStyle = "#1f2d34";
  ctx.font = "bold 14px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Age of House (in Years)", (area.left + area.right) / 2, 28);
  ctx.save();
  ctx.translate(20, (area.top + area.bottom) / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Value", 0, 0);
  ctx.restore();
}

function bindStoryTabs() {
  const tabs = document.querySelectorAll(".story-tab");
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((item) => item.classList.remove("active"));
      document.querySelectorAll(".story-copy").forEach((item) => item.classList.remove("active"));
      tab.classList.add("active");
      document.querySelector(`#${tab.dataset.storyTarget}`)?.classList.add("active");
    });
  });
}

function drawCharts() {
  document.querySelectorAll("[data-metric]").forEach((item) => {
    item.textContent = formatNumber(dashboardData.summary[item.dataset.metric]);
  });
  drawSalesChart();
  drawAgePieChart();
  drawFeatureChart();
  drawFeatureChart("#storyChart");
}

window.addEventListener("load", () => {
  setupTableauEmbed();
  bindStoryTabs();
  drawCharts();
});
