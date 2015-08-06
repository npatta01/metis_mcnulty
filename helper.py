import numpy as np
import os
import glob
import pandas as pd
import sklearn.base
from sklearn.base import TransformerMixin
from sklearn.feature_extraction import image
import cv2
from skimage.feature import hog

from skimage.morphology import disk
from skimage.filters import threshold_otsu, rank
from sklearn.cross_validation import StratifiedShuffleSplit
from multiprocessing import Pool 
from functools import partial
from multiprocessing.pool import ThreadPool


def get_cifar_training_data(folder_path,label_file):
#train_file_df.columns = ['id','filename','full_filename']
    elems=[]
    for filename in os.listdir(folder_path):
        fileid= filename.replace(".png","") # replace .png
        full_filename = os.path.join(folder_path,filename) #get full path
        elems.append({'id':fileid, 'filename':filename, 'full_filename':full_filename})
    train_file_df=pd.DataFrame(elems) # give a file name -> ( label, full path)
    
    train_labels = pd.read_csv(label_file,dtype='object')

    train_file_df=pd.merge(train_labels,train_file_df,on=['id'])

    return train_file_df
    

class SimpleModePredictor(sklearn.base.ClassifierMixin,sklearn.base.BaseEstimator):
    
    
    def predict(self,values):
        return [self.mostCommon] * len(values)
    def fit(self,values,labels):
        self.mostCommon=None
        mode_val= labels.mode().ix[0]
        self.mostCommon=mode_val
        print (self.mostCommon) 
        
        
class ColorChannelStatistics(TransformerMixin):
    
    def __init__(self,sub_regions=1,color_plane='RGB'):
        self.sub_regions=sub_regions
        self.color_plane=color_plane
    
    def transform(self,X, **transform_params):
        extracted_vals=[]
        for one_image in X:
            extracted_val={}
            
            for clr_idx,clr_plane in enumerate(self.color_plane):
                single_img_plane=one_image[:,:,clr_idx]
                #print(single_img_plane.shape)
                patches = get_image_slices(single_img_plane, self.sub_regions)
                #print 'patchs' , len(patches)
                for patch_idx,patch in enumerate(patches):
                    #print('patch_idx_'+str(patch_idx))
                    
                    patch_name='cp=%s_patch=%s_'%(clr_plane,patch_idx)
                    extracted_val[patch_name+'mean']=patch.mean()
                    extracted_val[patch_name+'std']=patch.std()
                    
            extracted_vals.append(extracted_val)
            #print(extracted_vals)
        result=pd.DataFrame(extracted_vals)
        self.feature_names_ = result.columns
        return result
        
        
    def fit(self, X, y=None, **fit_params):
        return self
        
        
    def get_feature_names(self):
        """Returns a list of feature names, ordered by their indices.
        If one-of-K coding is applied to categorical features, this will
        include the constructed feature names but not the original ones.
        """
        return self.feature_names_
        


class GrayScaleImageTransform(TransformerMixin):        
      

        
    def transform(self,X, **transform_params):
        results=[]
        for one_image in X:
            gray_image = cv2.cvtColor(one_image, cv2.COLOR_BGR2GRAY)
            results.append(gray_image)
        return results
        
    def fit(self, X, y=None, **fit_params):
        return self

class HogStatistics(TransformerMixin):

    def transform(self,X, **transform_params):
        results=[]
        for gray_image in X:
            hog_image=hog(gray_image)
            results.append(hog_image)
        return results
        
    def fit(self, X, y=None, **fit_params):
        return self
        
    

def get_stratified_train_test_split(features,labels,test_size=0.30,random_state=42):
    split_idxes=next(iter(StratifiedShuffleSplit(labels,n_iter =1,test_size=test_size,random_state=random_state)))
    train_index, test_index = split_idxes
    X_train, X_test = features.ix[train_index,:], features.ix[test_index,:]
    y_train, y_test = labels[train_index], labels[test_index]
    
    return X_train,X_test,y_train,y_test
    
    
        
def get_image_slices(image_to_split,splits):
    windowsize_r=image_to_split.shape[0]/splits
    windowsize_c=image_to_split.shape[1]/splits
    
    regions=[]
    #print windowsize_r,windowsize_c,splits
    # Crop out the window and calculate the histogram
    for r in range(0,image_to_split.shape[0] - windowsize_r+1, windowsize_r):
        for c in range(0,image_to_split.shape[1] - windowsize_c+1, windowsize_c):
            window = image_to_split[r:r+windowsize_r,c:c+windowsize_c]
            regions.append(window)
            #print r,r+windowsize_r,c,c+windowsize_c
    return regions
    
def load_images(file_paths):
    for img_path in file_paths:
        
        yield load_image(img_path)
def load_image(file_path):
    img=cv2.imread(file_path)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    return img    

#@TaskGenerator
def extract_image_feature(feature_extractors,image_path):
    #feature_matrix=[]
    img=load_image(image_path)
    _features=None
    sub_ft=[]
    for fe in feature_extractors:
        sub_ft.append(fe.transform([img]))
            
    _features=np.hstack(tuple(sub_ft))
    
    return _features
    
def extract_multiple_image_features(feature_extractors,image_paths):
    partial_harvester = partial(extract_image_feature, feature_extractors)

    pool = ThreadPool(4)
    results=pool.map(partial_harvester, image_paths)
    pool.close() 
    pool.join()
    
    #results=[extract_image_feature(feature_extractors,n) for n in image_paths]
    return results
    #return value(results)
    
if __name__ == "__main__":
    k=7

        
