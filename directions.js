let map, userCircle, routeControl;

// Initialize map and user location
function initMap() {
    // Create the map
    map = L.map('map').setView([0, 0], 2);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors'
    }).addTo(map);

    // Check if Geolocation is supported
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                console.log("User's location detected:", lat, lon);

                // Center the map at the user's location
                map.setView([lat, lon], 15);

                // Add a circle marker for the user's location
                userCircle = L.circleMarker([lat, lon], {
                    radius: 15, // Size of the circle
                    color: '#FF4500', // Border color (warm red - OrangeRed)
                    fillColor: '#FF6347', // Fill color (warm red - Tomato)
                    fillOpacity: 0.5, // Fill opacity
                }).addTo(map).bindPopup("You are here!").openPopup();

                // Initialize routing control
                routeControl = L.Routing.control({
                    waypoints: [L.latLng(lat, lon)], // User's location as the starting point
                    routeWhileDragging: true,
                }).addTo(map);

                // Scan for nearby safe zones
                scanNearbyLocations(lat, lon);
            },
            (error) => {
                console.error("Geolocation error:", error);
                alert("Failed to get your location. Please enable location access.");
            }
        );
    } else {
        alert("Geolocation is not supported by your browser.");
    }
}

// Scan for nearby 24/7 safe zones and allow routing
async function scanNearbyLocations(lat, lon) {
    try {
        const query = `
            [out:json];
            (
                node(around:5000, ${lat}, ${lon})["opening_hours"="24/7"];
            );
            out body;
        `;

        console.log("Executing Overpass API query:", query);

        const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error(`Overpass API error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Data fetched from Overpass API:", data);

        if (data.elements.length === 0) {
            console.warn("No 24/7 locations found in the area.");
            alert("No 24/7 safe zones found nearby.");
            return;
        }

        // Add markers for each safe zone
        data.elements.forEach((element) => {
            if (element.lat && element.lon) {
                const safeZoneMarker = L.marker([element.lat, element.lon]).addTo(map)
                    .bindPopup(`<strong>${element.tags.name || "24/7 Safe Zone"}</strong><br>
                                Latitude: ${element.lat}, Longitude: ${element.lon}<br>
                                <button onclick="routeToSafeZone(${element.lat}, ${element.lon})">Get Directions</button>`);

                console.log(`Safe zone pinned: ${element.tags.name || "Unnamed location"} at [${element.lat}, ${element.lon}]`);
            }
        });

        alert("24/7 safe zones have been pinned on the map!");
    } catch (error) {
        console.error("Error fetching 24/7 locations:", error);
        alert("Failed to scan for 24/7 safe zones.");
    }
}

// Function to route to a specific safe zone
function routeToSafeZone(lat, lon) {
    if (!routeControl) {
        alert("User location not detected yet!");
        return;
    }

    // Update the routing waypoints
    routeControl.setWaypoints([
        userCircle.getLatLng(), // Starting point: User's location
        L.latLng(lat, lon) // Destination: Safe zone
    ]);

    alert("Routing to the selected safe zone!");
}

// Initialize the map after the page is fully loaded
window.onload = initMap;
