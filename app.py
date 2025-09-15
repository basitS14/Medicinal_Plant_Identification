import streamlit as st
import tensorflow as tf
from tensorflow.keras.preprocessing.image import load_img, img_to_array
import numpy as np

def preprocess_load_image(uploaded_file):
    IMG_SIZE = (224, 224)
    img = load_img(uploaded_file, target_size=IMG_SIZE)
    img_array = img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array /= 255.0
    return img_array

class_names = ['Arjun Leaf', 'Curry Leaf', 'Marsh Pennywort Leaf', 'Mint Leaf', 'Neem Leaf', 'Rubble Leaf']

st.title("Medicinal Plant Identification")

uploaded_file = st.file_uploader(label="Upload Plant Leaf Image")

if uploaded_file and st.button("Predict"):
    model = tf.keras.models.load_model('./artifacts/models/best_model.h5')
    img = preprocess_load_image(uploaded_file)
    predictions = model.predict(img)
    score = tf.nn.softmax(predictions[0])
    st.write(
        f"This image most likely belongs to {class_names[tf.argmax(score)]} with a {100 * tf.reduce_max(score):.2f} percent confidence."
    )
