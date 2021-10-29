const start = new Date().getTime();
let numberPerPage = 4;
let slideIndex = 1;
const statsData = [
  { name: 'hp', color: 'success', value: 255 },
  { name: 'attack', color: 'danger', value: 190 },
  { name: 'defense', color: 'primary', value: 250 },
  { name: 'special-attack', color: 'warning', value: 194 },
  { name: 'special-defense', color: 'info', value: 250 },
  { name: 'speed', color: 'secondary', value: 200 }
];
const typesData = [
  {
    "name": "normal",
    "color": "primary",
    "opacity": 100,
    "url": "https://pokeapi.co/api/v2/type/1/"
  },
  {
    "name": "fighting",
    "color": "danger",
    "opacity": 50,
    "url": "https://pokeapi.co/api/v2/type/2/"
  },
  {
    "name": "flying",
    "color": "primary",
    "opacity": 50,
    "url": "https://pokeapi.co/api/v2/type/3/"
  },
  {
    "name": "poison",
    "color": "success",
    "opacity": 75,
    "url": "https://pokeapi.co/api/v2/type/4/"
  },
  {
    "name": "ground",
    "color": "warning",
    "opacity": 100,
    "url": "https://pokeapi.co/api/v2/type/5/"
  },
  {
    "name": "rock",
    "color": "secondary",
    "opacity": 75,
    "url": "https://pokeapi.co/api/v2/type/6/"
  },
  {
    "name": "bug",
    "color": "warning",
    "opacity": 75,
    "url": "https://pokeapi.co/api/v2/type/7/"
  },
  {
    "name": "ghost",
    "color": "light",
    "opacity": 100,
    "url": "https://pokeapi.co/api/v2/type/8/"
  },
  {
    "name": "steel",
    "color": "secondary",
    "opacity": 100,
    "url": "https://pokeapi.co/api/v2/type/9/"
  },
  {
    "name": "fire",
    "color": "danger",
    "opacity": 100,
    "url": "https://pokeapi.co/api/v2/type/10/"
  },
  {
    "name": "water",
    "color": "info",
    "opacity": 100,
    "url": "https://pokeapi.co/api/v2/type/11/"
  },
  {
    "name": "grass",
    "color": "success",
    "opacity": 100,
    "url": "https://pokeapi.co/api/v2/type/12/"
  },
  {
    "name": "electric",
    "color": "info",
    "opacity": 50,
    "url": "https://pokeapi.co/api/v2/type/13/"
  },
  {
    "name": "psychic",
    "color": "dark",
    "opacity": 50,
    "url": "https://pokeapi.co/api/v2/type/14/"
  },
  {
    "name": "ice",
    "color": "info",
    "opacity": 75,
    "url": "https://pokeapi.co/api/v2/type/15/"
  },
  {
    "name": "dragon",
    "color": "danger",
    "opacity": 50,
    "url": "https://pokeapi.co/api/v2/type/16/"
  },
  {
    "name": "dark",
    "color": "dark",
    "opacity": 75,
    "url": "https://pokeapi.co/api/v2/type/17/"
  },
  {
    "name": "fairy",
    "color": "light",
    "opacity": 100,
    "url": "https://pokeapi.co/api/v2/type/18/"
  },
  {
    "name": "unknown",
    "color": "primary",
    "opacity": 75,
    "url": "https://pokeapi.co/api/v2/type/10001/"
  },
  {
    "name": "shadow",
    "color": "dark",
    "opacity": 100,
    "url": "https://pokeapi.co/api/v2/type/10002/"
  }
];
let templateDetail = '';
let templateModal = '';
let templateSlide = '';
async function getTemplate() {
  const responseDetail = await fetch('template-detail.html');
  const responseModal = await fetch('template-modal.html');
  const responseSlide = await fetch('template-slide.html');
  templateDetail = await responseDetail.text();
  templateModal = await responseModal.text();
  templateSlide = await responseSlide.text();
}
getTemplate();
const apiUrl = 'https://pokeapi.co/api/v2';
let nextUrl = '';

function init() {
  console.log('Page loaded');
  console.log(`Init take:  ${new Date().getTime() - start} ms`);
  localStorage.clear();
  fetchData();
}

function getUrl(pokemonName) {
  return `${apiUrl}/pokemon/${pokemonName ? pokemonName : ''}?limit=${numberPerPage}`;
}

function fetchData(loadMore = false, pokemonName = '') {
  const url = loadMore ? nextUrl : getUrl(pokemonName);
  fetch(url)
    .then(checkResponseAndParseData)
    .then(handleData)
    .catch(showError);
}

function checkResponseAndParseData(response) {
  if (response.ok) {
    return response.json();
  } else {
    throw new Error(`status = ${response.status}, message = ${response.statusText ? response.statusText : 'Unknown'}`);
  }
}

async function handleData(data) {
  nextUrl = data.next;
  const mainContent = document.getElementById('main');
  if (data.results) {
    const array = [];
    for (const pokemonUrl of data.results) {
      array.push(
        fetch(pokemonUrl.url).then(responseEachPokemon => responseEachPokemon.json())
      );
    }
    Promise.all(array).then(async responses => {
      const pokemonArray = [];
      for (const data of responses) {
        pokemonArray.push(data);
      }
      for (const pokemon of pokemonArray) {
        const stringOfEachUIComponent = await buildUIComponent(pokemon);
        mainContent.insertAdjacentHTML('beforeend', stringOfEachUIComponent);
      }
      const dataStored = getDataLocalStorage('Pokemon') || [];
      const newData = dataStored.concat(pokemonArray);
      const dataWillStore = JSON.stringify(newData);
      localStorage.setItem('Pokemon', dataWillStore);
    }).catch(showError);
  } else {
    const stringOfUIComponent = await buildUIComponent(data);
    mainContent.insertAdjacentHTML('beforeend', stringOfUIComponent);
    const pokemonToJSONString = JSON.stringify([data]);
    localStorage.setItem('Pokemon', pokemonToJSONString);
  }
}

function getDataLocalStorage(key) {
  const dataStringStored = localStorage.getItem(key);
  return dataStored = JSON.parse(dataStringStored);
}

function showError(error) {
  console.error(error);
  return false;
}

function buildPillUI(color, opacity, name) {
  return `<h5><span class="p-2 py-0 rounded-pill btn btn-outline-${color} opacity-${opacity} mx-1">${name}</span></h5>`;
}

function buildAbilitiesUI(abilities, typeName) {
  let UIAbilities = '';
  for (const ability of abilities) {
    if (!ability.is_hidden) {
      const type = typesData.find(type => type.name === typeName)
      UIAbilities += buildPillUI(type.color, 100, ability.ability.name);
    }
  }
  return UIAbilities;
}

function buildTypesUI(types) {
  let UITypes = '';
  UITypes += checkAndAddPill(UITypes, types);
  return UITypes;
}

async function buildUIComponent(pokemon) {
  const idPokemon = pokemon.id;
  const name = pokemon.name;
  const image = pokemon.sprites.other.dream_world.front_default ? pokemon.sprites.other.dream_world.front_default : pokemon.sprites.other["official-artwork"].front_default;
  const weight = pokemon.weight;
  const height = pokemon.height;
  const experience = pokemon.base_experience;
  const types = buildTypesUI(pokemon.types);
  return `
    <div class="col">
      <div class="card h-100 border-0">
        <div class="ratio ratio-1x1">
          <img src="${image}" class="card-img-top" alt="...">
        </div>
        <div class="card-body p-0 mt-4 d-flex flex-column">
          <h1 class="card-title p-1">${name}</h1>
          <table class="table table-hover mb-0">
            <tbody>
              <tr>
                <td colspan="2">
                  <div class="d-flex">${types}</div>
                </td>
              </tr>
              <tr>
                <td>Base experiment</td>
                <td class="text-end">${experience}</td>
              </tr>
              <tr>
                <td>Weight</td>
                <td class="text-end">${weight} kg</td>
              </tr>
              <tr>
                <td>Height</td>
                <td class="text-end">${height} m</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="card-footer text-center">
          <button class="btn btn-primary shadow-none detail" data-bs-toggle="modal" data-bs-target="#detailModal"
            onclick="showDetail(${idPokemon})">Detail</button>
        </div>
      </div>
    </div>
  `;
  // return templateDetail.replace('idPokemon', id)
  //   .replace('${name}', name)
  //   .replace('${image}', image)
  //   .replace('${weight}', weight)
  //   .replace('${height}', height)
  //   .replace('${experience}', experience)
  //   .replace('${types}', types);
}

function buildProgressBarUI(number, percent, background, text) {
  return `
    <div class="progress mb-1 d-flex justify-content-between" style="height: 2rem">
      <div class="progress-bar progress-bar-striped progress-bar-animated bg-${background}" role="progressbar" style="width: ${percent}%">
        ${number}
      </div>
      <span class="pe-2" style="line-height: 2rem;">${text}</span>
    </div>
  `;
}

function buildStatUI(stats) {
  let stringProgressBar = '';
  const statArray = stats.map(stat => {
    return {
      name: stat.stat.name,
      val: stat.base_stat
    }
  });
  for (const it of statArray) {
    const stat = statsData.find(stat => stat.name === it.name);
    const percent = it.val * 100 / stat.value;
    stringProgressBar += buildProgressBarUI(it.val, percent, stat.color, it.name);
  }
  return stringProgressBar;
}

function buildBigImage(src, id) {
  return `
  <div class="carousel-item ${id === 0 ? 'active' : ''}">
      <img src="${src}" class="d-block w-100" alt="...">
    </div>
    `;
}

function buildThumbnailImage(src, id) {
  return `<button type="button" data-bs-target="#slides" data-bs-slide-to="${id}" class="${id === 0 ? 'active' : ''}"></button>`;
}

function buildSlideUI(imageObject) {
  const images = [];
  for (const key in imageObject) {
    const imageLayer = imageObject[key];
    for (const key2 in imageLayer) {
      if (imageLayer[key2]) {
        images.push(imageLayer[key2]);
      }
    }
  }
  let stringBigImage = '';
  let stringThumbnailImage = '';
  images.forEach((item, i) => {
    stringBigImage += buildBigImage(item, i);
    stringThumbnailImage += buildThumbnailImage(item, i, images.length);
  });
  return `
    <div id="slides" class="carousel carousel-dark slide" data-bs-ride="carousel">
      <div class="carousel-indicators">
        ${stringThumbnailImage}
      </div>
      <div class="carousel-inner p-5">
        ${stringBigImage}
      </div>
      <button class="carousel-control-prev" type="button" data-bs-target="#slides" data-bs-slide="prev">
        <span class="carousel-control-prev-icon"></span>
        <span class="visually-hidden">Previous</span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#slides" data-bs-slide="next">
        <span class="carousel-control-next-icon"></span>
        <span class="visually-hidden">Next</span>
      </button>
    </div>
    `;
  // return templateSlide.replace('${stringBigImage}', stringBigImage).replace('${stringThumbnailImage}', stringThumbnailImage);
}

function checkAndAddPill(string, array) {
  for (const it of array) {
    const typeData = typesData.find(type => type.name === (it.name ? it.name : it.type.name));
    const newPill = buildPillUI(typeData.color, typeData.opacity, typeData.name);
    if (!string.includes(newPill)) {
      string += newPill;
    }
  }
  return string;
}

async function buildProsAndConsUI(types) {
  const arrayPromise = [];
  for (const type of types) {
    arrayPromise.push(
      fetch(type.type.url).then(responseEachType => responseEachType.json())
    );
  }
  const values = await Promise.all(arrayPromise);
  let UIPros = '';
  let UICons = '';
  for (const it of values) {
    UICons = checkAndAddPill(UICons, it.damage_relations.double_damage_from);
    UIPros = checkAndAddPill(UIPros, it.damage_relations.double_damage_to);
  }
  return [UIPros, UICons];
}

async function buildEncounterUI(url) {
  const data = await fetch(url).then(response => response.json());
  let liString = '';
  for (const location of data) {
    liString += `<li>${location.location_area.name}</li>`;
  }
  return `<ul class="mb-0">${liString}<ul>`;
}

async function buildDetailUIModal(pokemon) {
  console.log(pokemon);
  const name = pokemon.name;
  const weight = pokemon.weight;
  const height = pokemon.height / 10;
  const is_default = pokemon.is_default;
  const experience = pokemon.base_experience;
  const species = pokemon.species.name;
  const types = buildTypesUI(pokemon.types);
  const abilities = buildAbilitiesUI(pokemon.abilities, pokemon.types[0].type.name);
  const stats = buildStatUI(pokemon.stats);
  const slides = buildSlideUI(pokemon.sprites.other);
  const encounter = await buildEncounterUI(pokemon.location_area_encounters);
  const [pros, cons] = await buildProsAndConsUI(pokemon.types);
  return `
    <div class="card border-0 h-100">
      <div class="row g-0 h-100">
        <div class="col-md-8">
          ${slides}
        </div>
        <div class="col-md-4">
          <div class="p-0 d-flex flex-column">
            <div class="d-flex">
              <h1 class="card-title p-1 flex-grow-1">${name}</h1>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="d-flex p-1 flex-wrap flex-grow-1">${types}</div>
            <table class="table table-hover mb-0">
              <tbody>
                <tr>
                  <td colspan="2">Abilities</td>
                </tr>
                <tr>
                  <td colspan="2">
                    <div class="d-flex">${abilities}</div>
                  </td>
                </tr>
                <tr>
                  <td>Species</td>
                  <td class="text-end">${species}</td>
                </tr>
                <tr>
                  <td>Default</td>
                  <td class="text-end">${is_default}</td>
                </tr>
                <tr>
                  <td>Sex</td>
                  <td class="text-end"></td>
                </tr>
                <tr>
                  <td>Base experiment</td>
                  <td class="text-end">${experience}</td>
                </tr>
                <tr>
                  <td>Weight</td>
                  <td class="text-end">${weight} kg</td>
                </tr>
                <tr>
                  <td>Height</td>
                  <td class="text-end">${height} m</td>
                </tr>
              </tbody>
            </table>
            ${stats}
          </div>
        </div>
        <table class="table mb-0 col-12">
          <tbody>
            <tr>
              <td class="table-success"><b>Best to beast:</b></td>
              <td class="table-warning"><b>Avoid with:</b></td>
            </tr>
            <tr>
              <td class="table-success">
                <div class="d-flex flex-wrap">${pros}</div>
              <td class="table-warning">
                <div class="d-flex flex-wrap">${cons}</div>
            </tr>
          </tbody>
        </table>
        <div class="col-12">
          <h2>Encounter</h2>
          ${encounter}
        </div>
        <div class="col-12">
          <h2>Evolutions</h2>
        </div>
      </div>
    </div>
  `;
  // return templateModal.replace('${name}', name)
  //   .replace('${weight}', weight)
  //   .replace('${height}', height)
  //   .replace('${is_default}', is_default)
  //   .replace('${experience}', experience)
  //   .replace('${species}', species)
  //   .replace('${types}', types)
  //   .replace('${abilities}', abilities)
  //   .replace('${stats}', stats)
  //   .replace('${slides}', slides)
  //   .replace('${encounter}', encounter)
  //   .replace('${pros}', pros)
  //   .replace('${cons}', cons);
}

function getPokemonInfo(pokemonId) {
  const pokemonArray = getDataLocalStorage('Pokemon');
  return data = pokemonArray.find(pokemon => pokemon.id === pokemonId);
}

async function addContent(pokemon) {
  const content = document.getElementById('content');
  const contentHTML = await buildDetailUIModal(pokemon);
  content.insertAdjacentHTML('beforeend', contentHTML);
}

function showClearSearchBtn() {
  const clearBtn = document.getElementById('clear');
  clearBtn.style.display = "block";
  clearBtn.parentElement.classList.add('justify-content-between');
}

function hideClearSearchBtn() {
  const clearBtn = document.getElementById('clear');
  clearBtn.style.display = "none";
  clearBtn.parentElement.classList.remove('justify-content-between');
}

function showDetail(pokemonId) {
  resetUI('content');
  const dataPokemon = getPokemonInfo(pokemonId);
  addContent(dataPokemon);
}

function searchPokemon() {
  const pokemonName = document.getElementById('search').value;
  resetUI('main');
  showClearSearchBtn();
  fetchData(false, pokemonName);
  return false; // or event.preventDefault(); instead of return false on HTML and javascript 
}

function clearSearch() {
  document.getElementById('search').value = '';
  localStorage.clear();
  resetUI('main');
  hideClearSearchBtn();
  fetchData();
}

function loadMore() {
  if (nextUrl) {
    fetchData(true);
  }
}

function updateNumberPerPage() {
  const range = document.getElementById('range');
  numberPerPage = range.value;
  const badge = document.getElementById('badge');
  badge.textContent = numberPerPage;
}

function resetUI(id) {
  const element = document.getElementById(id);
  element.innerHTML = '';
}