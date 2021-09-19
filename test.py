#!/usr/bin/env python3
"""Python module to test the model's Performance.

Requires:
    tensorflow >= 2.5
    keras >= 2.5
    numpy >= 1.9.2
    pytest >= 6.2.5
"""
import tensorflow as tf
import numpy as np
import keras
import re
import os
import warnings
warnings.simplefilter('ignore')


MODEL_PATH = 'tfjs/Mnet_V2.h5'
IMAGES_DIR_PATH = 'TestData/'
INPUT_SIZE = 32
IMAGE_RESIZE_TO = 32
IMAGE_PADDING = 0
# Below I added zeros on the last padding for the last dimension of the image when it is loaded
PADDING = [[IMAGE_PADDING, IMAGE_PADDING], [IMAGE_PADDING, IMAGE_PADDING], [0, 0]]


def test_sizes():
    assert INPUT_SIZE == IMAGE_RESIZE_TO + IMAGE_PADDING * 2


def load_data(path: str = IMAGES_DIR_PATH):
    preprocess = keras.Sequential([
        keras.layers.experimental.preprocessing.Resizing(IMAGE_RESIZE_TO, IMAGE_RESIZE_TO, interpolation='nearest'),
        keras.layers.experimental.preprocessing.Rescaling(1/255.)
    ])
    images_path: list = os.listdir(path)
    images: list = []
    labels: list = []
    for im in images_path:
        image = keras.preprocessing.image.load_img(path+im, color_mode="grayscale")
        image = keras.preprocessing.image.img_to_array(image)
        image = tf.pad(preprocess(image), PADDING)
        images.append(image)
        label = int(re.findall('[0-9]', im)[0])
        labels.append(label)
    return np.array(images), np.array(labels)


def test_loading_model(path: str = MODEL_PATH):
    assert os.path.exists(path) is True
    return keras.models.load_model(path)


def test_model_accuracy():
    model = test_loading_model()
    images, labels = load_data()
    predictions = np.argmax(model(images), axis=1)

    assert tf.reduce_all(predictions == labels).numpy()
