#!/usr/bin/env python3
"""Python module to test the model's Performance.

Requires:
    tensorflow >= 2.6
    keras >= 2.6
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


print('TF:', tf.__version__)
print('Keras:', keras.__version__)


IMAGES_DIR_PATH = 'data/testdata/'
PATH_TO_MODEL = 'data/models/Mnet_v3.h5'
INPUT_SIZE = 36
IMAGE_RESIZE_TO = 34
IMAGE_PADDING = 1
# Below I added zeros on the last padding for the last dimension of the image when it is loaded
PADDING = [[IMAGE_PADDING, IMAGE_PADDING], [IMAGE_PADDING, IMAGE_PADDING], [0, 0]]


def test_sizes():
    assert INPUT_SIZE == IMAGE_RESIZE_TO + IMAGE_PADDING * 2


def load_data():
    preprocess = keras.Sequential([
        keras.layers.Resizing(IMAGE_RESIZE_TO, IMAGE_RESIZE_TO, interpolation='nearest'),
        keras.layers.Rescaling(1/255.)
    ])
    images_path: list = os.listdir(IMAGES_DIR_PATH)
    images: list = []
    labels: list = []
    for im in images_path:
        image = keras.preprocessing.image.load_img(IMAGES_DIR_PATH+im, color_mode="grayscale")
        image = keras.preprocessing.image.img_to_array(image)
        image = tf.pad(preprocess(image), PADDING)
        images.append(image)
        label = int(re.findall('[0-9]', im)[0])
        labels.append(label)
    return np.array(images), np.array(labels)


def test_model_accuracy():
    model = keras.models.load_model(PATH_TO_MODEL)
    images, labels = load_data()
    predictions = np.argmax(model(images), axis=1)
    assert tf.reduce_all(predictions == labels).numpy()
