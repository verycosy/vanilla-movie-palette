const previewContainer = document.getElementById("preview-container");

const rgbToHex = (r, g, b) =>
  "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

function copy(e) {
  const color = e.target.dataset.color;

  const temp = document.createElement("input");
  temp.value = color;
  document.querySelector("body").append(temp);

  temp.select();
  document.execCommand("copy");
  temp.remove();

  const layer = document.querySelector(".layer");
  document.querySelector(".layer__hex").textContent = color;
  layer.style.backgroundColor = color;
  layer.style.top = window.scrollY + "px";

  layer.classList.add("show");
  setTimeout(() => {
    layer.classList.remove("show");
  }, 1200);
}

const getPalette = e => {
  const image = e.target;
  const paletteContainer = image.nextElementSibling;

  const colorThief = new ColorThief();
  const palette = colorThief.getPalette(image, 11);

  palette.forEach(tmp => {
    const div = document.createElement("div");
    const hex = rgbToHex(tmp[0], tmp[1], tmp[2]);

    div.className = "preview__palette";
    div.style.backgroundColor = hex;
    div.dataset.color = hex;
    div.addEventListener("click", copy);

    paletteContainer.appendChild(div);
  });
};

const io = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) {
      return;
    }

    const target = entry.target;
    const src = target.dataset.src;

    target.src = src;

    observer.unobserve(target);
  });
});

const sortColors = colors => {
  colors.forEach(color => {
    const r = color[0] / 255;
    const g = color[1] / 255;
    const b = color[2] / 255;

    const max = Math.max.apply(Math, [r, g, b]);
    const min = Math.min.apply(Math, [r, g, b]);

    const chr = max - min;
    let hue = 0;
    let sat = 0;
    const val = max;

    if (val > 0) {
      sat = chr / val;
      if (sat > 0) {
        if (r == max) {
          hue = 60 * ((g - min - (b - min)) / chr);
          if (hue < 0) {
            hue += 360;
          }
        } else if (g == max) {
          hue = 120 + 60 * ((b - min - (r - min)) / chr);
        } else if (b == max) {
          hue = 240 + 60 * ((r - min - (g - min)) / chr);
        }
      }
    }

    color.hue = hue;
    color.sat = sat;
    color.val = val;
  });

  return colors.sort((a, b) => a.hue - b.hue);
};

function init() {
  fetch(
    `https://api.github.com/repos/positive-jinho/movie-palette/contents/img/`,
    {
      method: "GET"
    }
  ).then(res => {
    res.json().then(list => {
      let preview = "";

      list.forEach(element => {
        preview += `
        <div class="preview">
            <img class="preview__img" data-src="${
              element.path
            }" crossorigin="Anonymous" />
            <div class="preview__palette-container"></div>
            <div class="preview__title"><b>${element.name}</div>
        </div>`;
      });

      previewContainer.innerHTML = preview;

      const imgList = document.getElementsByClassName("preview__img");

      for (let e of imgList) {
        e.addEventListener("load", getPalette);
        io.observe(e);
      }
    });
  });
}

if (previewContainer) {
  init();
}
