#!/usr/bin/env python3
"""Python module to test the model.

Requires:
    tensorflow >= 2.6
    keras >= 2.6
    numpy >= 1.9.0
"""
import tensorflow as tf
import numpy as np
import keras
import re
import os


def load_data(path: str = 'TestData/', resize_to: int = 32):
    preprocess = keras.Sequential([
        keras.layers.Resizing(resize_to, resize_to, interpolation='nearest'),
        keras.layers.Rescale(1/255.)
    ])
    images_path: list = os.listdir(path)
    images: list = []
    labels: list = []
    for im in images_path:
        image = keras.preprocessing.image.load_img(path+im, color_mode="grayscale")
        image = keras.preprocessing.image.img_to_array(image)
        image = preprocess(image)
        images.append(image)
        label = int(re.findall('[0-9]', im)[0])
        labels.append(label)
    return np.array(images), np.array(labels)


def test_loading_model(path: str = 'tfjs/Mnet_V2.h5'):
    assert os.path.exists(path) is True
    return keras.models.load_model(path)


def test_model_accuracy():
    model =
