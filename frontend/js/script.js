       // App State
        let currentPlant = null;
        let plantHistory = [];
        let currentScreen = 'home';

        // Initialize app
        document.addEventListener('DOMContentLoaded', function() {
            loadHistory();
            updateRecentScans();
            setupEventListeners();
        });

        // Event Listeners
        function setupEventListeners() {
            // Navigation
            document.getElementById('homeBtn').addEventListener('click', () => showScreen('home'));
            document.getElementById('historyBtn').addEventListener('click', () => showScreen('history'));
            document.getElementById('backToHome').addEventListener('click', () => showScreen('home'));
            document.getElementById('backFromDetail').addEventListener('click', () => showScreen('home'));
            document.getElementById('backFromHistory').addEventListener('click', () => showScreen('home'));

            // Plant identification
            document.getElementById('identifyBtn').addEventListener('click', () => showScreen('identification'));
            document.getElementById('uploadArea').addEventListener('click', () => document.getElementById('imageInput').click());
            document.getElementById('imageInput').addEventListener('change', handleImageUpload);
            document.getElementById('analyzeBtn').addEventListener('click', analyzePlant);
            document.getElementById('retakeBtn').addEventListener('click', resetImageUpload);

            // Plant detail actions
            document.getElementById('viewDetailsBtn').addEventListener('click', () => {
                // This would typically scroll to details or expand them
                showToast('Viewing detailed information');
            });
            document.getElementById('provideFeedbackBtn').addEventListener('click', () => {
                document.getElementById('feedbackModal').classList.remove('hidden');
                document.getElementById('feedbackModal').classList.add('flex');
            });

            // Feedback modal
            document.getElementById('cancelFeedback').addEventListener('click', closeFeedbackModal);
            document.getElementById('feedbackForm').addEventListener('submit', submitFeedback);

            // Drag and drop
            const uploadArea = document.getElementById('uploadArea');
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('border-green-400');
            });
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('border-green-400');
            });
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('border-green-400');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    handleImageFile(files[0]);
                }
            });
        }

        // Screen Navigation
        function showScreen(screenName) {
            // Hide all screens
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.add('hidden');
                screen.classList.remove('fade-in');
            });

            // Show selected screen
            const targetScreen = document.getElementById(screenName + 'Screen');
            targetScreen.classList.remove('hidden');
            targetScreen.classList.add('fade-in');

            // Update navigation
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.remove('text-green-600');
                btn.classList.add('text-gray-600');
            });

            if (screenName === 'home') {
                document.getElementById('homeBtn').classList.add('text-green-600');
                document.getElementById('homeBtn').classList.remove('text-gray-600');
            } else if (screenName === 'history') {
                document.getElementById('historyBtn').classList.add('text-green-600');
                document.getElementById('historyBtn').classList.remove('text-gray-600');
                loadHistoryScreen();
            }

            currentScreen = screenName;
        }

        // Image Upload Handling
        function handleImageUpload(event) {
            const file = event.target.files[0];
            if (file) {
                handleImageFile(file);
            }
        }

        function handleImageFile(file) {
            if (!file.type.startsWith('image/')) {
                showToast('Please select an image file', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('previewImg').src = e.target.result;
                document.getElementById('imagePreview').classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }

        function resetImageUpload() {
            document.getElementById('imageInput').value = '';
            document.getElementById('imagePreview').classList.add('hidden');
        }
// Plant Analysis (Real API Call)
async function analyzePlant() {
    const loadingState = document.getElementById('loadingState');
    const imagePreview = document.getElementById('imagePreview');
    const imageInput = document.getElementById('imageInput');

    const file = imageInput.files[0];
    if (!file) {
        showToast("Please upload an image first", "error");
        return;
    }

    loadingState.classList.remove("hidden");
    imagePreview.classList.add("hidden");

    const formData = new FormData();
    formData.append("imageInput", file);

    try {
        // First API call - Get prediction
        const response = await fetch("http://127.0.0.1:5000/predict", {
            method: "POST",
            body: formData
        });

        const result = await response.json();
        
        if (!result.result) {
            loadingState.classList.add("hidden");
            showToast("Error: Unable to identify plant", "error");
            return;
        }

        // Second API call - Get plant info
        const res = await fetch("http://127.0.0.1:5000/plantInfo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plant_name: result.result })
        });

        const plant_data = await res.json();
        
        loadingState.classList.add("hidden");

        if (plant_data.error) {
            showToast("Error: " + plant_data.error, "error");
            return;
        }

        const apiPlant = plant_data
        console.log(apiPlant)

        if (apiPlant) {
            // Convert image to base64 for storage
            const reader = new FileReader();
            reader.onload = function(e) {
                console.log(apiPlant['benefits']);
                console.log(apiPlant.recipes);
                console.log(apiPlant['plantName'])

                
                // Build complete plant object matching frontend expectations
                currentPlant = {
                    name: apiPlant.plantName,  // API returns 'plantName', frontend expects 'name'
                    scientificName: apiPlant.scientificName,
                    family: apiPlant.family,
                    origin: apiPlant.origin,
                    benefits: apiPlant.benefits,
                    recipes: apiPlant.recipes,
                    toxicity: apiPlant.toxicity,
                    isToxic: apiPlant.isToxic,
                    confidence: result.confidence,  // From first API call
                    image: e.target.result,  // Base64 image
                    timestamp: new Date().toISOString()
                };

                // Add to history
                plantHistory.unshift(currentPlant);
                saveHistory();
                updateRecentScans();

                // Display details
                displayPlantDetails(currentPlant);
                showScreen("detail");
            };
            reader.readAsDataURL(file);

        } else {
            showToast("Error: Plant data not available", "error");
        }
    } catch (err) {
        loadingState.classList.add("hidden");
        showToast("Something went wrong: " + err.message, "error");
        console.error("Error:", err);
    }
}

        // Mock Plant Data Generator
        function generateMockPlantData() {
            const plants = [
                {
                    name: 'Aloe Vera',
                    scientificName: 'Aloe barbadensis',
                    family: 'Asphodelaceae',
                    origin: 'Arabian Peninsula',
                    benefits: [
                        'Skin healing and wound repair',
                        'Anti-inflammatory properties',
                        'Digestive aid when consumed',
                        'Natural moisturizer'
                    ],
                    recipes: [
                        {
                            title: 'Aloe Gel for Burns',
                            description: 'Cut fresh aloe leaf, extract gel, apply directly to clean burn. Repeat 2-3 times daily.'
                        },
                        {
                            title: 'Aloe Juice for Digestion',
                            description: 'Blend 2 tbsp aloe gel with water and honey. Consume once daily on empty stomach.'
                        }
                    ],
                    toxicity: 'Generally safe for topical use. Internal consumption should be limited and avoided during pregnancy.',
                    isToxic: false
                },
                {
                    name: 'Turmeric',
                    scientificName: 'Curcuma longa',
                    family: 'Zingiberaceae',
                    origin: 'Southeast Asia',
                    benefits: [
                        'Powerful anti-inflammatory',
                        'Antioxidant properties',
                        'Pain relief',
                        'Immune system support'
                    ],
                    recipes: [
                        {
                            title: 'Golden Milk',
                            description: 'Mix 1 tsp turmeric powder with warm milk, add honey and ginger. Drink before bedtime.'
                        },
                        {
                            title: 'Turmeric Paste for Wounds',
                            description: 'Mix turmeric powder with water to form paste. Apply to clean wounds, cover with bandage.'
                        }
                    ],
                    toxicity: 'Safe in culinary amounts. High doses may cause stomach upset or interact with blood thinners.',
                    isToxic: false
                },
                {
                    name: 'Ginger',
                    scientificName: 'Zingiber officinale',
                    family: 'Zingiberaceae',
                    origin: 'Maritime Southeast Asia',
                    benefits: [
                        'Nausea and motion sickness relief',
                        'Anti-inflammatory effects',
                        'Digestive aid',
                        'Pain reduction'
                    ],
                    recipes: [
                        {
                            title: 'Ginger Tea for Nausea',
                            description: 'Steep 1 inch fresh ginger root in hot water for 10 minutes. Add honey and lemon.'
                        },
                        {
                            title: 'Ginger Compress',
                            description: 'Grate fresh ginger, wrap in cloth, apply to sore muscles for 15-20 minutes.'
                        }
                    ],
                    toxicity: 'Generally safe. May interact with blood thinning medications. Limit intake during pregnancy.',
                    isToxic: false
                }
            ];

            return plants[Math.floor(Math.random() * plants.length)];
        }

        // Display Plant Details
        function displayPlantDetails(plant ) {
            document.getElementById('plantName').textContent = plant.name;
            document.getElementById('scientificName').textContent = plant.scientificName;
            document.getElementById('detailPlantImage').src = plant.image;
            document.getElementById('confidenceScore').textContent = plant.confidence + '%';
            document.getElementById('commonName').textContent = plant.name;
            document.getElementById('plantFamily').textContent = plant.family;
            document.getElementById('plantOrigin').textContent = plant.origin;

            // Medicinal Benefits
            const benefitsContainer = document.getElementById('medicinalBenefits');
            benefitsContainer.innerHTML = '';
            plant.benefits.forEach(benefit => {
                const benefitDiv = document.createElement('div');
                benefitDiv.className = 'flex items-start p-3 bg-green-50 rounded-lg';
                benefitDiv.innerHTML = `
                    <svg class="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    <span class="text-sm text-gray-700">${benefit}</span>
                `;
                benefitsContainer.appendChild(benefitDiv);
            });

            // Application Recipes
            const recipesContainer = document.getElementById('applicationRecipes');
            recipesContainer.innerHTML = '';
            plant.recipes.forEach(recipe => {
                const recipeDiv = document.createElement('div');
                recipeDiv.className = 'bg-blue-50 p-4 rounded-lg border border-blue-100';
                recipeDiv.innerHTML = `
                    <h4 class="font-semibold text-gray-800 mb-2">${recipe.title}</h4>
                    <p class="text-sm text-gray-600">${recipe.description}</p>
                `;
                recipesContainer.appendChild(recipeDiv);
            });

            // Safety Information
            const safetyInfo = document.getElementById('safetyInfo');
            const toxicityAlert = document.getElementById('toxicityAlert');
            
            if (plant.isToxic) {
                toxicityAlert.className = 'mt-8 bg-red-50 border border-red-200 rounded-2xl p-6';
                safetyInfo.innerHTML = `<p class="text-red-700">${plant.toxicity}</p>`;
            } else {
                toxicityAlert.className = 'mt-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-6';
                safetyInfo.innerHTML = `<p class="text-yellow-800">${plant.toxicity}</p>`;
            }
        }

        // Feedback Modal
        function closeFeedbackModal() {
            document.getElementById('feedbackModal').classList.add('hidden');
            document.getElementById('feedbackModal').classList.remove('flex');
            document.getElementById('feedbackForm').reset();
        }

        function submitFeedback(event) {
            event.preventDefault();
            const correctName = document.getElementById('correctPlantName').value;
            const comments = document.getElementById('feedbackComments').value;

            if (!correctName.trim()) {
                showToast('Please provide the correct plant name', 'error');
                return;
            }

            // In a real app, this would send data to your backend
            console.log('Feedback submitted:', {
                originalPrediction: currentPlant?.name,
                correctName: correctName,
                comments: comments,
                timestamp: new Date().toISOString()
            });

            closeFeedbackModal();
            showToast('Thank you for your feedback!');
        }

        // History Management
        function loadHistory() {
            const saved = localStorage.getItem('plantHistory');
            if (saved) {
                try {
                    plantHistory = JSON.parse(saved);
                } catch (e) {
                    plantHistory = [];
                }
            }
        }

        function saveHistory() {
            // Keep only last 50 entries
            if (plantHistory.length > 50) {
                plantHistory = plantHistory.slice(0, 50);
            }
            localStorage.setItem('plantHistory', JSON.stringify(plantHistory));
        }

        function updateRecentScans() {
            const container = document.getElementById('recentScans');
            container.innerHTML = '';

            const recent = plantHistory.slice(0, 3);
            
            if (recent.length === 0) {
                container.innerHTML = '<p class="text-gray-500 text-sm text-center py-4">No recent scans</p>';
                return;
            }

            recent.forEach(plant => {
                const scanDiv = document.createElement('div');
                scanDiv.className = 'plant-card bg-white/80 p-3 rounded-lg border border-green-100 cursor-pointer';
                scanDiv.innerHTML = `
                    <div class="flex items-center">
                        <img src="${plant.image}" class="w-12 h-12 object-cover rounded-lg">
                        <div class="ml-3 flex-1">
                            <p class="font-medium text-gray-800">${plant.name}</p>
                            <p class="text-sm text-gray-600">${new Date(plant.timestamp).toLocaleDateString()}</p>
                        </div>
                        <div class="text-sm text-green-600">${plant.confidence}%</div>
                    </div>
                `;
                
                scanDiv.addEventListener('click', () => {
                    currentPlant = plant;
                    displayPlantDetails(plant);
                    showScreen('detail');
                });
                
                container.appendChild(scanDiv);
            });
        }

        function loadHistoryScreen() {
            const container = document.getElementById('historyGrid');
            container.innerHTML = '';

            if (plantHistory.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full text-center py-12">
                        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
                        </svg>
                        <p class="text-gray-500">No plant identifications yet</p>
                        <button onclick="showScreen('identification')" class="mt-4 text-green-600 hover:text-green-700 font-medium">
                            Start Identifying Plants →
                        </button>
                    </div>
                `;
                return;
            }

            plantHistory.forEach(plant => {
                const historyCard = document.createElement('div');
                historyCard.className = 'plant-card bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-green-100 cursor-pointer';
                historyCard.innerHTML = `
                    <img src="${plant.image}" class="w-full h-40 object-cover rounded-lg mb-3">
                    <h3 class="font-semibold text-gray-800 mb-1">${plant.name}</h3>
                    <p class="text-sm text-gray-600 mb-2">${plant.scientificName}</p>
                    <div class="flex justify-between items-center">
                        <span class="text-xs text-gray-500">${new Date(plant.timestamp).toLocaleDateString()}</span>
                        <div class="flex items-center text-green-600">
                            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                            </svg>
                            <span class="text-sm">${plant.confidence}%</span>
                        </div>
                    </div>
                `;
                
                historyCard.addEventListener('click', () => {
                    currentPlant = plant;
                    displayPlantDetails(plant);
                    showScreen('detail');
                });
                
                container.appendChild(historyCard);
            });
        }

        // Toast Notifications
        function showToast(message, type = 'success') {
            const toast = document.getElementById('successToast');
            const toastMessage = document.getElementById('toastMessage');
            
            toastMessage.textContent = message;
            
            if (type === 'error') {
                toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg transform translate-x-full transition-transform z-50';
            } else {
                toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform translate-x-full transition-transform z-50';
            }
            
            // Show toast
            setTimeout(() => {
                toast.style.transform = 'translateX(0)';
            }, 100);
            
            // Hide toast
            setTimeout(() => {
                toast.style.transform = 'translateX(100%)';
            }, 3000);
        }