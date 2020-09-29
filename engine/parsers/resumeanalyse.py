from sklearn.feature_extraction.text import CountVectorizer
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import GaussianNB
import pickle
from os import path

def analyse_resume(resumeText, emailBody, emailSubject):
    filepath_dict = {'resumeData':   'data/resume_extractor/resume.txt'}
    model_path = 'ml_model/isresume.sav'
    df_list = []
    for source, filepath in filepath_dict.items():
        df = pd.read_csv(filepath, names=['sentence', 'label'], sep='\t')
        df['source'] = source  # Add another column filled with the source name
        df_list.append(df)

    df = pd.concat(df_list)
    for source in df['source'].unique():
        df_source = df[df['source'] == source]
        sentences = df_source['sentence'].values
        labels = df_source['label'].values
        
        vectorizer = CountVectorizer()
        vectorizer.fit(sentences)
        
        if path.exists(model_path):
            classifier = pickle.load(open(model_path, 'rb'))
        else:
            X_train = vectorizer.transform(sentences)
            classifier=GaussianNB()
            classifier.fit(X_train.toarray(), labels)
            # save the model to disk
            pickle.dump(classifier, open(model_path, 'wb'))

        vp_rt=classifier.predict(vectorizer.transform([resumeText]).toarray())
        if emailBody is not None:
            vp_eb=classifier.predict(vectorizer.transform([emailBody]).toarray())
        if emailBody is not None:
            vp_es=classifier.predict(vectorizer.transform([emailSubject]).toarray())

        if (vp_rt[0] == 1):
            print("This is a resume")
            return True
        return False

        #print('Accuracy for {} data: {:.4f}'.format(source, score))
