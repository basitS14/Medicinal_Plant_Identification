const analyzeBtn = document.getElementById('analyzeBtn');

analyzeBtn.addEventListener('click', async function (e) {
    e.preventDefault(); // prevent form submission

    const imageInput = document.getElementById('imageInput');
    const file = imageInput.files[0];

    if (!file) {
        alert("Please upload an image first");
        return;
    }

    // Create FormData and append the file
    const formData = new FormData();
    formData.append("imageInput", file);

    try {
        const response = await fetch("http://127.0.0.1:5000/predict", {
            method: "POST",
            body: formData // ⚡ send FormData directly
        });

        const result = await response.json();
        if (result.prediction) {
            alert("Prediction: " + result.prediction);
        } else {
            alert("Error: " + result.error);
        }
    } catch (err) {
        alert("Something went wrong: " + err.message);
    }
});
