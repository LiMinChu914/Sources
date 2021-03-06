# -*- coding: utf-8 -*-
"""Untitled0.ipynb

Automatically generated by Colaboratory.

Original file is located at
    https://colab.research.google.com/drive/1b6rlona3xIHhkdcXCvmJQo0BHDDhGOMO
"""

from google.colab import drive
drive._mount('/content/drive')

import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import transforms, datasets
from torch.utils.data import Dataset,DataLoader
import torch.backends.cudnn as cudnn
import matplotlib.pyplot as plt
import numpy as np
import cv2
#import tensorflow as tf
import time
import os
import copy
#import urllib.request
#import ssl
from PIL import Image
import torchvision
from torch.distributions.uniform import Uniform

import gc
gc.collect()
torch.cuda.empty_cache()

transformer_train = transforms.Compose([
    transforms.Resize((64, 64)),
    transforms.CenterCrop(64),
    transforms.ToTensor(),
    transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))
])

train_data = datasets.ImageFolder(root='/content/drive/MyDrive/kaggle/anime', transform=transformer_train)

train_loader = DataLoader(
    train_data,
    batch_size=128,
    shuffle=True,
    pin_memory=False,
    num_workers=16,
    drop_last=True)

class discriminator(nn.Module):
    def __init__(self):
        super(discriminator, self).__init__()
        self.main = nn.Sequential(
            nn.Conv2d(3, 64, 4, 2, 1, bias=False),
            nn.LeakyReLU(0.2, inplace=True),

            nn.Conv2d(64, 128, 4, 2, 1, bias=False),
            nn.BatchNorm2d(128),
            nn.LeakyReLU(0.2, inplace=True),

            nn.Conv2d(128, 256, 4, 2, 1, bias=False),
            nn.BatchNorm2d(256),
            nn.LeakyReLU(0.2, inplace=True),

            nn.Conv2d(256, 512, 4, 2, 1, bias=False),
            nn.BatchNorm2d(512),
            nn.LeakyReLU(0.2, inplace=True),

            nn.Conv2d(512, 1, 4, 1, 0, bias=False),
            #1*1*1
            nn.Sigmoid()
        )
        
    def forward(self, input):
        return self.main(input)
    
    

class generator(nn.Module):
    def __init__(self):
        super(generator, self).__init__()
        
        self.main = nn.Sequential(
            nn.ConvTranspose2d(100, 512, 4, 1, 0, bias=False),
            nn.BatchNorm2d(512),
            nn.ReLU(inplace=True),
           
            nn.ConvTranspose2d(512, 256, 4, 2, 1, bias=False),
            nn.BatchNorm2d(256),
            nn.ReLU(inplace=True),
            
            nn.ConvTranspose2d(256, 128, 4, 2, 1, bias=False),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            
            nn.ConvTranspose2d(128, 64, 4, 2, 1, bias=False),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            
            #nn.ConvTranspose2d(128, 64, 3, 1, 1, bias=False),
            #nn.BatchNorm2d(64),
            #nn.ReLU(inplace=True),
            
            nn.ConvTranspose2d(64, 3, 4, 2, 1, bias=False),
            nn.Tanh()
        )
    
    def forward(self, input):
        return self.main(input)

def show_images(images, epoch):
  grid_image = torchvision.utils.make_grid(images, normalize=True).numpy()
  plt.figure(figsize=(10,10))
  plt.axis('off')
  plt.imshow(np.transpose(grid_image, (1, 2, 0)))
  plt.savefig('/content/drive/MyDrive/DCGAN_10_Output/{}.jpg'.format(epoch))

    #sqrtn = int(np.ceil(np.sqrt(images.shape[0])))
    #for index, image in enumerate(images):
        #plt.subplot(sqrtn, sqrtn, index+1)
        #img = np.zeros((128,128,3), dtype = float)
        #img[:,:,0] = image[0]
        #img[:,:,1] = image[1]
        #img[:,:,2] = image[2]
        #plt.imshow(image.T)
        
def d_loss_function(inputs, targets):
    return nn.BCELoss()(inputs, targets)

def g_loss_function(inputs):
    targets = torch.ones(inputs.shape[0], 1)
    targets = targets.to(device)
    #targets = Uniform(0.95, 1).sample((inputs.shape[0],1)).to(device)
    return nn.BCELoss()(inputs, targets)

def weights_init(m):
    classname = m.__class__.__name__
    #print('classname:', classname)

    if classname.find('Conv') != -1:
        nn.init.normal_(m.weight.data, 0.0, 0.02)
    elif classname.find('BatchNorm') != -1:
        nn.init.normal_(m.weight.data, 1.0, 0.02)
        nn.init.constant_(m.bias.data, 0)

cudnn.benchmark = True
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(device)
#device = torch.device('cpu')

# move the models to the device
netG = generator().to(device)
netG.apply(weights_init)
netD = discriminator().to(device)
netD.apply(weights_init)

hist_lossD = []
hist_lossG = []

optimizerD = optim.Adam(netD.parameters(), lr = 0.0002, betas=(0.5, 0.999))
optimizerG = optim.Adam(netG.parameters(), lr = 0.0002, betas=(0.5, 0.999))

start_epoch = 0
epochs = 201

fixed_noise = ((torch.rand(64,100,1,1)-0.5)/0.5).to(device)

checkpoint = torch.load('/content/drive/MyDrive/DCGAN_12.pth')
fixed_noise = checkpoint['fixed'].to(device)

checkpoint = torch.load('/content/drive/MyDrive/DCGAN_12.pth')
netD.load_state_dict(checkpoint['modelD'])
netG.load_state_dict(checkpoint['modelG'])
#optimizerD.load_state_dict(checkpoint['optimizerD'])
optimizerD = optim.Adam(netD.parameters(), lr = 0.00005, betas=(0.5, 0.999))
optimizerG.load_state_dict(checkpoint['optimizerG'])
hist_lossD = checkpoint['lossD']
hist_lossG = checkpoint['lossG']
#optimizerG = optim.Adam(netG.parameters(), lr = 0.0002, betas=(0.5, 0.999))
start_epoch = checkpoint['epoch']+1

for epoch in range(start_epoch, epochs):
    for times, data in enumerate(train_loader):
        times += 1

        real_inputs = data[0].to(device)
        
       
        optimizerD.zero_grad()
        real_inputs = real_inputs.view(-1, 3, 64, 64)  
        real_outputs = netD(real_inputs)
        real_label = torch.ones(real_inputs.shape[0], 1).to(device)
        errD_real = d_loss_function(real_outputs.reshape(real_inputs.shape[0], 1), real_label)
        errD_real.backward()
        
        noise = (torch.rand(real_inputs.shape[0], 100, 1, 1) - 0.5) / 0.5
        noise = noise.to(device)
        fake_inputs = netG(noise)
        fake_outputs = netD(fake_inputs.detach())
        fake_label = torch.zeros(fake_inputs.shape[0], 1).to(device)
        errD_fake = d_loss_function(fake_outputs.reshape(real_inputs.shape[0], 1), fake_label)
        errD_fake.backward()
        errD = errD_fake + errD_real
        optimizerD.step()
        

        fake_outputs = netD(fake_inputs)
        errG = g_loss_function(fake_outputs.reshape(real_inputs.shape[0], 1))   
        optimizerG.zero_grad()
        errG.backward()
        optimizerG.step()
        
        hist_lossD.append(errD.item())
        hist_lossG.append(errG.item())
        if times % 100 == 0 or times == len(train_loader):
            print('[{}/{}, {}/{}] D_loss: {:.3f} G_loss: {:.3f}'.format(epoch, epochs, times, len(train_loader), errD.item(), errG.item()))

    
    #print('[{}/{}, {}/{}] D_loss: {:.3f} G_loss: {:.3f}'.format(epoch, epochs, times, len(train_loader), errD.item(), errG.item()))
    
    if epoch % 3 == 0:
        state = { 'modelG': netG.state_dict(), 'modelD': netD.state_dict(), 'optimizerG':optimizerG.state_dict(), 'optimizerD':optimizerD.state_dict(), 'epoch': epoch, 'lossD': hist_lossD, 'lossG': hist_lossG, 'fixed': fixed_noise}   
        torch.save(state, '/content/drive/MyDrive/DCGAN_12.pth')
        print("checkpoint!")

    if epoch % 10 == 0:
        plt.figure(figsize=(10, 5))
        plt.plot(hist_lossG, label='G Loss')
        plt.plot(hist_lossD, label='D Loss')
        plt.xlabel('Iterations')
        plt.ylabel('Loss')
        plt.title('Generator and Discriminator Loss With Epoch {}'.format(epoch))
        plt.legend()
        plt.savefig('/content/drive/MyDrive/DCGAN_12_Output/statistics{}.jpg'.format(epoch))
        torch.save(netD.state_dict(), '/content/drive/MyDrive/DCGAN_12_D_epoch{}.pth'.format(epoch))
        torch.save(netG.state_dict(), '/content/drive/MyDrive/DCGAN_12_G_epoch{}.pth'.format(epoch))
        
    imgs_numpy = netG(fixed_noise).data.cpu()
    #print(imgs_numpy.shape)
    show_images(imgs_numpy, epoch)
    plt.show()
    gc.collect()

gc.collect()







