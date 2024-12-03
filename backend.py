import os
import io
import numpy as np
from fastapi import FastAPI, File, UploadFile
from pydantic import BaseModel
from tensorflow.keras.models import load_model # type: ignore
from joblib import load
from PIL import Image
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Update based on your frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Load models and scaler
cnn_model = load_model('./Models/cnn_model.h5')
rf_model = load('./Models/rf_model.pkl')
scaler = load('./Models/scaler.pkl')  # Load pre-saved scaler

# Updated labels for predictions
image_labels = [
    'Bacterial_leaf_blight',
    'Brown_spots',
    'Healthy',
    'Leaf_smut'
]  
tabular_labels = ['Bad', 'Good']  # Ensure these match the label encoding for Environmental Condition

# Pydantic model for tabular input
class TabularData(BaseModel):
    Maximum_Temperature: float
    Minimum_Temperature: float
    Temperature: float
    Precipitation: float
    Soil_pH: float
    Relative_Humidity: float

@app.post("/predict-image/")
async def predict_image(file: UploadFile = File(...)):
    try:
        # Read and preprocess image
        image = Image.open(io.BytesIO(await file.read())).convert("RGB")
        image = image.resize((128, 128))
        image = np.array(image) / 255.0  # Normalize the image
        image = np.expand_dims(image, axis=0)

        # Predict with CNN model
        prediction = cnn_model.predict(image)
        predicted_class = np.argmax(prediction[0])
        confidence = prediction[0][predicted_class]

        # Get predicted disease or health status
        disease = image_labels[predicted_class]

        # Custom message based on the prediction
        if disease == 'Healthy':
            message = f"The rice plant is healthy with confidence {confidence:.2f}."
        else:
            message = f"The rice plant is prone to {disease} with confidence {confidence:.2f}."

        return {
            "message": message,
            "probabilities": prediction[0].tolist()
        }
    except Exception as e:
        return {"error": str(e)}

@app.post("/predict-tabular/")
def predict_tabular(data: TabularData):
    try:
        # Convert and scale input data
        input_data = np.array([[data.Maximum_Temperature, data.Minimum_Temperature,
                                data.Temperature, data.Precipitation,
                                data.Soil_pH, data.Relative_Humidity]])
        scaled_data = scaler.transform(input_data)

        # Predict with Random Forest model
        prediction = rf_model.predict(scaled_data)
        predicted_label = prediction[0]  # 0 for Bad, 1 for Good

        # Custom message based on prediction
        if predicted_label == 1:
            message = "The environmental conditions are good for the rice plant."
        else:
            message = "The environmental conditions are not good for the rice plants. Protect the crops."

        return {
            "message": message,
            "condition": tabular_labels[predicted_label]
        }
    except Exception as e:
        return {"error": str(e)}
