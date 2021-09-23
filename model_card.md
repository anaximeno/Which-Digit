# Model Card - The Digit Recognition Web App

The model used in the Digit Recognition Web App can recognize which numbers were drawn by you. It was trained using two python frameworks for Machine Learning and Deep Learning Tensorflow, Keras and another JavaScript framework used for inference the TensorflowJS.

## Model Description

### Author

Anaxímeno Brito

### Input

32 x 32 Image

### Output

For each drawing, the model outputs ten probabilities corresponding to the chance of being each of the ten digits (0 to 9), and the digit with greater probability will be considered as the result.

### Model Date

September 2021

### Model Version

Mnet V2

### Model architecture

Convolutional Neural Network based architecture


## Inteded Use

The Digit Recognition Model was built to be used on this web application and explore the application of Deep Learning in real-life situations. The intended users are persons who want to test this Web App or explore this model's capabilities.


## Training Data

The data used to train was the [MNIST dataset](http://yann.lecun.com/exdb/mnist/ "Mnist Dataset"), which consists of a set of black and white images with digits between 0 to 9. Since the digits are centered on the image, it was necessary to apply certain arbitrary transformations before train the model like translations, zooms, and rotations, which made the model predict quite well on different conditions. I also applied another transformation during training, increasing images sizes to 32x32 because I believe it is a better input format for this application.  
If you want to see the how it was trained [just click this link](https://colab.research.google.com/drive/1fxzuPJkmSxQ6_pjnB6UHdkJoke2NlAR8 "Training Digit Model V5").

