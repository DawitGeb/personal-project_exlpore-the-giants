let map;
let buildingData = [];
let markersLayer = L.layerGroup();

const buildingInfo = {
  "Burj Khalifa": {
    photoURL: "https://upload.wikimedia.org/wikipedia/en/thumb/9/93/Burj_Khalifa.jpg/800px-Burj_Khalifa.jpg",
    wikipediaURL: "https://en.wikipedia.org/wiki/Burj_Khalifa"
  },
  "Merdeka 118": {
    photoURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Merdeka_Tower_20241022_-_full_2_%28Cropped%29.jpg/800px-Merdeka_Tower_20241022_-_full_2_%28Cropped%29.jpg",
    wikipediaURL: "https://en.wikipedia.org/wiki/Merdeka_118"
  },
  "Shanghai Tower": {
    photoURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Shanghai_-_Shanghai_Tower_-_0003%28cropped%29.jpg/800px-Shanghai_-_Shanghai_Tower_-_0003%28cropped%29.jpg",
    wikipediaURL: "https://en.wikipedia.org/wiki/Shanghai_Tower"
  },
  "Makkah Royal Clock Tower": {
    photoURL: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f4/Abraj-al-Bait-Towers.JPG/800px-Abraj-al-Bait-Towers.JPG",
    wikipediaURL: "https://en.wikipedia.org/wiki/The_Clock_Towers"
  },
  "Ping An Finance Center": {
    photoURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Pingan_International_Finance_Center2020.jpg/800px-Pingan_International_Finance_Center2020.jpg",
    wikipediaURL: "https://en.wikipedia.org/wiki/Ping_An_Finance_Centre"
  },
  "Lotte World Tower": {
    photoURL: "https://upload.wikimedia.org/wikipedia/en/thumb/2/28/Lotte_World_Tower_day_view_10.jpg/800px-Lotte_World_Tower_day_view_10.jpg",
    wikipediaURL: "https://en.wikipedia.org/wiki/Lotte_World_Tower"
  },
  "One World Trade Center": {
    photoURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/One_World_Trade_Center_Building_%282021%29.jpg/800px-One_World_Trade_Center_Building_%282021%29.jpg",
    wikipediaURL: "https://en.wikipedia.org/wiki/One_World_Trade_Center"
  },
  "Guangzhou CTF Finance Centre": {
    photoURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Guangzhou_CTF_Finance_Centre_in_2016.jpg/800px-Guangzhou_CTF_Finance_Centre_in_2016.jpg",
    wikipediaURL: "https://en.wikipedia.org/wiki/Guangzhou_CTF_Finance_Centre"
  },
  "Tianjin CTF Finance Centre": {
    photoURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Tianjin_CTF_Finance_Centre_in_2019.jpg/800px-Tianjin_CTF_Finance_Centre_in_2019.jpg",
    wikipediaURL: "https://en.wikipedia.org/wiki/Tianjin_CTF_Finance_Centre"
  },
  "CITIC Tower": {
    photoURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/HK_Citic_Tower.jpg/800px-HK_Citic_Tower.jpg",
    wikipediaURL: "https://en.wikipedia.org/wiki/CITIC_Tower"
  },
  
};

// Initialize the map
function initMap() {
  try {
    if (!L) {
      console.error('Leaflet library not loaded');
      return;
    }
    
    map = L.map('map', {
      minZoom: 2,
      maxZoom: 19,
      zoomControl: true
    }).setView([20, 0], 3);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    markersLayer.addTo(map);

    // Add zoom to fit button
    const zoomToFitButton = L.control({ position: 'topleft' });
    zoomToFitButton.onAdd = function() {
      const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
      div.innerHTML = '<a href="#" title="Zoom to fit all markers" style="width: 30px; height: 30px; line-height: 30px; text-align: center; display: block;">🔍</a>';
      div.onclick = function(e) {
        e.preventDefault();
        zoomToFit();
      };
      return div;
    };
    zoomToFitButton.addTo(map);
  } catch (error) {
    console.error('Error initializing map:', error);
  }
}

// Load building data
async function loadBuildings() {
  try {
    const response = await fetch('/json/buildings.json');
    const data = await response.json();
    buildingData = Array.isArray(data) ? data : [data];
    populateDropdowns(buildingData);
    generateTop10List(buildingData);
    
    // Get top 10 buildings and show them on the map
    const top10 = buildingData
      .filter(b => parseFloat(b["Height (m)"]))
      .sort((a, b) => parseFloat(b["Height (m)"]) - parseFloat(a["Height (m)"]))
      .slice(0, 10);
    
    showMarkers(top10);
    updateBuildingCount(top10.length);
  } catch (error) {
    console.error('Error loading buildings:', error);
  }
}

// Populate dropdowns for comparison
function populateDropdowns(data) {
  const building1 = document.getElementById('building1');
  const building2 = document.getElementById('building2');

  // Sort buildings alphabetically by name
  const sortedData = [...data].sort((a, b) => a.Name.localeCompare(b.Name));

  sortedData.forEach(building => {
    const option1 = document.createElement('option');
    option1.value = building.Name;
    option1.textContent = building.Name;
    building1.appendChild(option1);

    const option2 = document.createElement('option');
    option2.value = building.Name;
    option2.textContent = building.Name;
    building2.appendChild(option2);
  });

  // Get the two tallest buildings
  const tallestBuildings = [...data]
    .filter(b => parseFloat(b["Height (m)"]))
    .sort((a, b) => parseFloat(b["Height (m)"]) - parseFloat(a["Height (m)"]))
    .slice(0, 2);

  if (tallestBuildings.length >= 2) {
    // Set the dropdowns to the two tallest buildings
    building1.value = tallestBuildings[0].Name;
    building2.value = tallestBuildings[1].Name;
    
    // Trigger the comparison
    document.getElementById('compare-button').click();
  }
}

// Display top 10 tallest buildings
function generateTop10List(data) {
  const topList = document.getElementById('top-10-list');
  topList.innerHTML = '';
  const top10 = data
    .filter(b => parseFloat(b["Height (m)"]))
    .sort((a, b) => parseFloat(b["Height (m)"]) - parseFloat(a["Height (m)"]))
    .slice(0, 10);

  // Create tooltip element
  let tooltip = document.getElementById('top10-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'top10-tooltip';
    tooltip.style.display = 'none';
    document.body.appendChild(tooltip);
  }

  top10.forEach(building => {
    const item = document.createElement('li');
    item.textContent = `${building.Name} (${building["Height (m)"]} m)`;
    item.style.cursor = 'pointer';

    item.addEventListener('mouseover', (e) => {
      const info = buildingInfo[building.Name] || { photoURL: 'https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg', wikipediaURL: '#' };
      tooltip.innerHTML = `
        <div style="text-align:center;">
          <img src="${info.photoURL}" alt="${building.Name}" style="max-width:180px;max-height:180px;display:block;margin:0 auto 0.5em auto;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.15);">
          <div><a href="${info.wikipediaURL}" target="_blank" style="display:inline-block;padding:4px 8px;background-color:#f8f9fa;color:#000;text-decoration:none;border-radius:4px;border:1px solid #dee2e6;">Wikipedia</a></div>
        </div>
      `;
      tooltip.style.display = 'block';
      
      // Simple positioning with a small offset
      const offset = 20;
      let left = e.pageX + offset;
      let top = e.pageY - offset;
      
      // Basic boundary check
      if (top + 250 > window.innerHeight) {
        top = e.pageY - 250;
      }
      
      tooltip.style.left = left + 'px';
      tooltip.style.top = top + 'px';
    });

    item.addEventListener('mouseout', () => {
      tooltip.style.display = 'none';
    });

    topList.appendChild(item);
  });

  // Make tooltip stay visible when hovering over it
  tooltip.addEventListener('mouseover', () => {
    tooltip.style.display = 'block';
  });

  tooltip.addEventListener('mouseout', () => {
    tooltip.style.display = 'none';
  });
}

// Render building markers on the map
function showMarkers(filteredBuildings) {
  markersLayer.clearLayers();
  filteredBuildings.forEach(b => {
    if (b["City Lat"] && b["City Lon"]) {
      const marker = L.marker([parseFloat(b["City Lat"]), parseFloat(b["City Lon"])])
        .bindPopup(`<strong>${b.Name}</strong><br>${b.City}, ${b.Country}<br>Height: ${b["Height (m)"]} m`);
      markersLayer.addLayer(marker);
    }
  });
  // Zoom to fit after adding markers
  zoomToFit();
}

// Dark mode toggle
function initDarkMode() {
  const toggle = document.getElementById('darkModeToggle');
  toggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode', toggle.checked);
  });
}

// Initialize mobile menu
function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger-menu');
  const navMenu = document.querySelector('.fixed-nav ul');
  
  hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
  });

  // Close menu when clicking a link
  const navLinks = document.querySelectorAll('.fixed-nav ul li a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      hamburger.classList.remove('active');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
      navMenu.classList.remove('active');
      hamburger.classList.remove('active');
    }
  });
}

// Comparison chart
function initComparison() {
  const compareButton = document.getElementById('compare-button');
  const chartCanvas = document.getElementById('comparison-chart');
  let barChart = null;

  compareButton.addEventListener('click', () => {
    const b1Name = document.getElementById('building1').value;
    const b2Name = document.getElementById('building2').value;

    if (!b1Name || !b2Name) {
      alert('Please select both buildings to compare');
      return;
    }

    const b1 = buildingData.find(b => b.Name === b1Name);
    const b2 = buildingData.find(b => b.Name === b2Name);

    if (!b1 || !b2) {
      alert('Error: Could not find building data');
      return;
    }

    // Prepare chart data
    const chartData = {
      labels: [b1.Name, b2.Name],
      datasets: [{
        label: 'Height (m)',
        data: [parseFloat(b1["Height (m)"]), parseFloat(b2["Height (m)"])],
        backgroundColor: ['#3498db', '#e74c3c'],
        borderColor: ['#2980b9', '#c0392b'],
        borderWidth: 1
      }]
    };

    // Chart configuration
    const config = {
      type: 'bar',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 20,
            right: 20,
            bottom: 20,
            left: 20
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Height (meters)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Buildings'
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Building Height Comparison',
            font: {
              size: 16
            },
            padding: {
              top: 10,
              bottom: 20
            }
          },
          legend: {
            display: false
          }
        }
      }
    };

    // Destroy existing chart if it exists
    if (barChart) {
      barChart.destroy();
    }

    // Create new chart
    barChart = new Chart(chartCanvas, config);

    // Update comparison details
    const details = document.getElementById('comparison-details');
    details.innerHTML = `
      <div class="comparison-grid">
        <div class="building-info">
          <h3>${b1.Name}</h3>
          <p><strong>Height:</strong> ${b1["Height (m)"]} m</p>
          <p><strong>Floors:</strong> ${b1.Floors}</p>
          <p><strong>Function:</strong> ${b1.Function}</p>
          <p><strong>Location:</strong> ${b1.City}, ${b1.Country}</p>
          <p><strong>Year Completed:</strong> ${b1["Completion Year"]}</p>
        </div>
        <div class="building-info">
          <h3>${b2.Name}</h3>
          <p><strong>Height:</strong> ${b2["Height (m)"]} m</p>
          <p><strong>Floors:</strong> ${b2.Floors}</p>
          <p><strong>Function:</strong> ${b2.Function}</p>
          <p><strong>Location:</strong> ${b2.City}, ${b2.Country}</p>
          <p><strong>Year Completed:</strong> ${b2["Completion Year"]}</p>
        </div>
      </div>
    `;
  });
}

// Add loading indicator
function showLoadingIndicator() {
  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'loading-indicator';
  loadingDiv.innerHTML = 'Loading buildings...';
  document.getElementById('map').appendChild(loadingDiv);
}

function hideLoadingIndicator() {
  const loadingDiv = document.getElementById('loading-indicator');
  if (loadingDiv) {
    loadingDiv.remove();
  }
}

// Show building count
function updateBuildingCount(count) {
  const countDiv = document.getElementById('building-count');
  if (!countDiv) {
    const newCountDiv = document.createElement('div');
    newCountDiv.id = 'building-count';
    document.getElementById('filter-section').appendChild(newCountDiv);
  }
  document.getElementById('building-count').textContent = `Showing ${count} buildings`;
}

// Clear filters
function clearFilters() {
  // Clear all markers from the map
  markersLayer.clearLayers();
  
  // Reset the map view to default
  map.setView([20, 0], 3);
  
  // Clear filter options
  document.getElementById('filter-options').innerHTML = '';
  
  // Reset building count
  document.getElementById('building-count').textContent = '';
  
  // Reset any active filter buttons
  document.querySelectorAll('.filter-button.active').forEach(button => {
    button.classList.remove('active');
  });
}

// Filter logic
function initFilter() {
  // Add clear filters button
  const clearButton = document.createElement('button');
  clearButton.textContent = 'Clear Filters';
  clearButton.className = 'clear-filters-button';
  clearButton.addEventListener('click', clearFilters);
  
  // Insert the clear button after the dropdown
  const dropdown = document.querySelector('.dropdown');
  dropdown.parentNode.insertBefore(clearButton, dropdown.nextSibling);

  document.querySelectorAll('.filter-button').forEach(button => {
    button.addEventListener('click', () => {
      const type = button.getAttribute('data-filter');
      const filterOptions = document.getElementById('filter-options');
      filterOptions.innerHTML = '';

      switch(type) {
        case 'country':
          const countries = [...new Set(buildingData.map(b => b.Country))].sort();
          const select = document.createElement('select');
          select.innerHTML = '<option value="">Select a country</option>';
          countries.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c;
            opt.textContent = c;
            select.appendChild(opt);
          });
          const applyBtn = document.createElement('button');
          applyBtn.textContent = 'Show Buildings';
          applyBtn.addEventListener('click', () => {
            const selected = select.value;
            if (selected) {
              showLoadingIndicator();
              const filtered = buildingData.filter(b => b.Country === selected);
              showMarkers(filtered);
              updateBuildingCount(filtered.length);
              hideLoadingIndicator();
            }
          });

          filterOptions.appendChild(select);
          filterOptions.appendChild(applyBtn);
          break;

        case 'min-floors':
          const floorInput = document.createElement('input');
          floorInput.type = 'number';
          floorInput.min = '1';
          floorInput.placeholder = 'Minimum floors';
          
          const floorBtn = document.createElement('button');
          floorBtn.textContent = 'Show Buildings';
          floorBtn.addEventListener('click', () => {
            const minFloors = parseInt(floorInput.value);
            if (minFloors > 0) {
              showLoadingIndicator();
              const filtered = buildingData.filter(b => parseInt(b.Floors) >= minFloors);
              showMarkers(filtered);
              updateBuildingCount(filtered.length);
              hideLoadingIndicator();
            }
          });

          filterOptions.appendChild(floorInput);
          filterOptions.appendChild(floorBtn);
          break;

        case 'completion-year':
          const yearInput = document.createElement('input');
          yearInput.type = 'number';
          yearInput.min = '1800';
          yearInput.max = new Date().getFullYear();
          yearInput.placeholder = 'Year built';
          
          const yearBtn = document.createElement('button');
          yearBtn.textContent = 'Show Buildings';
          yearBtn.addEventListener('click', () => {
            const year = parseInt(yearInput.value);
            if (year >= 1800 && year <= new Date().getFullYear()) {
              showLoadingIndicator();
              const filtered = buildingData.filter(b => parseInt(b["Completion Year"]) === year);
              showMarkers(filtered);
              updateBuildingCount(filtered.length);
              hideLoadingIndicator();
            }
          });

          filterOptions.appendChild(yearInput);
          filterOptions.appendChild(yearBtn);
          break;

        case 'function':
          const functions = [...new Set(buildingData.map(b => b.Function))].sort();
          const funcSelect = document.createElement('select');
          funcSelect.innerHTML = '<option value="">Select function</option>';
          functions.forEach(f => {
            const opt = document.createElement('option');
            opt.value = f;
            opt.textContent = f;
            funcSelect.appendChild(opt);
          });
          
          const funcBtn = document.createElement('button');
          funcBtn.textContent = 'Show Buildings';
          funcBtn.addEventListener('click', () => {
            const selected = funcSelect.value;
            if (selected) {
              showLoadingIndicator();
              const filtered = buildingData.filter(b => b.Function === selected);
              showMarkers(filtered);
              updateBuildingCount(filtered.length);
              hideLoadingIndicator();
            }
          });

          filterOptions.appendChild(funcSelect);
          filterOptions.appendChild(funcBtn);
          break;
      }
    });
  });
}

// Zoom to fit all visible markers or show world view
function zoomToFit() {
  const markers = markersLayer.getLayers();
  if (markers.length > 0) {
    // If there are markers, fit the view to them
    const group = new L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.1));
  } else {
    // If no markers, show the whole world
    map.setView([20, 0], 2);
  }
}

// Initialize contact modal
function initContactModal() {
    const modal = document.getElementById('contact-modal');
    const contactLink = document.getElementById('contact-link');
    const closeBtn = document.querySelector('.close-modal');

    contactLink.addEventListener('click', (e) => {
        e.preventDefault();
        modal.style.display = 'block';
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  loadBuildings();
  initDarkMode();
  initMobileMenu();
  initComparison();
  initFilter();
  initContactModal();
});