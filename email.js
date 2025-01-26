function sendLocation() {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            const emailRecipient = prompt("Enter the email address to send your location to:");

            if (!emailRecipient) {
                alert("Email address is required!");
                return;
            }

            const subject = "Your Location";
            const body = `Here is the location you requested:\nLatitude: ${latitude}\nLongitude: ${longitude}`;

            // Create the mailto link
            const mailtoLink = `mailto:${emailRecipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

            // Open the email client
            window.location.href = mailtoLink;

            alert("Location sent via email successfully!");
        },
        (error) => {
            console.error("Geolocation error:", error);
            alert("Failed to retrieve location. Please enable location services.");
        }
    );
}
